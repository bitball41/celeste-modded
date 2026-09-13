const {chromium} = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
(async () => {
  const html = '/tmp/celeste-storage-check.html';
  fs.writeFileSync(html, '<!doctype html><title>Storage check</title>');
  const browser = await chromium.launch({executablePath: process.env.CELESTE_CHROMIUM, headless:true});
  try {
    const page = await browser.newPage();
    const adapter = path.resolve(__dirname, '../../frontend/public/local-file-storage.js');
    await page.goto('file://' + html);
    await page.addScriptTag({path:adapter});
    console.log(await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('test', {create:true});
      const file = await dir.getFileHandle('save', {create:true});
      const writer = await file.createWritable();
      await writer.write('abc'); await writer.seek(5); await writer.write('z'); await writer.close();
      const bytes = [...new Uint8Array(await (await file.getFile()).arrayBuffer())];
      if (bytes.join() !== '97,98,99,0,0,122') throw Error(bytes);
      const abandoned = await file.createWritable(); await abandoned.write('bad'); await abandoned.abort();
      if ((await file.getFile()).size !== 6) throw Error('Abort changed file');
      return 'write/seek/abort passed';
    }));
    await page.reload(); await page.addScriptTag({path:adapter});
    console.log(await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('test');
      const file = await dir.getFileHandle('save');
      if ((await file.getFile()).size !== 6) throw Error('Persistence failed');
      await root.removeEntry('test', {recursive:true});
      return 'reload persistence/delete passed';
    }));
  } finally { await browser.close(); }
})().catch(e => {console.error(e);process.exitCode=1;});
