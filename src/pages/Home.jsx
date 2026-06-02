import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="title-screen">
      <div className="game-bg"></div>
      
      {/* Decorative Floating Bots */}
      <div className="floating-bot" style={{ top: '15%', left: '10%', animationDelay: '0s' }}></div>
      <div className="floating-bot" style={{ top: '70%', right: '15%', animationDelay: '1s' }}></div>
      <div className="floating-bot" style={{ top: '20%', right: '25%', animationDelay: '2.5s', width: '40px', height: '40px' }}></div>

      <header style={{ zIndex: 1 }}>
        <h1 className="game-title">AGMC</h1>
        <p className="game-subtitle">AI Game Maker Company</p>
      </header>

      <div className="menu-options" style={{ zIndex: 1 }}>
        <div className="menu-item" onClick={() => navigate('/office')}>
          NEW PROJECT (출근하기)
        </div>
        <div className="menu-item" onClick={() => alert('Coming Soon!')}>
          LOAD PROJECT
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
