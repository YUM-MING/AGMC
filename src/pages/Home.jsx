import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useRef } from 'react';

function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isProjectStarted, projectName, startProject, updateDeptData, resetProject } = useProjectStore();

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
        <div className="menu-item" onClick={() => alert('Settings')}>
          CONFIG
        </div>
        <div className="menu-item" onClick={() => window.close()}>
          EXIT
        </div>
      </div>

      <footer style={{ position: 'absolute', bottom: '2rem', color: 'var(--text-muted)', fontSize: '1.2rem', zIndex: 1 }}>
        © 2026 AI Game Maker Company. All Rights Reserved.
      </footer>
    </div>
  );
}

export default Home;
