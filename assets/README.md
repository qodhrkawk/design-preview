# Design Assets

## 폴더 구조
```
assets/
├── icons/       # 아이콘 (SVG, PNG)
├── images/      # 일러스트, 로고, 사진 등
└── README.md
```

## 사용법

### HTML에서 참조
```html
<img src="./assets/icons/water.svg" width="32" height="32" />
<img src="./assets/images/hero.png" width="390" />
```

### GitHub Pages URL로 직접 참조
```
https://qodhrkawk.github.io/design-preview/assets/icons/water.svg
```

## 에셋 소스
- **아이콘:** Lucide Icons (https://lucide.dev) 등 오픈소스 SVG
- **이미지:** 유저 제공 또는 무료 스톡 (Unsplash 등)
- **로고:** 유저 제공

## 주의
- 이미지는 상대경로 `./assets/` 사용 (절대경로 금지)
- 개발 레포로 복사 시 `docs/design/assets/`에 동일 구조로 넣기
