// File-origin storage for the single-thread WASMFS backend.
// Installed before runtime startup; HTTPS continues using native OPFS.
if (location.protocol === 'file:') {
  const db = new Promise((resolve, reject) => {
    const request = indexedDB.open('celeste-single-file-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('entries');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  async function transact(mode, work) {
    const database = await db;
    return new Promise((resolve, reject) => {
      const tx = database.transaction('entries', mode);
      let result;
      try { result = work(tx.objectStore('entries')); }
      catch (error) { tx.abort(); reject(error); return; }
      tx.oncomplete = () => resolve(result?.result);
      tx.onabort = tx.onerror = () => reject(tx.error || new Error('Storage transaction failed'));
    });
  }
  const read = path => transact('readonly', store => store.get(path));
  const put = (path, value) => transact('readwrite', store => store.put(value, path));
  const keys = () => transact('readonly', store => store.getAllKeys());
  const error = (name, message) => new DOMException(message, name);
  function child(path, name) {
    if (!name || name === '.' || name === '..' || /[\/\\]/.test(name)) throw new TypeError('Invalid file name');
    return path ? path + '/' + name : name;
  }
  class Handle {
    constructor(path, kind) { this.path = path; this.kind = kind; this.name = path.split('/').pop(); }
    async isSameEntry(other) { return other instanceof Handle && other.path === this.path && other.kind === this.kind; }
    async queryPermission() { return 'granted'; }
    async requestPermission() { return 'granted'; }
  }
  class Directory extends Handle {
    constructor(path) { super(path, 'directory'); }
    async getHandle(name, kind, options = {}) {
      const path = child(this.path, name);
      // Check/create atomically so concurrent callers cannot truncate a new file.
      const database = await db;
      await new Promise((resolve, reject) => {
        const tx = database.transaction('entries', 'readwrite');
        const store = tx.objectStore('entries');
        let failure;
        const request = store.get(path);
        request.onsuccess = () => {
          const entry = request.result;
          if (entry && entry.kind !== kind) failure = error('TypeMismatchError', name);
          else if (!entry && !options.create) failure = error('NotFoundError', name);
          else if (!entry) store.put({kind, data: new Blob([])}, path);
          if (failure) tx.abort();
        };
        tx.oncomplete = resolve;
        tx.onabort = tx.onerror = () => reject(failure || tx.error);
      });
      return kind === 'directory' ? new Directory(path) : new FileHandle(path);
    }
    getDirectoryHandle(name, options) { return this.getHandle(name, 'directory', options); }
    getFileHandle(name, options) { return this.getHandle(name, 'file', options); }
    async *entries() {
      const prefix = this.path ? this.path + '/' : '';
      for (const path of await keys()) {
        if (!path.startsWith(prefix)) continue;
        const name = path.slice(prefix.length);
        if (!name || name.includes('/')) continue;
        const entry = await read(path);
        if (entry) yield [name, entry.kind === 'directory' ? new Directory(path) : new FileHandle(path)];
      }
    }
    [Symbol.asyncIterator]() { return this.entries(); }
    async *values() { for await (const [, handle] of this.entries()) yield handle; }
    async *keys() { for await (const [name] of this.entries()) yield name; }
    async resolve(handle) {
      if (!(handle instanceof Handle)) return null;
      if (handle.path === this.path) return [];
      const prefix = this.path ? this.path + '/' : '';
      return handle.path.startsWith(prefix) ? handle.path.slice(prefix.length).split('/') : null;
    }
    async removeEntry(name, options = {}) {
      const path = child(this.path, name);
      if (!await read(path)) throw error('NotFoundError', name);
      const descendants = (await keys()).filter(key => key.startsWith(path + '/'));
      if (descendants.length && !options.recursive) throw error('InvalidModificationError', 'Directory is not empty');
      await transact('readwrite', store => { for (const key of [path, ...descendants]) store.delete(key); });
    }
  }
  class FileHandle extends Handle {
    constructor(path) { super(path, 'file'); }
    async getFile() {
      const entry = await read(this.path);
      if (!entry) throw error('NotFoundError', this.name);
      return new File([entry.data], this.name, {lastModified: entry.modified || 0});
    }
    async createWritable(options = {}) {
      let data = options.keepExistingData ? await this.getFile() : new Blob([]);
      let position = 0;
      const integer = value => { if (!Number.isSafeInteger(value) || value < 0) throw new TypeError('Invalid offset'); return value; };
      const write = async chunk => {
        if (chunk && typeof chunk === 'object' && 'type' in chunk && !(chunk instanceof Blob)) {
          if (chunk.type === 'seek') { position = integer(chunk.position); return; }
          if (chunk.type === 'truncate') {
            const size = integer(chunk.size);
            data = size < data.size ? data.slice(0, size) : new Blob([data, new Uint8Array(size - data.size)]);
            position = Math.min(position, size); return;
          }
          if (chunk.type !== 'write') throw new TypeError('Unknown write operation');
          if (chunk.position !== undefined) position = integer(chunk.position);
          chunk = chunk.data;
        }
        const bytes = new Blob([chunk]);
        data = new Blob([data.slice(0, position), new Uint8Array(Math.max(0, position - data.size)), bytes, data.slice(position + bytes.size)]);
        position += bytes.size;
      };
      const stream = new WritableStream({write, close: () => put(this.path, {kind: 'file', data, modified: Date.now()})});
      const call = async (method, value) => { const writer = stream.getWriter(); try { return await writer[method](value); } finally { writer.releaseLock(); } };
      stream.write = chunk => call('write', chunk);
      stream.seek = position => stream.write({type: 'seek', position});
      stream.truncate = size => stream.write({type: 'truncate', size});
      stream.close = () => call('close');
      return stream;
    }
  }
  Object.defineProperty(navigator.storage, 'getDirectory', {value: async () => { await db; return new Directory(''); }});
}
