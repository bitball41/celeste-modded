// Assembly downloads without the worker required by the WASMFS fetch backend.
#include <emscripten.h>
#include <errno.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
static char *assembly_base;
static char *assembly_mount;
EM_ASYNC_JS(void *, fetch_assembly_bytes, (const char *url, int *length), {
    try {
        const response = await fetch(UTF8ToString(url));
        if (!response.ok) throw new Error(`Assembly download failed (${response.status})`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        const ptr = _malloc(bytes.length || 1);
        if (!ptr) throw new Error('Assembly allocation failed');
        HEAPU8.set(bytes, ptr);
        HEAP32[length >> 2] = bytes.length;
        return ptr;
    } catch (error) { console.error(error); return 0; }
});
int mount_fetch(char *source, char *destination) {
    char *new_base = strdup(source), *new_mount = strdup(destination);
    if (!new_base || !new_mount) { free(new_base); free(new_mount); return -ENOMEM; }
    free(assembly_base); free(assembly_mount);
    assembly_base = new_base; assembly_mount = new_mount;
    return mkdir(destination, 0777) == 0 || errno == EEXIST ? 0 : -errno;
}
int mount_fetch_file(char *path) {
    if (!assembly_base || strncmp(path, assembly_mount, strlen(assembly_mount))) return -EINVAL;
    const char *name = path + strlen(assembly_mount);
    char *url = malloc(strlen(assembly_base) + strlen(name) + 1);
    if (!url) return -ENOMEM;
    strcpy(url, assembly_base); strcat(url, name);
    int length = 0;
    void *data = fetch_assembly_bytes(url, &length);
    free(url);
    if (!data) return -EIO;
    int fd = open(path, O_CREAT | O_TRUNC | O_WRONLY, 0666);
    if (fd < 0) { free(data); return -errno; }
    int offset = 0;
    while (offset < length) {
        ssize_t n = write(fd, (char *)data + offset, length - offset);
        if (n <= 0) { int err = errno; close(fd); free(data); return -(err ? err : EIO); }
        offset += n;
    }
    free(data);
    return close(fd);
}
