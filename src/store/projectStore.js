import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create(
  persist(
    (set) => ({
      projectName: '',
      ceoName: '회장님', // 사용자 호칭 기본값
      isProjectStarted: false,
      showSuggestions: true, // 초보자용 가이드 온오프 설정
      
      // 각 부서의 현재 업무 결과물 (Shared Context)
      projectData: {
        strategy: '',    // 게임 컨셉, 장르, 메인 루프 (BM 배제)
        content: '',     // 세계관, 시나리오, 비주얼 스타일 및 에셋 묘사
        engineering: '', // Phaser.js 기반 게임 엔진 로직 및 코드
        ops: '',         // 난이도 밸런싱 및 레벨 디자인 개선안
        analytics: ''    // 재미 요소 분석 및 플레이 테스트 리포트
      },

      // 생성된 이미지 에셋 저장소 
      generatedAssets: [], // { id, url, description }

      // 전역 환경 설정 업데이트
      setConfig: (ceoName, showSuggestions) => set({
        ceoName: (typeof ceoName === 'string' ? ceoName.trim() : ceoName) || '회장님',
        showSuggestions
      }),

      // 프로젝트 초기화
      startProject: (name, ceoName, showSuggestions) => set((state) => ({ 
        projectName: typeof name === 'string' ? name.trim() : name, 
        ceoName: typeof ceoName === 'string' ? (ceoName.trim() || state.ceoName) : state.ceoName,
        isProjectStarted: true,
        showSuggestions: typeof showSuggestions !== 'undefined' ? showSuggestions : state.showSuggestions
      })),

      // 부서별 업무 결과 업데이트 (한 부서가 수정하면 전체가 알게 됨)
      updateDeptData: (deptId, content) => set((state) => ({
        projectData: {
          ...state.projectData,
          [deptId]: content
        }
      })),

      // 프로젝트 데이터 가져오기 (백업 로드용)
      importProject: (name, data, generatedAssets = []) => set((state) => ({
        projectName: name,
        projectData: {
          ...state.projectData,
          ...data
        },
        generatedAssets: generatedAssets || [],
        isProjectStarted: true
      })),

      // 에셋 추가
      addAsset: (asset) => set((state) => ({
        generatedAssets: [...state.generatedAssets, asset]
      })),

      // 프로젝트 데이터 초기화
      resetProject: () => set(() => ({
        projectName: '',
        isProjectStarted: false,
        // 호칭과 제안 설정은 초기화하지 않고 유지함
        projectData: {
          strategy: '',
          content: '',
          engineering: '',
          ops: '',
          analytics: ''
        },
        generatedAssets: []
      })),
    }),
    {
      name: 'agmc-project-storage',
      // 이제 생성된 에셋도 로컬스토리지에 저장하여 다른 부서 이동이나 새로고침 시에도 유지되도록 함
    }
  )
);

