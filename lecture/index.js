const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const fs = require('fs'); 
const puppeteer = require('puppeteer');
const csv = fs.readFileSync('csv/data.csv');
const records = parse(csv.toString('utf-8')); 

const crawler = async () => { 
    try {
        const result = [];
        const browser = await puppeteer.launch({ headless: process.env.NODE_ENV === 'production' });
        await Promise.all(records.map(async (r, i) => {
            try {
                const page = await browser.newPage(); 
                await page.goto(r[1]); 
                // const 태그핸들러 = await page.$(선택자);
                const text = await page.evaluate(() => {
                    // ** document나 window를 쓰려면 page.evaluate 안에서 써야함. 그 결과물(return) 값을 받아온다.
                    const scroe = document.querySelector('.score.score_left .star_score');
                    // const scroe2 = document.querySelector('.score.score_left .star_score');
                    if (scroe) {
                        return scroe.textContent;
                        // return {
                        //     scroe: scroe.textContent,
                        //     score2: score2.textContent,
                        // };
                    }
                });
                if (text) {
                    console.log(r[0], '평점', text.trim());
                    result[i] =[r[0], r[1], text.trim()];
                }
                await page.waitForTimeout(3000);
                await page.close();
            } catch (e) {
                console.error(e);
            }
        }));
        await browser.close();
        const str = stringify(result);
        fs.writeFileSync('csv/result.csv', str);
        // 생성한 페이지와 브라우저는 반드시 close() 하는 것이 메모리에 좋음 
    } catch (e) {
        console.error(e);
    }
}

crawler();
