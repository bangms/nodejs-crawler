/*
const parse = require('csv-parse/lib/sync');
const fs = require('fs'); // 파일 시스템 모듈 (파일을 읽어와야 하기 때문에)

const csv = fs.readFileSync('csv/data.csv'); // readFileSync 파일을 읽어들이는 메서드
// csv 파일 형식은 버퍼라서 문자열로 바꿔주는 작업이 필요함
// ** 버퍼 : 0,1로 이루어진 컴퓨터 친화적인 데이터
// console.log(csv.toString('utf-8'));
const records = parse(csv.toString('utf-8')); // csv-parse의 parse 메서드가 문자열을 2차원 배열로 바꿈
records.forEach((r, i) => {
    console.log(i, r);
})
*/

// 엑셀을 파싱하는게 힘들기 때문에  xslx 패키지 설치

const xlsx = require('xlsx');
const axios = require('axios'); // ajax 라이브러리
const cheerio = require('cheerio'); // html 파싱

const workbook = xlsx.readFile('xlsx/data.xlsx');

// console.log(workbook);
// console.log(Object.keys(workbook.Sheets));
console.log(workbook.Sheets.영화목록);
const ws = workbook.Sheets.영화목록;

const records = xlsx.utils.sheet_to_json(ws);
console.log(records);

// forEach 나 for문 두가지 다 잘 쓰임
// 자바스크립트는 싱글스레드이기 때문에 (비동기) 크롤링을 할 때에도 똑같이 적용
// 크롤링 할 때도 비동기를 조심하면서 해야 함 두가지의 차이가 극명함 
// 비동기를 자유자재로 다룰 수 있어야 크롤링 된 데이터들을 한번에 모아서 저장할 수 있는데 그 부분을 유의하기 

// records.forEach((r, i) => {
//     console.log(r.제목, r.링크)
// })

// 배열.entries()를 쓰면 내부 배열이 [인덱스, 값] 모양 이터레이터로 바뀜
// 2차원 배열로 변환해서 비구조화 할당을 해서 사용
for (const [i, r] of records.entries()) {
    console.log(i, r.제목, r.링크);
}

// axios cheerio 조합

const crawler = async () => { // await 쓰기 위해 async 사용
    await Promise.all(records.map(async (r) => {
        const response = await axios.get(r.링크); // 가져오는 요청을 보냄 axios.get
        if (response.status === 200) { // 응답이 성공했을 경우
            const html = response.data;
            // console.log(html); // html 코드를 가져오기
            const $ = cheerio.load(html); // html 문자열이 cheerio에 로딩됨 -> $ 를 통해서 html 태그에 접근할 수 있음
            const text = $('.score.score_left .star_score').text();

            console.log(r.제목, '평점', text.trim()); // trim으로 공백문자열 지우기
        }
    }));

}

crawler();
