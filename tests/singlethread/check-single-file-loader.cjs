const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');

const project = path.resolve(__dirname, '../..');
const dist = path.join(project, 'frontend/dist');
const runtime = path.join(project, 'loader/bin/Release/net10.0/publish/wwwroot');
const manifest = fs.readFileSync(path.join(dist, '.vite/manifest.json'));
const sha = 'a'.repeat(40);

(async () => {
  const browser = await chromium.launch({executablePath: process.env.CELESTE_CHROMIUM, headless: true});
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => console.error(error));
    await page.route('https://api.github.com/repos/Bitball41/celeste-modded/commits/runtime', route =>
      route.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify({sha})}));
    await page.route(`https://cdn.jsdelivr.net/gh/Bitball41/celeste-modded@${sha}/**`, async route => {
      const name = decodeURIComponent(new URL(route.request().url()).pathname.split(`@${sha}/`)[1]);
      if (name === 'manifest.json') {
        await route.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: manifest});
        return;
      }
      const base = name.startsWith('_framework/') ? runtime : dist;
      const file = path.resolve(base, name);
      if (!file.startsWith(base + path.sep) || !fs.existsSync(file)) {
        await route.fulfill({status: 404, headers: {'access-control-allow-origin': '*'}, body: 'Not found'});
        return;
      }
      const contentType = name.endsWith('.js') ? 'text/javascript'
        : name.endsWith('.wasm') ? 'application/wasm'
        : name.endsWith('.css') ? 'text/css' : 'application/octet-stream';
      await route.fulfill({status: 200, contentType, headers: {'access-control-allow-origin': '*'}, path: file});
    });
    await page.goto(pathToFileURL(path.join(project, 'Celeste-Modded-v13.html')).href);
    await page.getByRole('button', {name: 'Tornado Valley'}).click();
    await page.getByRole('button', {name: 'Copy local Celeste assets'}).waitFor({timeout: 60000});
    const selection = await page.evaluate(() => globalThis.__weblesteStandaloneSelection);
    if (selection.bundle !== 'tornado-valley' || selection.save !== 'tornado-valley')
      throw new Error('Standalone bundle or save selection was lost');
    console.log('STANDALONE_FILE_LAUNCH_PASS', selection);
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
