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
        const page = await browser.newPage(); 
        // 개발자 도구에서 navigator.userAgent 치면 어떤 브라우저를 쓰는지 알려줌(브라우저의 정보)
        // axios 에서도 userAgent를 바꿔서 보내는 것이 좋음 postman 에서도 마찬가지 
        // 한 페이지로 사람처럼 행동해서 크롤링 하는 방법 (차단 안당하도록)
        // 동시성을 잃기 때문에 테스트를 잘 해봐야 함
        // 컨텐츠를 좀 빠르게 긁어오고 싶은 경우 서버를 여러개를 만들어서 (= 사람이 여러명인 척) 동시에 가져오도록 
        // 클라우드를 통해서 크롤링을 빠르게 할 수 있음 (아마존, 구글, MS 등) 
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');
        for (const [i, r] of records.entries()) {
            await page.goto(r[1]); 
            // const 태그핸들러 = await page.$(선택자);
            console.log(await page.evaluate('navigator.userAgent'));
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
            await page.waitForTimeout(3000); // 시간을 줄이고 늘려보면서 차단 당하는지 안하는지 테스트 필요
        }
        await page.close();
        await browser.close();
        const str = stringify(result);
        fs.writeFileSync('csv/result.csv', str);
        // 생성한 페이지와 브라우저는 반드시 close() 하는 것이 메모리에 좋음 
    } catch (e) {
        console.error(e);
    }
}

crawler();
