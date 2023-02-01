const parse = require('csv-parse/lib/sync');
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
    const browser = await puppeteer.launch({ headless: false }); // puppeteer 명령어는 전부 비동기 작업이기 때문에 await 사용
    const page = await browser.newPage();
    const page2 = await browser.newPage();
    await page.goto('https://www.naver.com/');
    await page2.goto('https://google.com');
    await page.waitForTimeout(3000);
    await page2.waitForTimeout(1000);
    await page.close();
    await page2.close();
    await browser.close();
    // 생성한 페이지와 브라우저는 반드시 close() 하는 것이 메모리에 좋음 
}

crawler();
