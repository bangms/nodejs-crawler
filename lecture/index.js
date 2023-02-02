const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const add_to_sheet = require('./add_to_sheet');

const workbook = xlsx.readFile('xlsx/data.xlsx');
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws); 

// 기존에 폴더가 있는 경우 충돌나서 에러가 나기 때문에 먼저 있는지 없는지 먼저 검사를 하고 없을 경우 폴더를 추가
fs.readdir('screenshot', (err) => { // readdir은 비동기 방식 
    if (err) {
        console.error('screenshot 폴더가 없어 screenshot 폴더를 생성합니다.');
        fs.mkdirSync('screenshot'); // Sync가 있으면 동기식으로 동작하는데 readdir이 비동기방식이기 때문에 mkdir로 하더라도 여기서는 큰 차이가 없음
    }
})

fs.readdir('poster', (err) => {
    if (err) {
        console.error('poster 폴더가 없어 poster 폴더를 생성합니다.');
        fs.mkdirSync('poster');
    }
})

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
            const result = await page.evaluate(() => {
                const scoreEl = document.querySelector('.score.score_left .star_score');
                let score = '';
                if (scoreEl) {
                    score = score.textContent;
                }
                const imgEl = document.querySelector('.poster img');
                let img = '';
                if (imgEl) {
                    img = imgEl.src;
                }
                return { score, img };
            });
            if (result.score) {
                console.log(r.제목, '평점', result.score.trim());
                const newCell = 'C' + (i + 2);
                add_to_sheet(ws, newCell, 'n', parseFloat(result.score.trim()));
            }
            if (result.img) {
                const imgResult = await axios.get(result.img.replace(/\?.*$/, ''), { // replace(/\?.*$/, '') -> 쿼리 스트링을 제거하는 정규표현식 ?부터 끝부분까지 제거 // ?.+$에서 .은 모든 단어 +는 한 개 이상, $는 끝을 의미함
                    responseType: 'arraybuffer', // arraybuffer : buffer가 연속적으로 들어있는 자료 구조
                });
                fs.writeFileSync(`poster/${r.제목}.jpg`, imgResult.data);
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
