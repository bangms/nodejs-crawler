const parse = require('csv-parse/lib/sync');
const { compareDocumentPosition } = require('domutils');
const fs = require('fs'); 
/*
    puppeteer
    크롤러를 사람인 것처럼 만들어서 페이지 방문도 하고 마우스 클릭도 하고 로그인도 하고 사람인 척 접근해야 함
    시간차를 두고 동작을 하게 할 수도 있고 봇은 userAgent가 봇인게 티가나는데(봇인 경우 차단을 당할 수 있음) 사람인 척 흉내낼 수 있음
        ** userAgent : 내 브라우저가 뭔지 크롬인지 파폭인지 사파리인지 
    puppeteer는 크로미움 브라우저. 크로미움 브라우저는 크롬 브라우저의 기반.

*/
const puppeteer = require('puppeteer');

const csv = fs.readFileSync('csv/data.csv'); // readFileSync 파일을 읽어들이는 메서드
const records = parse(csv.toString('utf-8')); // csv-parse의 parse 메서드가 문자열을 2차원 배열로 바꿈

const crawler = async () => { 
    // UnhandledPromiseRejectionWarning Error: Page crashed!
    // promise가 에러가 나는 경우를 잡아야 하기 때문에 try catch문 사용
    try {
        const browser = await puppeteer.launch({ headless: false });
        await Promise.all(records.map(async (r, i) => {
            try {
                const page = await browser.newPage(); // 동시에 10개가 열림
                await page.goto(r[1]); // r[1] : 영화 링크 주소 // Promise.all 이기 때문에 순서가 엉킬 수 있음
                const scoreEl = await page.$('.score.score_left .star_score'); // 띄워진 페이지에서 해당 태그 찾기
                if (scoreEl) { // 크롤러가 에러가 생겨서 태그를 못찾는 경우가 발생할 수 있음(정확히는 태그 핸들러라서 태그 속성을 그대로 사용할 수 없음)
                    const text = await page.evaluate(tag => tag.textContent, scoreEl);
                    console.log(r[0], '평점', text.trim());
                } 
                await page.waitForTimeout(3000);
                await page.close();
            } catch (e) {
                console.error(e);
            }
        }));
        await browser.close();
        // 생성한 페이지와 브라우저는 반드시 close() 하는 것이 메모리에 좋음 
    } catch (e) {
        console.error(e);
    }
}

crawler();
