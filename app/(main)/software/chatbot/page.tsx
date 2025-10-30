'use client';
import { useState, useEffect, useRef } from 'react';
import { Code, Send, MessageSquare, Eye, EyeOff, Play } from 'lucide-react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="loading">Loading editor...</div>
});

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  codeSnippets?: Array<{ code: string; language: string; }>;
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAhJB5h3btdONhVYXcjvalk5ePTBm9JBgM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default function CodeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'CodeChat Assistant',
      content: "👋 Hello! I'm your AI coding assistant. I can help you with:\n\n• Writing code in various programming languages\n• Debugging and fixing code issues\n• Explaining programming concepts\n• Code reviews and optimizations\n\nJust ask me anything related to coding! 🚀",
      timestamp: new Date(),
      isUser: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [editorCode, setEditorCode] = useState('// Click on any code snippet in the chat to view it here\n// Start coding or ask me to generate some code!\n\nfunction welcomeToCodeChat() {\n  console.log("Welcome to CodeChat!");\n  console.log("Ready to code together!");\n}\n\nwelcomeToCodeChat();');
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightPanelMode, setRightPanelMode] = useState<'editor' | 'preview'>('editor');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractCodeSnippets = (text: string) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const snippets: Array<{ code: string; language: string; }> = [];
    let match;
    
    while ((match = codeRegex.exec(text)) !== null) {
      snippets.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    
    return snippets;
  };

  const formatMessage = (text: string) => {
    // Replace code blocks with clickable snippets
    let formatted = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<code-snippet data-language="${lang || 'text'}" data-code="${encodeURIComponent(code.trim())}">${code.trim()}</code-snippet>`;
    });
    
    // Replace inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline">$1</code>');
    
    // Format line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      author: 'You',
      content: inputMessage,
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful coding assistant. Please provide clear, concise responses with code examples when appropriate. Focus on the essential information and avoid overly verbose explanations. User question: ${inputMessage}`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        const codeSnippets = extractCodeSnippets(aiResponse);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          author: 'CodeChat Assistant',
          content: aiResponse,
          timestamp: new Date(),
          isUser: false,
          codeSnippets
        };

        // Add message with typing animation
        setMessages(prev => [...prev, { ...aiMessage, content: '' }]);
        
        // Simulate sentence-by-sentence response
        const sentences = aiResponse.split(/(?<=[.!?])\s+/);
        let currentContent = '';
        
        for (let i = 0; i < sentences.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          currentContent += (i > 0 ? ' ' : '') + sentences[i];
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: currentContent }
              : msg
          ));
        }
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        author: 'System',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCodeClick = (code: string, language: string) => {
    setEditorCode(code);
    setEditorLanguage(language);
    setRightPanelMode('editor');
    if (!showRightPanel) {
      setShowRightPanel(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showRightPanel) return;
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !showRightPanel) return;
      
      const containerWidth = window.innerWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      
      if (newWidth >= 25 && newWidth <= 75) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, showRightPanel]);

  const renderMessageContent = (content: string, codeSnippets?: Array<{ code: string; language: string; }>) => {
    const formatted = formatMessage(content);
    
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: formatted.replace(
            /<code-snippet data-language="([^"]*)" data-code="([^"]*)">([\s\S]*?)<\/code-snippet>/g,
            (match, lang, encodedCode, displayCode) => {
              return `<div class="code-snippet" data-language="${lang}" data-code="${encodedCode}">${displayCode}</div>`;
            }
          )
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('code-snippet')) {
            const encodedCode = target.getAttribute('data-code');
            const language = target.getAttribute('data-language');
            if (encodedCode && language) {
              const code = decodeURIComponent(encodedCode);
              handleCodeClick(code, language);
            }
          }
        }}
      />
    );
  };

  const generatePreview = () => {
    if (editorLanguage === 'html' || editorLanguage === 'xml') {
      return editorCode;
    } else if (editorLanguage === 'javascript' || editorLanguage === 'js') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>JavaScript Preview</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              padding: 20px; 
              background: #f8f9fa; 
              margin: 0;
            }
            .console { 
              background: #1a1a1a; 
              color: #00ff00; 
              padding: 15px; 
              border-radius: 8px; 
              font-family: 'SF Mono', Monaco, monospace; 
              font-size: 14px;
              min-height: 100px;
              white-space: pre-wrap;
            }
            h3 { color: #333; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h3>JavaScript Code Preview</h3>
          <div class="console" id="console">Console output will appear here...</div>
          <script>
            const originalLog = console.log;
            const originalError = console.error;
            const consoleEl = document.getElementById('console');
            
            console.log = function(...args) {
              consoleEl.innerHTML += '> ' + args.join(' ') + '\\n';
              originalLog.apply(console, args);
            };
            
            console.error = function(...args) {
              consoleEl.innerHTML += '❌ ' + args.join(' ') + '\\n';
              originalError.apply(console, args);
            };
            
            try {
              ${editorCode}
            } catch (error) {
              console.error('Error: ' + error.message);
            }
          </script>
        </body>
        </html>
      `;
    } else if (editorLanguage === 'css') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>CSS Preview</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f8f9fa; 
            }
            h1, h2, h3 { margin-bottom: 15px; }
            p { margin-bottom: 10px; line-height: 1.6; }
            .sample-div { 
              padding: 20px; 
              margin: 15px 0; 
              background: #e9ecef; 
              border-radius: 4px; 
            }
            .sample-button { 
              padding: 10px 20px; 
              margin: 10px 5px; 
              border: 1px solid #ccc; 
              border-radius: 4px; 
              cursor: pointer; 
            }
            ${editorCode}
          </style>
        </head>
        <body>
          <h1>CSS Preview</h1>
          <p>This is a sample paragraph to demonstrate your CSS styles.</p>
          <div class="sample-div">Sample div element with class "sample-div"</div>
          <button class="sample-button">Sample Button</button>
          <h2>Sample Heading 2</h2>
          <h3>Sample Heading 3</h3>
          <p>Another paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Code Preview</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              padding: 20px; 
              background: #f8f9fa; 
              margin: 0;
            }
            pre { 
              background: #1a1a1a; 
              color: #00ff00; 
              padding: 20px; 
              border-radius: 8px; 
              overflow: auto; 
              font-family: 'SF Mono', Monaco, monospace;
              font-size: 14px;
              line-height: 1.5;
            }
            h3 { color: #333; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h3>${editorLanguage.toUpperCase()} Code</h3>
          <pre><code>${editorCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </body>
        </html>
      `;
    }
  };

  return (
    <div className="children__fixed-h-wrapper">
      <div className="resizable-container">
        {/* Chat Panel */}
        <div 
          className={`panel ${!showRightPanel ? 'chat-only-mode' : ''}`} 
          style={{ width: showRightPanel ? `${leftPanelWidth}%` : '100%' }}
        >
          <div className="header">
            <div className="header-left">
              <div className="header-title">
                <MessageSquare size={20} />
                CodeChat
              </div>
              <div className="header-subtitle">Now</div>
            </div>
            <div className="header-controls">
              <button
                className="toggle-button"
                onClick={() => setShowRightPanel(!showRightPanel)}
              >
                {showRightPanel ? <EyeOff size={16} /> : <Eye size={16} />}
                {showRightPanel ? 'Hide Panel' : 'Show Panel'}
              </button>
            </div>
          </div>
          
          <div className="chat-panel">
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.isUser ? 'user' : ''}`}>
                  <div className="message-header">
                    <div className="message-avatar">
                      {message.isUser ? 'U' : message.author === 'System' ? 'S' : 'AI'}
                    </div>
                    <div className="message-info">
                      <div className="message-author">{message.author}</div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`message-content ${message.isUser ? 'user' : ''}`}>
                    {renderMessageContent(message.content, message.codeSnippets)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message typing-animation">
                  <div className="message-header">
                    <div className="message-avatar">AI</div>
                    <div className="message-info">
                      <div className="message-author">CodeChat Assistant</div>
                      <div className="message-time">now</div>
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="loading">
                      Thinking<span className="loading-dots"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  placeholder="Ask me to help you code something..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        {showRightPanel && (
          <div
            className="resize-handle"
            onMouseDown={handleMouseDown}
            ref={resizeRef}
          />
        )}

        {/* Code Editor Panel */}
        {showRightPanel && (
          <div className="panel code-editor-panel" style={{ width: `${100 - leftPanelWidth}%` }}>
            <div className="header">
              <div className="header-left">
                <div className="header-title">
                  <Code size={20} />
                  {rightPanelMode === 'editor' ? `Code Editor (${editorLanguage})` : 'Preview'}
                </div>
              </div>
              <div className="header-controls">
                <button
                  className={`toggle-button ${rightPanelMode === 'editor' ? 'active' : ''}`}
                  onClick={() => setRightPanelMode('editor')}
                >
                  <Code size={16} />
                  Editor
                </button>
                <button
                  className={`toggle-button ${rightPanelMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setRightPanelMode('preview')}
                >
                  <Play size={16} />
                  Preview
                </button>
              </div>
            </div>
            
            {rightPanelMode === 'editor' ? (
              <div className="editor-container">
                <MonacoEditor
                  height="100%"
                  language={editorLanguage}
                  value={editorCode}
                  onChange={(value) => setEditorCode(value || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    folding: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    contextmenu: true,
                    mouseWheelZoom: true,
                  }}
                />
              </div>
            ) : (
              <div className="preview-container">
                <iframe
                  className="preview-iframe"
                  srcDoc={generatePreview()}
                  title="Code Preview"
                  sandbox="allow-scripts"
                />
              </div>
            )}
          </div>
        )}
      </div>
      </div>
  );
}