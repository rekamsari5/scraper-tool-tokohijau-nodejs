'use strict';
const puppeteer = require('puppeteer');
const fs = require('fs');
const {
    Parser
} = require('json2csv');
const readline = require('readline-sync');

let mode = readline.question("Specifying the mode, search or shop? ");
let url = readline.question("URL that you will crawl? ");
let output = readline.question("Output filename? ");

let total_page;
if (mode == "search") {
    total_page = readline.question("The total page that you will crawl (only work if you on search mode?");
} else {
    total_page = 1
}

let urlList = []
for (let u = 0; u < total_page; u++) {
    if (mode == 'search') {
        urlList[u] = `${url}&page=${u+1}`
    } else {
        urlList [u]= `${url}?perpage=9999`
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 800
    });

    let listUrlPage = []
    for (let z = 0; z < total_page; z++) {
        let url_carwl = urlList[z]
        await page.goto(url_carwl,{
            waitUntil: 'load',
            // Remove the timeout
            timeout: 0});
        await autoScroll(page);
        const availability = await page.evaluate(() => {
            let urlProduk = document.querySelectorAll('a.css-89jnbj');
            let produk_unggulan = document.querySelectorAll('span.css-1g1jys3');

            let availabilityText = [];
            for (let j = 0; j < urlProduk.length; j++) {
                if (produk_unggulan[j] == null || produk_unggulan[j] == undefined) {
                    availabilityText[j] = {
                        urlProduk: urlProduk[j].getAttribute("href")
                    }
                }

            }

            let filtered = availabilityText.filter(Boolean)
            return filtered
        });
        listUrlPage.push(availability);
    }

    let urlDetail = listUrlPage;
    let page2 = await browser.newPage();

    await page2.setViewport({
        width: 1200,
        height: 800
    });
    let productsList = [];
    for (let i = 0; i < urlDetail[0].length; i++) {

        let urlDetailProduk = urlDetail[0][i]['urlProduk'];
        await page2.goto(urlDetailProduk ,{
            waitUntil: 'load',
            // Remove the timeout
            timeout: 0});
        await autoScroll(page2);
        const products = await page2.evaluate(() =>{
            Date.now = () => {
                let dateObj = new Date();
                let month = dateObj.getUTCMonth() + 1; 
                let day = dateObj.getUTCDate();
                let year = dateObj.getUTCFullYear();

                let newdate = year + "/" + month + "/" + day;
                return newdate
            };

            let title = document.querySelector('[data-testid="lblPDPDetailProductName"]').innerText;
            let rating = document.querySelector('[data-testid="lblPDPDetailProductRatingNumber"]');
            if( typeof rating === 'undefined' || rating === null ){
                rating = "none"
            }else{
                rating =  rating.innerText;
            }
            let total_reviewer = document.querySelector('[data-testid="lblPDPDetailProductRatingCounter"]');
            if( typeof total_reviewer === 'undefined' || total_reviewer === null ){
                total_reviewer = "none"
            }else{
                total_reviewer =  total_reviewer.innerText.replace(")", "").replace("(", "");
            }
            let total_sold = document.querySelector('[data-testid="lblPDPDetailProductSuccessRate"]');
            if( typeof total_sold === 'undefined' || total_sold === null ){
                total_sold = "none"
            }else{
                total_sold =  total_sold.innerText.split(" ")[1];
            }
            let seen_counter = document.querySelector('[data-testid="lblPDPDetailProductSeenCounter"]').innerText.split("x")[0];
            let price = document.querySelector('[data-testid="lblPDPDetailProductPrice"]').innerText.replace("Rp", "").replace(".", "");                
            let weight_unit =document.querySelector('[data-testid="PDPDetailWeightValue"]').innerText.trim().split(/\d+/g).filter(n=>n).pop().trim();
            let weight = document.querySelector('[data-testid="PDPDetailWeightValue"]').innerText.trim().split(weight_unit).filter(n=>n)[0].trim();
            let shop_name = document.querySelector('[data-testid="llbPDPFooterShopName"]').innerText;
            let shop_region = document.querySelector('[data-testid="lblPDPFooterLastOnline"]').innerText.split("•")[0];

            let shop_badge = document.querySelector('[data-testid= "imgPDPDetailShopBadge"]')
            let is_power_merchant = false
            if (shop_badge != null) {
                if (shop_badge.innerText === "Power Merchant") {
                    is_power_merchant = true
                }
            }

            let data = {
                title : title,
                rating : rating,
                total_reviewer : total_reviewer,
                total_sold : total_sold,
                seen_counter : seen_counter,
                price : price,
                weight: weight,
                weight_unit : weight_unit,
                shop_name : shop_name,
                shop_region : shop_region,
                is_power_merchant : is_power_merchant,
                date : Date.now()
            }
            return data;

        });
        productsList.push(products);
        const j2csv = new Parser();
        let csv = j2csv.parse(productsList);
        // let path_name = url.match(/.*\/(.*)$/)[1]
        const rows = csv.split('\n');
        const header = rows.shift().replace(/"/g, '');
        rows.unshift(header);
        csv = rows.join('\n');
        fs.writeFileSync(`./tokopedia-${output}.csv`,csv,'utf-8')
    }
    console.log("Data have been successfully exported")
    await browser.close();
})();

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
