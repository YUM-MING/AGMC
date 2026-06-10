# **AI Game Maker Company (AGMC) Blueprint**

## **Overview**
AI Game Maker Company (AGMC) is a 2D office-themed visual production environment where users can create games through collaboration with specialized AI agents. The platform democratizes game development by providing a creative, intuitive, and interactive "office" where ideas are transformed into playable reality.

## **Core Capabilities**
- **2D Office World:** An interactive avatar-based interface for navigating the development process.
- **AI Departments:** 5 specialized AI departments handling everything from strategy to data analytics.
- **Ultra-Fast Creation:** Target of 5-minute creation from idea to playable web game.
- **Personal Customization:** Focus on custom game tools for personal enjoyment and quick sharing.
- **Instant Deployment:** Rapid web-based game publishing via URL.

## **Organization Structure (5 Core Departments)**

### **1. 전략기획실 (Concept Specialist)**
회장님의 의도를 가장 먼저 파악하고 게임의 큰 그림을 그리는 부서입니다.
- **역할:** 게임 컨셉 기획, 장르 설정, 핵심 재미(Core Loop) 설계.
- **특징:** 수익 모델(BM)은 배제하고 순수하게 '게임의 재미'와 '혁신성'에만 집중하여 기획안을 보고합니다.

### **2. 콘텐츠 개발부 (Visual & Story Director)**
게임의 살을 붙이는 창의적인 작업을 담당하며, 비주얼의 정체성을 부여합니다.
- **시나리오 팀:** 세계관 설정, 퀘스트 스크립트, 캐릭터 대사 생성.
- **비주얼 가이드 팀:** 캐릭터 디자인 및 배경 스타일을 구체적인 언어로 묘사하여 기술구현부가 코드로 구현할 수 있도록 돕습니다. (색상, 형태, 애니메이션 느낌 등 상세 기술)
- **이미지 생성 (DALL-E 3 연동):** 회장님이 입력한 묘사를 바탕으로 OpenAI DALL-E 3를 통해 실제 게임 에셋 이미지를 즉석에서 생성합니다. 생성된 이미지는 에셋 갤러리에 저장됩니다.
- **사운드 팀:** 배경음악(BGM), 효과음 컨셉 설정.

### **3. 기술 구현부 (Lead Developer)**
실제로 게임이 돌아가게 만드는 '엔진' 역할을 합니다.
- **코드 제너레이션 팀:** Phaser.js를 활용하여 플레이 가능한 독립형 HTML 코드를 작성합니다.
- **QA & 디버깅 팀:** 생성된 코드의 오류를 점검하고 즉각 수정.

### **4. 라이브 운영부 (Balance Optimizer)**
출시 후 유저들이 게임을 더 즐겁게 플레이할 수 있도록 조정하는 부서입니다.
- **밸런싱 팀:** 난이도 조절, 레벨 디자인 개선, 유저 편의성(UX) 강화 제안.
- **수익 모델 배제:** 유료 결제 유도보다는 '플레이 경험의 질'을 높이는 데 집중합니다.

### **5. 데이터 인사이트 부 (Fun Factor Analyst)**
회장님의 의사결정을 돕는 '브레인'으로, 게임의 재미를 수치화합니다.
- **역할:** 게임의 재미 요소 분석, 난이도 곡선 시각화, 플레이 테스트 보고서 제공.

## **🚀 온보딩 가이드 시스템**
사용자가 처음 프로젝트를 시작할 때 당황하지 않도록 단계별 가이드를 제공합니다.
1.  **1단계 (전략기획실):** 게임의 장르와 핵심 아이디어를 결정합니다.
2.  **2단계 (콘텐츠개발부):** 결정된 컨셉에 어울리는 세계관과 구체적인 비주얼 스타일을 설정합니다. (필요시 DALL-E를 통해 이미지를 생성합니다.)
3.  **3단계 (기술구현부):** 기획안을 바탕으로 실제 플레이 가능한 게임 코드를 생성합니다.
4.  **4단계 (운영/분석):** 생성된 게임을 플레이해보고 난이도를 조절하거나 재미 요소를 보강합니다.

## **Visual & Design Language**
- **Theme:** Modern 2D Office Aesthetic.
- **Styling:** Premium feel with subtle noise textures, deep shadows, and vibrant color concentrations.
- **Typography:** Expressive and emphasized for clarity.
- **Interactivity:** Glowing interactive elements and smooth transitions.

## **Current Implementation Plan (Phase 1: Foundation)**
1.  **Project Infrastructure:**
    - Install `react-router-dom` for navigation.
    - Set up basic folder structure (`src/components`, `src/pages`, `src/styles`).
    - Installed `phaser` for 2D game environment.
2.  **Base UI & Layout:**
    - Create a main `AppLayout` with a modern, "office-style" navigation bar.
    - Implement a landing page reflecting the AGMC vision.
3.  **2D Office Environment (Initial):**
    - Implemented a Phaser-based 2D office with an interactive avatar.
    - **Set up all 5 specialized departments: Strategy, Content, Engineering, Ops, and Data Insights.**
    - Each department has a unique interaction zone and AI representative.
4.  **Save & Load System (Persistence):**
    - **Zustand Persist Middleware:** Enabled automatic state saving to `localStorage`.
    - **Generated Asset Gallery:** Stores and displays image URLs generated via DALL-E 3.
    - **Export/Import:** Added functionality to download project data (including asset URLs) as `.json` and upload it back.
    - **Dynamic Home Menu:** Context-aware menu buttons (Continue, New Project, Import).
