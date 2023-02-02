const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const add_to_sheet = require('./add_to_sheet');

const workbook = xlsx.readFile('xlsx/data.xlsx');
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws); 

const crawler = async () => { 
    try {
        const browser = await puppeteer.launch({ headless: process.env.NODE_ENV === 'production' });
        const page = await browser.newPage(); 
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
        add_to_sheet(ws, 'C1', 's', '평점');
        for (const [i, r] of records.entries()) {
            await page.goto(r.링크); 
            // const 태그핸들러 = await page.$(선택자);
            console.log(await page.evaluate('navigator.userAgent'));
            const text = await page.evaluate(() => {
                const scroe = document.querySelector('.score.score_left .star_score');
                if (scroe) {
                    return scroe.textContent;
                }
            });
            if (text) {
                console.log(r.제목, '평점', text.trim());
                const newCell = 'C' + (i + 2);
                add_to_sheet(ws, newCell, 'n', parseFloat(text.trim()));
            }
            await page.waitForTimeout(1000); // 시간을 줄이고 늘려보면서 차단 당하는지 안하는지 테스트 필요
        }
        await page.close();
        await browser.close();
        xlsx.writeFile(workbook, 'xlsx/result.xlsx')
    } catch (e) {
        console.error(e);
    }
}

crawler();
