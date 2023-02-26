#!/usr/bin/env node
let createAccount = async (referral) => {
    const axios = require("axios").default;
    const setCookie = require('set-cookie-parser');
    const { v4: uuidv4 } = require('uuid');
    const Chance = require("chance");
    const chance = new Chance();
    const ua = `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393"`
    const duo = axios.create({
        baseURL: "https://www.duolingo.com/2017-06-30/",
        headers: { "User-Agent": ua },
    });
    
  /*  const { data } = await axios.get("https://www.recaptcha.net/recaptcha/enterprise/anchor?ar=1&k=6LcLOdsjAAAAAFfwGusLLnnn492SOGhsCh-uEAvI&co=aHR0cHM6Ly93d3cuZHVvbGluZ28uY29tOjQ0Mw..&hl=en&v=Nh10qRQB5k2ucc5SCBLAQ4nA&size=invisible&cb=ql0fzyhsvuzv", 
    {
        headers: {
            "User-Agent": ua
        }
    })
    const starts = `id="recaptcha-token" value="`;
    const start = data.indexOf(starts) + starts.length;
    const captcha_token = data.substring(start, data.indexOf(`"`, start) + 1);
*/
    const signal = {
        siteKey: "6LcLOdsjAAAAAFfwGusLLnnn492SOGhsCh-uEAvI",
        token: "xd",
        vendor: 2
    }

    let referral_code = referral.split("/");
    referral_code = referral_code[referral_code.length - 1]
    
    let mur = await duo({
        method: "POST",
        url: "/users?fields=id",
        data: {
            "distinctId": uuidv4(),
            "timezone": "America/Montreal",
            "fromLanguage": "en",
            "inviteCode": referral_code,
            signal
        }
    }).catch(e => {
        console.error(e)
    })

    let jwt = setCookie.parse(mur).find(e => e.name == "jwt_token");
    let id = mur.data.id;

    const pass = require("crypto").randomBytes(12).toString("base64")
    const email = chance.email()
    await duo({
        method: "PATCH",
        url: `/users/${id}?fields=email,identifier,name,username`,
        data: {
            "age": "5",
            "email": email,
            "password": pass,
            signal
        },
        headers: {
            Cookie: `jwt_token=${jwt.value};`
        }
    }).catch(e => {
        console.error(e)
    })
};

;(async () => {
    const inquirer = require('inquirer');
    const ora = (await import("ora")).default;
    const chalk = (await import("chalk")).default;
    console.log(`
${chalk.hex("#58cc02")("Duo")}${chalk.white("lingo ")} ${chalk.hex("#4b4b4b")("plus")}
${chalk.hex("#4b4b4b")("made  by ")} ${chalk.white("JunkMeal")}
`);

    const answers = await inquirer.prompt([
    {
        name: "referral_link",
        type: "input",
        message: "What is your duolingo referral link?"
    },
    {
        name: "account_count",
        type: "input",
        message: "How many accounts do you want to create?",
        validate: (input) => 
            !isNaN(input) || "You need to provide a number.",
        default: () => "24"
    }
    ]);

    let count = answers.account_count;
    let link = answers.referral_link;
    const spinner = ora(`Creating accounts (0/${count})`).start();
    for (let i = 0; i < count; i++) {
        await createAccount(link);
        spinner.text = `Creating accounts (${i+1}/${count})`;
    }
    spinner.stop();
    console.log(chalk.hex("#00ff00")("Done!"))
})();
