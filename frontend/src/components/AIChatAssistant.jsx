import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader } from 'lucide-react';
import { apiAIChat } from '../services/api';

const WELCOME = {
  role: 'ai',
  content: "👋 Hi! I'm **EverActive Care AI**. I can help you with:\n- Our clinic services\n- Booking appointments\n- Doctor information\n- General physiotherapy FAQs\n\nHow can I help you today?"
};

export default function AIChatAssistant() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history in format the backend expects (skip the welcome message)
      const history = messages
        .filter(m => m.role !== 'ai' || m !== WELCOME)
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));

      const data = await apiAIChat(history, text);
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "I'm having a connection issue right now. Please call us at **+44 7542 221845** or try again shortly!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Simple markdown bold renderer
  const renderContent = (text) =>
    text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.+?)\*\*/).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));

  return (
    <>
      {/* Floating button */}
      <button className="chat-fab" onClick={() => setOpen(v => !v)} title="Chat with EverActive AI">
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={20} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:'.95rem' }}>EverActive Care AI</div>
              <div style={{ display:'flex', alignItems:'center', gap:'.4rem', fontSize:'.75rem', opacity:.8 }}>
                <span className="chat-status-dot" /> Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.7)', cursor:'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
                {renderContent(msg.content)}
              </div>
            ))}
            {loading && (
              <div className="msg msg-ai">
                <div className="chat-typing">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask about services, doctors…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button className="chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? <Loader size={16} className="spin" style={{ animation:'spin .9s linear infinite' }} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
