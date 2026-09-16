const { chromium } = require('playwright');
const path = require('path');
const shots = [
  { img: 'raw/01-home.png', out: 'final/01.png', bg: '#f5f2ec',
    h: '경조사비,<br>더 이상 헷갈리지 않게', s: '주고받은 마음을 한 곳에 기록하세요' },
  { img: 'raw/02-guide.png', out: 'final/02.png', bg: '#eef4ee',
    h: '얼마 내야 할지<br>고민될 때', s: '관계와 기록을 바탕으로 <span class="accent">적정 금액을 제안</span>해요' },
  { img: 'raw/03-people.png', out: 'final/03.png', bg: '#f5f2ec',
    h: '사람별로 정리되는<br>관계 장부', s: '받은 마음, 보낸 마음이 자동으로 정리돼요' },
  { img: 'raw/04-person.png', out: 'final/04.png', bg: '#eef0f4',
    h: '주고받음의 균형을<br>한눈에', s: '부담 갖지 않아도 되는 관계인지 알려드려요' },
  { img: 'raw/05-stats.png', out: 'final/05.png', bg: '#f5f2ec',
    h: '올해 경조사비,<br>얼마나 썼을까?', s: '월별 흐름과 이벤트별 평균을 확인하세요' },
];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1290, height: 2796 } });
  for (const s of shots) {
    const q = new URLSearchParams({ h: s.h, s: s.s, img: 'file://' + path.resolve(s.img), bg: s.bg });
    await page.goto('file://' + path.resolve('template/frame.html') + '?' + q.toString());
    await page.waitForTimeout(400);
    await page.screenshot({ path: s.out });
    console.log(s.out, 'ok');
  }
  await browser.close();
})();
