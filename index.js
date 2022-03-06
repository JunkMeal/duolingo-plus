#!/usr/bin/env node
let createAccount = async (referral) => {
    const axios = require("axios").default;
    const setCookie = require('set-cookie-parser');
    const { v4: uuidv4 } = require('uuid');
    const Chance = require("chance");
    const chance = new Chance();

    const duo = axios.create({
        baseURL: "https://www.duolingo.com/2017-06-30/",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393" },
    });
    
    let referral_code = referral.split("/");
    referral_code = referral_code[referral_code.length - 1]
    
    let mur = await duo({
        method: "POST",
        url: "/users?fields=id",
        data: {
            "distinctId": uuidv4(),
            "timezone": "America/Montreal",
            "fromLanguage": "en",
            "inviteCode": referral_code
        }
    }).catch(e => {
        console.error(e)
    })

    let jwt = setCookie.parse(mur).find(e => e.name == "jwt_token");
    let id = mur.data.id;

    await duo({
        method: "PATCH",
        url: `/users/${id}?fields=none`,
        data: {
            "age": "5",
            "email": chance.email(),
            "password": require("crypto").randomBytes(12).toString("base64")
        },
        headers: {
            Cookie: `jwt_token=${jwt.value};`
        }
    }).catch(e => {
        console.error(e)
    })
};

;(async ()=> {
    const inquirer = require('inquirer');
    const ora = (await import("ora")).default;
    const chalk = (await import("chalk")).default;
    console.log(`
${chalk.hex("#58cc02")("Duo")}${chalk.white("lingo")} ${chalk.hex("#4b4b4b")("plus")}
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
        default: () => "19"
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
})();
