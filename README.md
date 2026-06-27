# 강동길동매일365한의원 경영 대시보드

원장별 실적, 기간별 매출, 분류/패키지별 흐름을 보는 정적 웹 대시보드입니다.

## 파일 구성

- `index.html`: 대시보드 화면
- `styles.css`: 화면 디자인
- `app.js`: 구글시트 연동, 필터, 집계, 차트
- `config.example.js`: 구글 API 설정 예시
- `.github/workflows/deploy.yml`: GitHub Pages 자동 배포 설정

## 데이터 연동 방식

브라우저가 Google Sheets API로 시트를 읽습니다. API 키만 쓰는 방식은 시트가 링크 보기 권한으로 열려 있어야 합니다.

권장 시트 열 이름:

- 날짜: `날짜`, `일자`, `내원일`, `진료일`, `결제일`
- 원장: `원장`, `담당원장`, `진료원장`, `한의사`
- 분류: `분류`, `구분`, `카테고리`, `진료분류`
- 패키지명: `패키지명`, `패키지`, `상품명`, `프로그램`
- 매출: `결제금액`, `매출`, `매출액`, `금액`, `실적`, `수납액`

## 설정 파일 만들기

`config.example.js`를 복사해서 `config.js`를 만들고 아래처럼 입력합니다.

```js
window.DASHBOARD_CONFIG = {
  spreadsheetId: "1n1WiKZYfsyxx_C84NTl-ZkzSq7hoUN-N-eSsyNVRLXo",
  gid: "671250414",
  sheetName: "",
  range: "A:Z",
  apiKey: "여기에_Google_API_키",
};
```

`sheetName`은 비워두면 `gid`로 자동 확인합니다.

## 개인정보 주의

기업 페이지가 공개 웹사이트라면 환자명, 전화번호, 주민번호, 주소, 차트번호 같은 개인정보는 시트에서 제외하거나 비식별 처리하세요. 무료 GitHub Pages를 공개 저장소로 쓰는 경우에는 특히 공개용 집계 시트를 별도로 두는 편이 안전합니다.

API 키는 브라우저에서 보일 수 있습니다. Google Cloud에서 HTTP referrer 제한과 Sheets API 제한을 꼭 걸어야 합니다.

## 로컬 확인

`index.html`을 브라우저로 열면 샘플 데이터가 표시됩니다. API 키가 없으면 샘플 모드로 동작합니다.
