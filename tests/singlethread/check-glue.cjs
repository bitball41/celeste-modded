const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'celeste-glue-'));
try {
  for (const indent of ['', '  ', '    ']) {
    const file = path.join(dir, 'native.js');
    fs.writeFileSync(file, `var Module = moduleArg;\ncreateDotnetRuntime = Module = moduleArg(Module);\n${indent}if (Module['preInit']) {\n}\n// Begin runtime exports\nModule['addRunDependency'] = addRunDependency;\n// End runtime exports\nModule['_test'] = wasmExports['test'];\n`);
    execFileSync(process.execPath, [path.join(__dirname, 'modernize-native.cjs'), file]);
    const first = fs.readFileSync(file, 'utf8');
    assert(first.indexOf("Module['addRunDependency'] =") < first.indexOf("if (Module['preInit'])"));
    assert(first.includes('var _scriptDir, __dirname, createDotnetRuntime;'));
    execFileSync(process.execPath, [path.join(__dirname, 'modernize-native.cjs'), file]);
    assert.equal(fs.readFileSync(file, 'utf8'), first);
  }
  console.log('Glue patch handles indentation and is idempotent');
} finally { fs.rmSync(dir, {recursive:true, force:true}); }
