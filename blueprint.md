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

### **1. 전략기획실 (Concept & Strategy AI)**
회장님의 의도를 가장 먼저 파악하고 게임의 큰 그림을 그리는 부서입니다.
- **역할:** 시장 트렌드 분석, 게임 컨셉 기획, 수익 모델(BM) 설계.
- **특징:** 수만 개의 성공/실패 사례 데이터를 학습하여 흥행 가능성이 높은 기획안을 회장님께 보고합니다.

### **2. 콘텐츠 개발부 (Creative Content AI)**
게임의 살을 붙이는 창의적인 작업을 담당합니다.
- **시나리오 팀:** 세계관 설정, 퀘스트 스크립트, 캐릭터 대사 생성.
- **그래픽/아트 팀:** 캐릭터 디자인, 배경 원화, 3D 모델링 및 애니메이션 자동 생성.
- **사운드 팀:** 배경음악(BGM), 효과음, 캐릭터 보이스(TTS) 생성.

### **3. 기술 구현부 (Technical Engineering AI)**
실제로 게임이 돌아가게 만드는 '엔진' 역할을 합니다.
- **코드 제너레이션 팀:** 최적화된 게임 로직 프로그래밍 및 클라이언트/서버 구축.
- **QA & 디버깅 팀:** 365일 실시간으로 게임을 플레이하며 버그를 찾아내고 즉시 수정.
- **HRI(인간-로봇 상호작용) 특화팀:** 플레이어의 행동을 분석해 게임 속 NPC가 유저와 자연스럽게 교감하도록 설계.

### **4. 라이브 운영부 (Live Ops AI)**
출시 후 유저들과 소통하며 게임을 키워나가는 부서입니다.
- **커뮤니티 매니저(CM) AI:** 유저 문의 응대, SNS 관리, 이벤트 기획 및 실행.
- **밸런싱 팀:** 유저들의 플레이 데이터를 실시간 분석하여 캐릭터나 아이템 수치를 즉각 조정.

### **5. 데이터 인사이트 부 (Data & Analytics AI)**
회장님의 의사결정을 돕는 '브레인'입니다.
- **역할:** 모든 지표를 대시보드화하여 보고하고, 다음 업데이트 방향을 제안.

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

---

## **Project History & Evolution**
### **Version 0.3.0**
- **Full Department Integration:** All 5 departments defined by the user are now visualized in the office.
- **Detailed Interaction:** Each department zone now provides specific reports and welcomes based on their refined roles.
- **Visual Refinement:** Layout adjusted for 5 departments with enhanced UI styling.

