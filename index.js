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

        // Accept cookies
        await click("/html/body/div[3]/div[2]/div/div[1]/div/div[2]/div/button[2]");

        // Select German
        await click("/html/body/div[1]/div/div/span/div/div/div/ul/a[4]");

        // Select first in the page "Where did you hear about us" (Doesnt need to be friends)
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/div/label[1]/span");

        // Continue
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/button");

        let selector = "_2YmyD";
        await page.waitForFunction((selector) => document.getElementsByClassName(selector)[0]?.attributes["aria-valuenow"].value == 1, {}, selector);

        let text = await page.evaluate(() => {
            return document.getElementsByClassName("DYCFd")[0].textContent;
        });
        console.log(text);
        if (text !== "Why are you learning a language?") {
            // How much of German do you know?
            await click("/html/body/div[1]/div/div/div/div[2]/div/div/div/label[1]/div/div");

            // Continue
            await click("/html/body/div[1]/div/div/div/div[2]/div/div/button");
        }

        // Why are you learning a language? page
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/div/ul/div[1]");

        // Continue
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/button");

        // Continue
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/button");

        // Continue
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/button");

        // Not now
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/ul/li[3]/button");

        // Beginer
        await click("/html/body/div[1]/div/div/div/div[2]/div/div/div/button[1]");

        // Exit
        await click("/html/body/div[1]/div/div/div/div/div[1]/div/div/button");

        // Create profile
        await click("/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/button[1]");

        // Creating profile

        let user = require("faker").helpers.createCard();
        user.password = require("faker").internet.password();
        user.age = "5";

        // Age 5 (doesnt automaticly follow)
        await type("/html/body/div[2]/div[5]/div/div/form/div[1]/div[1]/div[1]/label/div/input", user.age);

        // Input random name
        await type("/html/body/div[2]/div[5]/div/div/form/div[1]/div[1]/div[2]/label/div/input", user.username);

        // Input random gmail
        await type("/html/body/div[2]/div[5]/div/div/form/div[1]/div[1]/div[3]/label/div/input", user.email);

        // Input random password
        await type("/html/body/div[2]/div[5]/div/div/form/div[1]/div[1]/div[4]/label/div/input", user.password);

        // Register
        await click("/html/body/div[2]/div[5]/div/div/form/div[1]/button");

        // Clear cookies
        const client = await page.target().createCDPSession();
        await client.send("Network.clearBrowserCookies");
    }
})();
