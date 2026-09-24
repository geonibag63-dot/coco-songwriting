# 코코와 작곡하기

밴드 작곡 교재의 앱판. 교재 본문 + 악보 재생 + 실습 랩이 한 앱 안에서 동작합니다.
빌드 과정이 없는 순수 HTML/JS라 **파일을 그대로 올리면 바로 배포**됩니다.

## 배포 (GitHub Pages)

1. GitHub에서 새 저장소 생성 (Public 권장)
2. 이 폴더의 **내용물 전체**를 저장소 최상단에 업로드 (index.html이 최상단에 있어야 함)
3. 저장소 → Settings → Pages → Source: **Deploy from a branch** → Branch: **main / (root)** → Save
4. 1~2분 뒤 `https://<사용자명>.github.io/<저장소명>/` 접속

## 내용 수정 후 재배포

파일을 바꿔 올린 뒤, `sw.js` 첫 줄의 `VERSION` 값을 올립니다 (예: `coco-v1` → `coco-v2`).
이 값이 바뀌어야 이미 설치된 기기가 새 파일을 받아갑니다.

## 폴더 구조

```
index.html        앱 셸
css/app.css       전체 스타일 (테마 토큰 포함)
js/app.js         라우터·챕터 뷰·설정
js/store.js       기기 저장(진도·답안·설정)
js/notation.js    VexFlow 악보 렌더링 + 재생
js/tts.js         읽어주기(Web Speech)
js/audio/engine.js  합성 악기·드럼·시퀀서
js/labs/*.js      그루브 랩, 멜로디 랩
content/*.html    교재 본문·정답 (교재 소스에서 생성)
data/*.js         목차, 악보 데이터
vendor/vexflow.js 악보 라이브러리
sw.js             오프라인 캐시
```

## 메모

- 오프라인 지원과 홈 화면 설치는 **HTTPS에서만** 동작합니다 (GitHub Pages는 기본 HTTPS).
- Anthropic API 키는 저장소가 아니라 **각 기기의 브라우저**에만 저장됩니다.
