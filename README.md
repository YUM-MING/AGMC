# 🏢 AGMC: AI Game Maker Company 
 
**AGMC(AI Game Maker Company)**는 사용자가 회장이 되어 부서별 전문 AI 사원들과 협업하여 게임 프로토타입을 단 몇 분 만에 기획, 제작, 실행하는 **인공지능 기반 게임 개발 시뮬레이션 플랫폼**입니다.

<img width="1085" height="696" alt="image" src="https://github.com/user-attachments/assets/c92e08cd-05ef-405f-aa3c-4e219e191306" />

## 🌟 핵심 가치
"아이디어만 있다면 누구나 게임 개발사가 될 수 있습니다." AGMC는 복잡한 코딩이나 그래픽 작업 없이, 오직 대화와 지시만으로 실제 플레이 가능한 게임을 만들어내는 혁신적인 경험을 제공합니다.

## 🛠️ 주요 기능

### 1. 5대 전문 AI 부서 체제 (GPT-4o & DALL-E 3)
*   **전략기획실 (Concept Specialist)**: 장르 설정 및 핵심 재미(Core Loop) 설계. 초보자를 위한 장르별 기획 가이드 제공.
*   **콘텐츠개발부 (Visual & Story Director)**: 세계관 및 시나리오 작성. AI 이미지 생성을 통한 실시간 게임 에셋(캐릭터, 배경 등) 확보.
*   **기술구현부 (Lead Developer)**: Phaser.js 기반의 게임 코드 생성. 생성된 코드를 즉시 실행 가능한 프로토타입으로 전환.
*   **라이브운영부 (Balance Optimizer)**: 난이도 조절, 레벨 디자인 개선안 도출 및 유저 피드백 시뮬레이션.
*   **데이터인사이트부 (Fun Factor Analyst)**: 게임의 재미 요소를 데이터 관점에서 분석하고 완성도를 높이는 통찰 제공.

### 2. 인터랙티브 2D 오피스 (Phaser 3)
*   사용자는 자신의 아바타를 조작(방향키/Space)하여 광활한 사무실을 탐험합니다.
*   각 부서 구역에 진입하여 AI 책임자들과 실시간으로 대화하고 업무를 승인/반려할 수 있습니다.

### 3. 고도화된 게임 실행 엔진
*   **MainScene 자동 보정**: AI가 클래스 이름을 잘못 작성하거나 `export` 문법을 사용해도 시스템이 실행 시점에 자동으로 최적화하여 실행 성공률을 극대화합니다.
*   **즉시 프리뷰**: 기술구현부 보고서에서 버튼 하나로 즉시 게임을 실행하고 테스트할 수 있습니다.

### 4. 완벽한 프로젝트 백업 및 복구
*   **강력한 EXPORT**: 프로젝트 이름, 부서별 데이터는 물론 생성된 **이미지 에셋까지 포함**하여 JSON 파일로 추출합니다.
*   **간편한 IMPORT**: 메인 타이틀의 CONFIG 메뉴를 통해 언제든 외부 백업 파일을 불러와 작업을 이어갈 수 있습니다.
*   **자동 저장**: Zustand Persist를 통해 브라우저를 새로고침해도 프로젝트 상태가 안전하게 유지됩니다.

## 🚀 기술 스택
*   **Frontend**: React 19, Vite, Zustand (State Management)
*   **Game Engine**: Phaser 3 (Office World & Prototype Runtime)
*   **AI Integration**: OpenAI SDK (GPT-4o, DALL-E 3 / GPT-Image)
*   **Styling**: Vanilla CSS (Modern Dark Tech Theme)
*   **Deployment**: Docker, Nginx, GitHub Actions

## 🔧 설치 및 실행 방법

### 환경 변수 설정
루트 디렉토리에 `.env` 파일을 생성하고 OpenAI API 키를 입력합니다.
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 로컬 개발 서버 실행
```bash
npm install
npm run dev
```

### 배포 (Docker Compose)
```bash
docker compose up -d --build
```

## 📜 라이선스
© 2026 AI Game Maker Company. All Rights Reserved.
본 프로젝트는 AI 협업을 통한 생산성 혁신을 탐구하기 위해 제작되었습니다.
