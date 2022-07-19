const { webkit } = require('playwright');
const { createServer, request } = require('https');
const { readFileSync } = require('fs');

const appId = '' // Get from Facebook Developers portal
const appSecret = '' // Get from Facebook Developers portal
const redirectUri = 'https://localhost:3000/callback'
const username = '' // Get from Facebook Developers portal
const password = '' // Get from Facebook Developers portal
const authorizationWindowUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`


const options = {
  key: readFileSync('./keys/localhost-key.pem'),
  cert: readFileSync('./keys/localhost.pem')
};

(async () => {
  const server = createServer(options, (req, res) => {
    const url = new URL(req.url, `https://${req.headers.host}`)
    const accessTokenUrl = `https://api.instagram.com/oauth/access_token`
    const accessTokenFormData = new URLSearchParams()

    accessTokenFormData.append('client_id', appId)
    accessTokenFormData.append('client_secret', appSecret)
    accessTokenFormData.append('grant_type', 'authorization_code')
    accessTokenFormData.append('redirect_uri', redirectUri)
    accessTokenFormData.append('code', url.searchParams.get('code'))

    const req2 = request(accessTokenUrl, { method: 'POST' }, (res2) => {
      res2.on('data', (chunk) => console.log(chunk.toString('utf8')))
      res2.on('end', () => {
        browser.close().then(() => {
          res.end('ok')
          server.close()
        })
      })
    })
    req2.setHeader('Content-Type', 'application/x-www-form-urlencoded')
    req2.write(accessTokenFormData.toString())
    req2.end()
  }).listen(3000);

  const browser = await webkit.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(authorizationWindowUrl);
  await page.locator('[name="username"]').fill(username);
  await page.locator('[name="password"]').fill(password);
  await page.locator('text="Log In"').click();
  await page.locator('text="Not now"').click();
  await page.locator('text="Allow"').click();
})();
