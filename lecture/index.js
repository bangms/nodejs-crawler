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
