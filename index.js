const puppeteer = require('puppeteer');
require('dotenv').config();

const username = process.env.twitter_username;
const password = process.env.twitter_password;

// let browser = null;
// let page = null;

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800, isMobile: false });

  await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

  await page.type('input[name="session[username_or_email]"]', username, {
    delay: 150,
  });
  await page.type('input[name="session[password]"]', password, {
    delay: 150,
  });
  await page.click('div[data-testid="LoginForm_Login_Button"]');
  await page.waitFor(5000);

  await page.waitFor('input[data-testid="SearchBox_Search_Input"]');
  await page.type(
    'input[data-testid="SearchBox_Search_Input"]',
    '#bbnaija2020lockdown',
    {
      delay: 150,
    }
  );
  await page.keyboard.press('Enter');
  await page.waitFor(5000);

  let authorsSet = new Set();
  try {
    let previousHeight;
    for (let i = 0; i < 20; i++) {
      const elementHandles = await page.$$(
        'a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-sdzlij.r-1loqt21.r-1adg3ll.r-ahm1il.r-1udh08x.r-o7ynqc.r-6416eg.r-13qz1uu'
      );
      const propertyJsHandles = await Promise.all(
        elementHandles.map((handle) => handle.getProperty('href'))
      );
      const urls = await Promise.all(
        propertyJsHandles.map((handle) => handle.jsonValue())
      );

      urls.forEach((item) => authorsSet.add(item));

      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );
      await page.waitFor(3000);
    }
  } catch (e) {
    console.log(e);
  }

  console.log(authorsSet);

  const urls = Array.from(authorsSet);
  for (let i = 0; i < urls.length; i++) {
    try {
      const url = urls[i];
      console.log(url);
      await page.goto(`${url}`);

      await page.waitFor(3000);
      await page.click(
        'div[class="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1vuscfd r-1dhvaqw r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]'
      );
      await page.waitFor(15 * 60 * 1000);
      await page.goBack();
    } catch (error) {
      console.error(error);
    }
  }
})();
