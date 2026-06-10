# 🏢 AGMC: AI Game Maker Company

**AGMC(AI Game Maker Company)**는 회장(사용자)이 부서별 전문 AI 사원들에게 업무를 지시하여 게임 프로토타입을 신속하게 기획, 제작, 운영하는 인공지능 기반 게임 개발 시뮬레이션 및 협업 툴입니다.

![AGMC Hero](/src/assets/background.png)

## 🌟 핵심 컨셉
사용자는 AGMC의 회장이 되어 5개의 전문 부서를 방문하고, 각 부서의 AI 책임자들에게 자연어로 업무를 지시합니다. 기획부터 비주얼 에셋 생성, 실제 플레이 가능한 코드 구현까지 모든 과정이 AI와의 협업으로 이루어집니다.

## 🛠️ 주요 기능

### 1. 부서별 맞춤형 AI 페르소나 (GPT-4o)
*   **전략기획실 (Concept Specialist)**: 게임의 핵심 컨셉, 장르, 메인 루프 기획.
*   **콘텐츠개발부 (Visual & Story Director)**: 세계관 설정 및 DALL-E 3 기반 이미지 에셋 생성.
*   **기술구현부 (Lead Developer)**: Phaser.js 기반의 플레이 가능한 게임 로직 코드 생성.
*   **라이브운영부 (Balance Optimizer)**: 게임 밸런싱 및 유저 피드백 시뮬레이션.
*   **데이터인사이트부 (Fun Factor Analyst)**: 재미 요소 분석 및 개선 지표 제공.

### 2. 인터랙티브 오피스 (Phaser 3)
*   2D 쿼터뷰 스타일의 오피스 환경에서 캐릭터를 직접 조작(방향키/Space)하여 각 부서원과 소통.
*   부서별 고유 공간 및 애니메이션이 적용된 AI 사원 캐릭터 배치.

### 3. 실시간 게임 프로토타입 실행
*   기술구현부에서 작성한 코드를 즉시 실행해 볼 수 있는 인게임 프리뷰 기능 제공.
*   AI가 작성한 순수 로직을 시스템 내장 프레임워크와 결합하여 즉각적인 피드백 확인 가능.

### 4. 프로젝트 관리 및 내보내기
*   진행 중인 프로젝트 데이터를 JSON 형태로 EXPORT/IMPORT 가능.
*   브라우저 로컬 스토리지를 통한 자동 저장 기능.

## 🚀 기술 스택
*   **Frontend**: React 19, Vite, Zustand
*   **Game Engine**: Phaser 3
*   **AI**: OpenAI API (GPT-4o, DALL-E 3)
*   **Styling**: Vanilla CSS (Custom Glassmorphism)
*   **Infrastructure**: Docker, Nginx, GitHub Actions (CI/CD)

## 🔧 설치 및 실행 방법

### 환경 변수 설정
`.env` 파일을 루트 디렉토리에 생성하고 아래 내용을 입력합니다.
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 로컬 실행
```bash
npm install
npm run dev
```

### Docker를 이용한 배포
```bash
docker compose up -d --build
```

## 📜 라이선스
© 2026 AI Game Maker Company. All Rights Reserved.
본 프로젝트는 교육 및 프로토타이핑 목적으로 제작되었습니다.
