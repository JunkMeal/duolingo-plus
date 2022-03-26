`#!/usr/bin/env node
`

import axios from "axios"
import setCookie from "set-cookie-parser"
import { v4 as uuidv4 } from 'uuid'
import Chance from "chance"
import inquirer from "inquirer"
import ora from "ora"
import chalk from "chalk"
import crypto from "crypto"

createAccount = (referral) -> 
    chance = new Chance();

    duo = axios.create
        baseURL: "https://www.duolingo.com/2017-06-30/",
        headers: 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
    
    referral_code = referral.split("/");
    referral_code = referral_code[referral_code.length - 1]
    
    mur = await duo
        method: "POST",
        url: "/users?fields=id",
        data: 
            "distinctId": uuidv4(),
            "timezone": "America/Montreal",
            "fromLanguage": "en",
            "inviteCode": referral_code
    .catch console.error
    
    jwt = setCookie.parse mur 
    .find (e) -> e.name == "jwt_token"
    id = mur.data.id;

    await duo
        method: "PATCH",
        url: "/users/#{id}?fields=none",
        data: 
            "age": "5",
            "email": chance.email,
            "password": crypto.randomBytes 12 
            .toString "base64" 
        
        headers: 
            Cookie: "jwt_token=#{jwt.value};"
        
    .catch console.error

console.log "
#{chalk.hex("#58cc02")("Duo")}#{chalk.white("lingo ")} #{chalk.hex("#4b4b4b")("plus")}
#{chalk.hex("#4b4b4b")("made  by ")} #{chalk.white("JunkMeal")}
"


answers = await inquirer.prompt [
    {
        name: "referral_link"
        type: "input"
        message: "What is your duolingo referral link?"
    },
    {
        name: "account_count"
        type: "input"
        message: "How many accounts do you want to create?"
        validate: (input) -> 
            !isNaN(input) || "You need to provide a number."
        default: () -> "19"
    }
]
    

count = answers.account_count;
link = answers.referral_link;
spinner = ora  "Creating accounts (0/#{count})"
.start()
for i in [1..count]
    await createAccount(link);
    spinner.text = "Creating accounts (#{i+1}/#{count})";
    
spinner.stop()
console.log chalk.hex("#00ff00")("Done!")