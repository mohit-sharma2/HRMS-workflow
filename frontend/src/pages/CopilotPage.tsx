import { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

const QUICK_QUESTIONS = [
  'How do I apply for leave?',
  'What is my leave balance policy?',
  'How is my salary calculated?',
  'What are the attendance policies?',
  'How do I submit an expense?',
  'What trainings are mandatory?',
];

export default function CopilotPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am your HR Copilot powered by AI. I can help you with leave policies, attendance, payroll, expenses, and any HR related questions. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: text };
    const loadingMsg: Message = { id: Date.now() + 1, role: 'assistant', content: '', loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.filter(m => !m.loading).slice(-6).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text },
          ],
          userContext: {
            name: user?.name,
            role: user?.role,
            department: user?.department,
            designation: user?.designation,
          },
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'Sorry, I could not process your request.';
      setMessages(prev => prev.map(m => m.loading ? { ...m, content: reply, loading: false } : m));
    } catch {
      setMessages(prev => prev.map(m =>
        m.loading ? { ...m, content: 'Something went wrong. Please try again.', loading: false } : m
      ));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function resetChat() {
    setMessages([{
      id: 1,
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am your HR Copilot. How can I assist you today?`,
    }]);
  }

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">HR Copilot</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs text-gray-500">Powered by Groq AI (Llama 3.3)</p>
            </div>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw size={14} /> New Chat
        </button>
      </div>

      {/* Chat Box */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length <= 1 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'assistant' ? 'bg-teal-600' : 'bg-gray-700'}`}>
                {msg.role === 'assistant'
                  ? <Sparkles size={16} className="text-white" />
                  : <User size={16} className="text-white" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'assistant'
                  ? 'bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100'
                  : 'bg-teal-600 text-white rounded-tr-sm'}`}>
                {msg.loading ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input — fixed at bottom inside card */}
        <div className="flex-shrink-0 border-t border-gray-100 p-3 bg-white">
          <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about HR policies..."
              rows={1}
              style={{ resize: 'none' }}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 max-h-24"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white hover:bg-teal-700 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}