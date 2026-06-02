import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Office from './pages/Office';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/office" element={<Office />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
