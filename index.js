const puppeteer = require("puppeteer");
const config = require("./config.json");
(async () => {
    const browser = await puppeteer.launch({
        headless: config.headless,
        args: ["--disable-notifications"],
    });
    const page = await browser.newPage();

    async function type(xpath, text) {
        await page.waitForXPath(xpath, {
            visible: true,
            timeout: 0,
        });
        const input = await page.$x(xpath);
        if (input) await input[0].type(text);
    }
    async function click(xpath) {
        await page.waitForXPath(xpath, {
            visible: true,
            timeout: 0,
        });
        const button = await page.$x(xpath);
        if (button) await button[0].click();
    }

    for (let i = 0; i < config.count; i++) {
        await create();
        console.log(`Account ${i + 1} created. [${process.pid}]`);
    }

    console.log("Done！");
    browser.close();

    async function create() {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36");
        await page.goto(config.link);

        // Select Spanish
        await click(`//*[@id="root"]/div/div/span/div/div/div/ul/button[1]`);

        // Exit
        await click("/html/body/div[1]/div/div/div/div[1]/div/button");

        // Create profile
        await click("/html/body/div[1]/div/div[4]/div/div/div[1]/div[2]/button[1]");

        // Creating profile

        let user = {};
        user.email = require("faker").internet.userName()+"."+require("crypto").randomBytes(12).toString("base64").replace(/\//g,"").replace(/\+/g,"").replace(/\=/g,"")+"@gmail.com"
        user.age = "5";

        // Age 5 (doesnt automaticly follow)
        await type("/html/body/div[2]/div[5]/div/div/form/div[1]/div[1]/div[1]/label/div/input", user.age);

        // Input random gmail
        await type("/html/body/div[2]/div[5]/div/div/form/div[1]/div[1]/div[3]/label/div/input", user.email);

        // Input random password
        await type("/html/body/div[2]/div[5]/div/div/form/div[1]/div[1]/div[4]/label/div/input", user.email);

        // Register
        await click("/html/body/div[2]/div[5]/div/div/form/div[1]/button");

        // Clear cookies
        const client = await page.target().createCDPSession();
        await client.send("Network.clearBrowserCookies");
    }
})();
