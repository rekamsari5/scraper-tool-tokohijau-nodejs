
## Getting Started
- You must have been installed node js version v12.18.0.
- You must have been installed Node library : Puppeteer, json2csv, fs, readline-sync


## Usage & Example
- Usage
```bash
usage: index.js
        - let mode = readline.question("Specifying the mode, search or shop? ");
        - let url = readline.question("URL that you will crawl? ");
        - let output = readline.question("Output filename? ");
```
- This tool divided by 2 modes, by search, and by a specific shop
- An example to run by search mode:
```bash
node index.js \
	--mode=search \
	--url="https://www.tokopedia.com/search?st=product&q=kopi" \
	--output=kopi \
	--total_page=2
```
- And by specific shop you can execute:
```bash
node index.js \
	--mode=shop \
	--url="https://www.tokopedia.com/seafoodgrowbuy" \
	--output=growbuysurabaya \
```
- All output will be exported as a CSV file on your root project directory.

## Limitation
- On the shop mode, this tool will be crawling all products, you cannot specify how many pages will be downloaded.
- Scope of data that will be gathered is:
> title, rating, total_reviewer, total_sold, seen_counter, price, weight, weight_unit, shop_name, shop_region, is_power_merchant, date



