// =============================================
    // 🔑 PASTE YOUR ANTHROPIC API KEY BELOW
    const ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE';
    // Get your free key at: https://console.anthropic.com
    // =============================================

    const SYSTEM_PROMPT = `You are Alex's friendly AI assistant on his portfolio website. 
Alex is a Creative Developer & Designer with 5+ years experience.
Services: UI/UX Design, Frontend Development (React, Next.js), Motion & Animation, E-Commerce (Shopify), Responsive Design, Brand Identity.
Projects: Nova Dashboard (analytics), Soundwave Studio (music branding), Tide Apparel (e-commerce), Synaptic AI (SaaS).
Skills: Figma, React, Next.js, TypeScript, Framer Motion, Tailwind CSS, GSAP, Three.js, Shopify, Node.js.
Contact: visitors can use the contact form on the website.
Keep responses short, friendly, and helpful. Use emojis occasionally. If asked about pricing, say it depends on project scope and to use the contact form.`;

    let chatHistory = [];
    let isOpen = false;
    let isLoading = false;

    function toggleChat() {
      isOpen = !isOpen;
      document.getElementById('chat-window').classList.toggle('open', isOpen);
      document.getElementById('chat-btn').classList.toggle('open', isOpen);
      if (isOpen && chatHistory.length === 0) {
        setTimeout(() => addBotMessage("👋 Hi! I'm Alex's AI assistant. I can tell you about his skills, services, projects, and how to get in touch. What would you like to know?"), 400);
      }
      if (isOpen) setTimeout(() => document.getElementById('chat-input').focus(), 350);
    }

    function addBotMessage(text) {
      const msgs = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'msg bot';
      div.innerHTML = `<div class="msg-icon">🤖</div><div class="msg-bubble">${text}</div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function addUserMessage(text) {
      const msgs = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'msg user';
      div.innerHTML = `<div class="msg-bubble">${text}</div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
      const msgs = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'msg bot'; div.id = 'typing';
      div.innerHTML = `<div class="msg-icon">🤖</div><div class="typing-dots"><span></span><span></span><span></span></div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTyping() {
      const t = document.getElementById('typing');
      if (t) t.remove();
    }

    function sendQuick(text) {
      document.getElementById('quick-replies').style.display = 'none';
      document.getElementById('api-notice').style.display = 'none';
      sendMessage(text);
    }

    async function sendMessage(overrideText) {
      const input = document.getElementById('chat-input');
      const text = overrideText || input.value.trim();
      if (!text || isLoading) return;

      input.value = '';
      document.getElementById('quick-replies').style.display = 'none';
      document.getElementById('api-notice').style.display = 'none';
      addUserMessage(text);
      chatHistory.push({ role: 'user', content: text });

      isLoading = true;
      document.getElementById('chat-send').disabled = true;
      showTyping();

      // Check API key
      if (ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
        hideTyping();
        addBotMessage("⚠️ Please add your Anthropic API key in the code to activate AI responses. <a href='https://console.anthropic.com' target='_blank' style='color:var(--yellow)'>Get free key →</a>");
        isLoading = false;
        document.getElementById('chat-send').disabled = false;
        return;
      }

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: chatHistory
          })
        });

        const data = await res.json();
        hideTyping();

        if (data.content && data.content[0]) {
          const reply = data.content[0].text;
          chatHistory.push({ role: 'assistant', content: reply });
          addBotMessage(reply);
        } else {
          addBotMessage("Sorry, something went wrong. Please try again! 😅");
        }
      } catch (err) {
        hideTyping();
        addBotMessage("Oops! Connection error. Please check your API key and try again. 🔧");
      }

      isLoading = false;
      document.getElementById('chat-send').disabled = false;
    }
