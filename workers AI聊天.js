export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      return new Response(getHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const { message, history = [] } = body;

        if (!message?.trim()) {
          return Response.json({ success: false, error: "消息不能为空" }, { status: 400 });
        }

        const messages = [
          { role: "system", content: "你是一个友好、聪明、有帮助的AI助手。请用中文回复用户的问题。" },
          ...history.slice(-12),
          { role: "user", content: message }
        ];

        const aiResponse = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            messages,
            temperature: 0.75,
            max_tokens: 800,
            stream: true
          }
        );

        return new Response(aiResponse, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        });

      } catch (error) {
        console.error("AI 调用错误:", error);
        return Response.json({ success: false, error: "服务器内部错误" }, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};

// ====================== 前端界面 ======================
function getHTML() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 助手</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    :root {
      --primary: #1e40af;
    }

    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin:0; 
      height:100vh; 
      display:flex; 
      justify-content:center; 
      align-items:center; 
      transition: background 0.4s;
    }

    .chat-container { 
      width:100%; 
      max-width:860px; 
      height:95vh; 
      border-radius:22px; 
      box-shadow: 0 15px 35px rgba(0,0,0,0.12); 
      display:flex; 
      flex-direction:column; 
      overflow:hidden; 
    }

    .header { 
      color:white; 
      padding:17px 26px; 
      font-size:20px; 
      font-weight:600; 
      display:flex; 
      justify-content:space-between; 
      align-items:center;
    }

    .messages { 
      flex:1; 
      padding:30px 26px; 
      overflow-y:auto; 
      display:flex; 
      flex-direction:column; 
      gap:24px;
      font-size: 16.6px;
      line-height: 1.72;
    }

    .message { 
      display:flex; 
      max-width:82%; 
    }

    .user { margin-left:auto; flex-direction:row-reverse; }
    .bot { margin-right:auto; }

    .bubble { 
      padding:16px 22px; 
      border-radius:20px; 
      line-height:1.72; 
      font-size:16.6px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .user .bubble { 
      background: var(--primary); 
      color: #ffffff; 
      border-bottom-right-radius:6px; 
    }

    .actions { margin-top:8px; font-size:13.5px; }
    .actions button { 
      background:none; border:none; color:#64748b; cursor:pointer; margin-right:14px;
    }

    .input-area { 
      padding:20px 26px; 
      border-top:1px solid #e2e8f0; 
    }

    .input-wrapper { 
      display:flex; 
      gap:10px; 
      align-items:center;
    }

    input { 
      flex:1; 
      padding:16px 22px; 
      border:1px solid #cbd5e1; 
      border-radius:9999px; 
      font-size:16.5px; 
      outline:none;
    }
    input:focus { border-color: var(--primary); }

    button { 
      padding:0 34px; 
      background: var(--primary); 
      color:white; 
      border:none; 
      border-radius:9999px; 
      cursor:pointer; 
      font-size:16px;
    }

    .mic-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #e2e8f0;
      border: none;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 23px;
    }

    .mic-btn.listening {
      background: #ef4444;
      color: white;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .theme-btn {
      background:none;
      border:none;
      color:white;
      font-size:14px;
      cursor:pointer;
      padding:4px 10px;
    }
  </style>
</head>
<body>
  <div class="chat-container" id="container">
    <div class="header" id="header">
      <span>AI 助手</span>
      <div>
        <button class="theme-btn" onclick="switchTheme(0)">高级深灰</button>
        <button class="theme-btn" onclick="switchTheme(1)">纯净白</button>
        <button class="theme-btn" onclick="switchTheme(2)">柔和青</button>
        <button onclick="clearChat()" style="background:none;border:none;color:white;font-size:14px;cursor:pointer;">清空</button>
      </div>
    </div>
    <div class="messages" id="messages"></div>
    
    <div class="input-area">
      <div class="input-wrapper">
        <input type="text" id="userInput" placeholder="输入消息，按 Enter 发送..." autocomplete="off">
        <button class="mic-btn" id="micBtn" title="语音输入">🎤</button>
        <button id="sendBtn" onclick="sendMessage()">发送</button>
      </div>
    </div>
  </div>

  <script>
    let history = [];
    let currentThinkingDiv = null;
    let currentTheme = 0;

    const themes = [
      // 0: 高级深灰
      { bg: '#111827', surface: '#1f2937', header: '#1f2937', botBubble: '#374151', botText: '#f3f4f6' },
      // 1: 纯净白
      { bg: '#f8fafc', surface: '#ffffff', header: '#334155', botBubble: '#f1f5f9', botText: '#1f2937' },
      // 2: 柔和青
      { bg: '#ecfdf5', surface: '#f0fdfa', header: '#0f766e', botBubble: '#ccfbf1', botText: '#134e4a' }
    ];

    const messagesDiv = document.getElementById('messages');
    const input = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const container = document.getElementById('container');
    const header = document.getElementById('header');

    let recognition = null;
    let isListening = false;

    function applyTheme(n) {
      currentTheme = n;
      const t = themes[n];
      
      document.body.style.background = t.bg;
      container.style.background = t.surface;
      header.style.background = t.header;

      document.querySelectorAll('.bot .bubble').forEach(b => {
        b.style.background = t.botBubble;
        b.style.color = t.botText;
      });
    }

    function addMessage(content, role) {
      const div = document.createElement('div');
      div.className = \`message \${role}\`;
      
      div.innerHTML = \`
        <div class="bubble">\${role === 'bot' ? marked.parse(content) : content}</div>
        \${role === 'bot' ? \`
        <div class="actions">
          <button onclick="copyMessage(this)">复制</button>
          <button onclick="regenerateMessage(this)">重新生成</button>
        </div>\` : ''}
      \`;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage() {
      const message = input.value.trim();
      if (!message || sendBtn.disabled) return;

      addMessage(message, 'user');
      input.value = '';
      sendBtn.disabled = true;

      currentThinkingDiv = document.createElement('div');
      currentThinkingDiv.className = 'message bot';
      currentThinkingDiv.innerHTML = '<div class="bubble">思考中...</div>';
      messagesDiv.appendChild(currentThinkingDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history })
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullReply = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const token = JSON.parse(data).response;
                if (token) {
                  fullReply += token;
                  currentThinkingDiv.querySelector('.bubble').innerHTML = marked.parse(fullReply);
                  messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
              } catch(e) {}
            }
          }
        }

        history = [...history, 
          { role: "user", content: message },
          { role: "assistant", content: fullReply }
        ].slice(-20);

      } catch (err) {
        currentThinkingDiv.querySelector('.bubble').innerHTML = '❌ 连接失败，请重试';
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }

    function startVoiceInput() {
      if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert('您的浏览器不支持语音输入');
        return;
      }

      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'zh-CN';
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        input.value = event.results[0][0].transcript;
      };

      recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
      };

      recognition.start();
      isListening = true;
      micBtn.classList.add('listening');
    }

    micBtn.addEventListener('click', startVoiceInput);

    function copyMessage(btn) {
      const bubble = btn.parentElement.parentElement.querySelector('.bubble');
      navigator.clipboard.writeText(bubble.textContent.trim());
      btn.textContent = '已复制';
      setTimeout(() => btn.textContent = '复制', 1500);
    }

    function regenerateMessage(btn) {
      const messageDiv = btn.closest('.message');
      const prev = messageDiv.previousElementSibling;
      if (prev && prev.classList.contains('user')) {
        const text = prev.querySelector('.bubble').textContent.trim();
        messageDiv.remove();
        input.value = text;
        sendMessage();
      }
    }

    function clearChat() {
      if (confirm('确定清空所有对话吗？')) {
        messagesDiv.innerHTML = '';
        history = [];
        addMessage('你好！我是 AI 助手，有什么可以帮你的？', 'bot');
      }
    }

    function switchTheme(n) {
      applyTheme(n);
    }

    input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    window.onload = () => {
      input.focus();
      addMessage('你好！我是 AI 助手，有什么可以帮你的？', 'bot');
      applyTheme(2); // 默认使用柔和青
    };
  </script>
</body>
</html>`;
}
