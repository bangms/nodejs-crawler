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
console.log(workbook.SheetNames); // 시트 제목 가져오기
for (const name of workbook.SheetNames) {
    const ws = workbook.Sheets[name];
    // 시트별로 따로 코딩
}

// console.log(workbook);
// console.log(Object.keys(workbook.Sheets));
// console.log(workbook.Sheets.영화목록);
// const ws = workbook.Sheets.영화목록;

// const records = xlsx.utils.sheet_to_json(ws);
// r.제목 r.링크가 아니라 r.A, r.B 이런식으로 가져오는 방법
ws['!ref'] = 'A2:B11'; // 이렇게 걍 바꿔줘도 됨
// console.log(ws['!ref']);
const records = xlsx.utils.sheet_to_json(ws, { header: 'A' }); 
// 엑셀 컬럼명이 속성명으로 들어감 대신 첫번째 제목까지 포함되어서 들어옴
// console.log(ws['!ref']); // A1:B11 엑셀에서 읽어들여오는 부분 -> A2:B11 로 변경하면 됨
// 엑셀에서 파싱해 올 범위를 수정해주면 제목 제외하고 받아올 수 있음
// ws['!ref'] = ws['!ref'].split(':').map((v, i) => {
//     if (i === 0) return 'A2';
//     return v;
// }).join(':');
// records.shift(); // 맨 위에 제거
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
// for (const [i, r] of records.entries()) {
//     console.log(i, r.제목, r.링크);
// }

// axios cheerio 조합

// const crawler = async () => { // await 쓰기 위해 async 사용
//     // await Promise.all(records.map(async (r) => {
//         for (const [i, r] of records.entries()) {
        
//             const response = await axios.get(r.링크); // 가져오는 요청을 보냄 axios.get
//             if (response.status === 200) { // 응답이 성공했을 경우
//                 const html = response.data;
//                 // console.log(html); // html 코드를 가져오기
//                 const $ = cheerio.load(html); // html 문자열이 cheerio에 로딩됨 -> $ 를 통해서 html 태그에 접근할 수 있음
//                 const text = $('.score.score_left .star_score').text();
                
//                 console.log(r.제목, '평점', text.trim()); // trim으로 공백문자열 지우기
//             }
//         }
//     // }));
//     /*
//     엑셀에 적힌 순서
//         0 타이타닉 https://movie.naver.com/movie/bi/mi/basic.nhn?code=18847
//         1 아바타 https://movie.naver.com/movie/bi/mi/basic.nhn?code=62266
//         2 매트릭스 https://movie.naver.com/movie/bi/mi/basic.nhn?code=24452
//         ...

//     평점 크롤링 해 온 순서 
//         캐리비안의 해적 평점 9.07
//         반지의 제왕 평점 9.31
//         아바타 평점 9.08
//         ...

//     크롤링을 순서대로 돌릴 수도 있고 빠르게 돌리기 위해 동시에 모든 페이지에 요청을 보내 응답을 받을 수도 있음
//     하지만 응답 순서가 요청을 보낸 순서가 되지 않을 수도 있음
//     ** Promise.all은 동시에 진행되지만 순서가 보장되지 않음 
//        좋은 점은 속도가 빠름. 한번에 바로 요청을 다 보내기 때문에
//     만약에 엑셀 순서대로 적고싶다하면 코드가 좀 달라져야 함
//     forEach 가 Promise.all이라고 보면 됨 (map 부분)
//     결과의 순서를 보장하고 싶을 경우 for of 문과 await를 같이 쓰면 됨
//         for (const [i, r] of records.entries()) {
        
//         }
//     대신 순서대로 요청을 보내고 응답을 받기 때문에 속도가 좀 느림
//     둘다 간단한 페이지는 axios와 cheerio로 가능함
//     */
// }

// crawler();
