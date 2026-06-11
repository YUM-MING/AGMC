import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useRef, useState, useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isProjectStarted, projectName, startProject, updateDeptData, resetProject, setConfig, ceoName, showSuggestions } = useProjectStore();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [localCeoName, setLocalCeoName] = useState(ceoName);
  const [localShowSuggestions, setLocalShowSuggestions] = useState(showSuggestions);

  useEffect(() => {
    if (showConfigModal) {
      setLocalCeoName(ceoName);
      setLocalShowSuggestions(showSuggestions);
    }
  }, [showConfigModal, ceoName, showSuggestions]);

  const handleNewProject = () => {
    if (isProjectStarted) {
      if (confirm(`이미 진행 중인 프로젝트(${projectName})가 있습니다. 새로 시작하시겠습니까? (이전 데이터는 삭제됩니다)`)) {
        resetProject();
        navigate('/office');
      }
    } else {
      navigate('/office');
    }
  };

  const handleLoadProject = () => {
    if (isProjectStarted) {
      navigate('/office');
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.projectName && data.projectData) {
          startProject(data.projectName);
          Object.keys(data.projectData).forEach(deptId => {
            updateDeptData(deptId, data.projectData[deptId]);
          });
          alert('프로젝트를 성공적으로 불러왔습니다!');
          navigate('/office');
        } else {
          alert('올바르지 않은 프로젝트 파일입니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const saveConfig = () => {
    setConfig(localCeoName, localShowSuggestions);
    setShowConfigModal(false);
  };

  return (
    <div className="title-screen">
      <div className="game-bg"></div>
      
      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json"
        onChange={handleImportFile}
      />

      {/* Decorative Floating Bots */}
      <div className="floating-bot" style={{ top: '15%', left: '10%', animationDelay: '0s' }}></div>
      <div className="floating-bot" style={{ top: '70%', right: '15%', animationDelay: '1s' }}></div>
      <div className="floating-bot" style={{ top: '20%', right: '25%', animationDelay: '2.5s', width: '40px', height: '40px' }}></div>

      <header style={{ zIndex: 1 }}>
        <h1 className="game-title">AGMC</h1>
        <p className="game-subtitle">AI Game Maker Company</p>
      </header>

      <div className="menu-options" style={{ zIndex: 1 }}>
        <div className="menu-item" onClick={handleNewProject}>
          {isProjectStarted ? 'NEW PROJECT (초기화)' : 'NEW PROJECT (출근하기)'}
        </div>
        <div className="menu-item" onClick={handleLoadProject}>
          {isProjectStarted ? `CONTINUE: ${projectName}` : 'IMPORT PROJECT'}
        </div>
        <div className="menu-item" onClick={() => setShowConfigModal(true)}>
          CONFIG
        </div>
        <div className="menu-item" onClick={() => window.close()}>
          EXIT
        </div>
      </div>

      {showConfigModal && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: '#16161a', border: '2px solid #00a8ff', borderRadius: '12px', width: '450px', padding: '40px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#00a8ff', marginTop: 0, textAlign: 'center', marginBottom: '30px' }}>⚙️ 시스템 설정 (CONFIG)</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '14px' }}>사용자 호칭</label>
              <input 
                type="text" 
                value={localCeoName}
                onChange={(e) => setLocalCeoName(e.target.value)}
                placeholder="예: 김대표, 디렉터님"
                style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
              <input 
                type="checkbox" 
                id="homeShowSuggestions"
                checked={localShowSuggestions}
                onChange={(e) => setLocalShowSuggestions(e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <label htmlFor="homeShowSuggestions" style={{ color: '#aaa', fontSize: '14px', cursor: 'pointer' }}>
                부서별 초보자용 예시(가이드) 표시 켜기
              </label>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setShowConfigModal(false)}
                style={{ flex: 1, padding: '12px', backgroundColor: '#333', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', borderRadius: '4px' }}
              >
                취소
              </button>
              <button 
                onClick={saveConfig}
                style={{ flex: 1, padding: '12px', backgroundColor: '#00a8ff', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', borderRadius: '4px' }}
              >
                설정 저장
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ position: 'absolute', bottom: '2rem', color: 'var(--text-muted)', fontSize: '1.2rem', zIndex: 1 }}>
        © 2026 AI Game Maker Company. All Rights Reserved.
      </footer>
    </div>
  );
}

export default Home;
