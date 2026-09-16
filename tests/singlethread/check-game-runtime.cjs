const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../../loader/bin/Release/net10.0/publish/wwwroot');
const server = http.createServer((req, res) => {
  const target = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!target.startsWith(root + path.sep)) {res.writeHead(403); res.end(); return;}
  const mime = target.endsWith('.js') ? 'text/javascript' : target.endsWith('.json') ? 'application/json' : 'application/wasm';
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', mime);
  const stream = fs.createReadStream(target);
  stream.on('error', () => {res.writeHead(404); res.end();});
  stream.pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(8769, '127.0.0.1', resolve));
  const browser = await chromium.launch({executablePath: process.env.CELESTE_CHROMIUM, headless: true});
  try {
    const page = await browser.newPage();
    page.on('console', message => console.log(message.text()));
    page.on('pageerror', error => console.error(error.stack));
    await page.goto(pathToFileURL(path.join(__dirname, 'game-runtime.html')).href);
    await page.waitForFunction(() => !document.querySelector('#result').textContent.startsWith('Starting'), undefined, {timeout: 60000});
    const result = await page.locator('#result').textContent();
    const evidence = {isolated: await page.evaluate(() => crossOriginIsolated), result};
    console.log(evidence);
    fs.writeFileSync(path.join(__dirname, 'runtime-result.json'), JSON.stringify(evidence, null, 2));
    if (result !== 'GAME_RUNTIME_MOUNT_PASS') process.exitCode = 1;
  } finally {await browser.close(); server.close();}
})().catch(error => {console.error(error); server.close(); process.exitCode = 1;});
