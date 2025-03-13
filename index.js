import puppeteer from "puppeteer";
import fs from 'fs';

let pageNumber = 246

const main = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36');
    try {
        await page.goto(url);
    } catch(err) {
        console.log(err)
    }
    const allArticles = await page.evaluate(() => {
        const articles = document.querySelectorAll('.trl, .trd')

        return Array.from(articles).map((article) => {
            const td = article.querySelector('td')
            const domain = td.querySelector('a').innerHTML
            return domain
        })

    })
    for (let i = 0; i < allArticles.length; i++) {
        await TestLinks(allArticles[i])
    }
    await browser.close()
}

const loop = async () => {
    for(let i = 1; i <= pageNumber; i++) { 
        let page = i;
        console.log(page)
        let url = "https://freedns.afraid.org/domain/registry/?page=" + page + "&sort=5&q="
        await main(url);
        console.log("Looped: " + i);
        let percentage = i / pageNumber * 100

        console.log(Math.round(percentage * 100) / 100 + "%")
        
    }
}

async function TestLinks(url) {
    try {
        const response = await fetch(`https://fc.frogiesarcade.win/check/${url}/results.json`);
        if (!response.ok) {
            console.log(url)
            throw new Error("Res nto Foudn!")
        }

        const data = await response.json()
        const newData = await JSON.stringify(data)
        if (data.lightspeed[0].includes('Unblocked')) {
            console.log(url + " is UNBLOCKED")
            fs.appendFile(`output/${url}.txt`, newData, function(err) {
                if (err) {
                    console.log(err)
                }
            })
        } else {
            console.log(url + " BLOCKED")
        }
    }
    catch (error) {
        console.log(error)
    }
    
}

loop()

