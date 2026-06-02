import { useState, useEffect, useRef } from 'react';
import { getAIResponse } from '../services/ai';

function Office() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '회장님, 안녕하십니까. 어떤 프로젝트를 시작할까요?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const apiMessages = newMessages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }));

    const aiContent = await getAIResponse(apiMessages);
    
    setMessages(prev => [...prev, { 
      role: 'ai', 
      content: aiContent 
    }]);
    setIsTyping(false);
  };

  return (
    <div className="office-split-layout">
      <div className="game-bg"></div>
      
      {/* Left Side: Stable 2D AI Workspace */}
      <div className="ai-character-container" style={{ borderRight: '2px solid var(--accent-color)', background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
          <h2 style={{ color: 'var(--accent-color)', fontSize: '2.5rem', margin: 0, textShadow: '0 0 10px var(--accent-color)' }}>전략기획실</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', margin: 0 }}>OFFICE_STATUS: ONLINE</p>
        </div>

        {/* AI Character Sprite - Stable Positioning */}
        <div style={{ position: 'relative', width: '300px', height: '300px' }}>
          <div className={`ai-sprite ${isTyping ? 'ai-typing' : ''}`} style={{ bottom: '100px' }}>
            <div style={{ position: 'absolute', top: '20%', left: '20%', width: '10px', height: '10px', background: '#000' }}></div>
            <div style={{ position: 'absolute', top: '20%', right: '20%', width: '10px', height: '10px', background: '#000' }}></div>
          </div>
          <div className="ai-desk" style={{ bottom: '0', left: '50%', transform: 'translateX(-50%)' }}>
            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '50px', background: 'rgba(56, 189, 248, 0.2)', border: '2px solid var(--accent-color)', boxShadow: '0 0 15px var(--accent-color)', animation: 'float 3s infinite' }}></div>
          </div>
        </div>

        {/* Floor Line */}
        <div style={{ position: 'absolute', bottom: '20%', width: '100%', height: '4px', background: 'rgba(56, 189, 248, 0.5)', boxShadow: '0 0 10px var(--accent-color)' }}></div>
      </div>

      {/* Right Side: Professional Chat Terminal */}
      <div className="chat-terminal">
        <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--accent-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.8)' }}>
          <span style={{ color: 'var(--accent-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>SYSTEM_LOG :: REPORT_MODE</span>
          <button className="menu-item" style={{ fontSize: '1.2rem', padding: '0.2rem 1rem' }} onClick={() => window.history.back()}>
            EXIT
          </button>
        </div>

        {/* Corrected Message Log Container */}
        <div ref={scrollRef} className="message-log-container">
          {messages.map((msg, i) => (
            <div key={i} className="message-bubble" style={{ 
              alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
              maxWidth: '95%',
              color: msg.role === 'ai' ? 'var(--text-main)' : 'var(--accent-color)',
              borderLeft: msg.role === 'ai' ? '4px solid var(--accent-color)' : 'none',
              borderRight: msg.role === 'user' ? '4px solid #fff' : 'none',
              whiteSpace: 'pre-wrap' /* Respect newlines from AI */
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '0.5rem', opacity: 0.7, fontFamily: 'monospace' }}>
                {msg.role === 'ai' ? 'REPORT_FROM: AI_LEAD' : 'COMMAND_FROM: CHAIRMAN'}
              </div>
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div style={{ color: 'var(--accent-color)', fontSize: '1.2rem', padding: '1rem', fontStyle: 'italic' }}>AI 팀장님이 보고서를 작성 중입니다...</div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ borderTop: '2px solid var(--accent-color)', padding: '1.5rem', display: 'flex', gap: '1rem', background: 'rgba(15, 23, 42, 0.9)' }}>
          <span style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>{'>'}</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="지시 사항을 입력하세요..."
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              color: '#fff', 
              fontSize: '1.5rem', 
              fontFamily: 'var(--game-font)',
              outline: 'none'
            }}
            autoFocus
          />
        </div>
      </div>

      {/* CRT Scanline Effect */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 255, 0, 0.02))',
        backgroundSize: '100% 4px, 3px 100%',
        pointerEvents: 'none',
        zIndex: 10
      }}></div>
    </div>
  );
}

export default Office;
