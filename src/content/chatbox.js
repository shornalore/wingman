class Chatbox {
  constructor() {
    this.container = null;
    this.interactionCount = 0;
    this.maxInteractions = 3;
    this.currentText = '';
    this.messageHistory = [];
    this.init();
  }

  init() {
    this.createContainer();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'wingman-popover';
    this.container.innerHTML = `
      <div class="wingman-header">
        <span class="wingman-title">Wingman</span>
        <button class="wingman-close">&times;</button>
      </div>
      <div class="wingman-content">
        <div class="wingman-actions">
          <button class="wingman-btn" data-mode="define">Define</button>
          <button class="wingman-btn" data-mode="explain">Explain</button>
        </div>
        <div class="wingman-messages"></div>
        <div class="wingman-input-container">
          <input type="text" class="wingman-input" placeholder="Ask a follow-up..." maxlength="200">
          <button class="wingman-send">Send</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.container);
    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelector('.wingman-close').addEventListener('click', () => this.hide());
    
    this.container.querySelectorAll('.wingman-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        this.ask(this.currentText, mode);
      });
    });

    const input = this.container.querySelector('.wingman-input');
    const sendBtn = this.container.querySelector('.wingman-send');
    
    sendBtn.addEventListener('click', () => this.sendFollowUp());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendFollowUp();
    });
  }

  show(text, position) {
    this.currentText = text;
    this.interactionCount = 0;
    this.messageHistory = [];
    
    this.container.style.left = `${position.x}px`;
    this.container.style.top = `${position.y}px`;
    this.container.style.display = 'block';
    
    this.container.querySelector('.wingman-messages').innerHTML = '';
    this.container.querySelector('.wingman-input').value = '';
    this.container.querySelector('.wingman-input').disabled = false;
  }

  hide() {
    this.container.style.display = 'none';
  }

  ask(text, mode) {
    if (this.interactionCount >= this.maxInteractions) return;

    this.interactionCount++;
    this.addMessage(text, 'user');
    
    // Show loading state
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'wingman-message wingman-loading';
    loadingMsg.textContent = 'Loading...';
    this.container.querySelector('.wingman-messages').appendChild(loadingMsg);
    
    console.log('Sending request to background:', { text, mode });
    
    // Send message and wait for response
    chrome.runtime.sendMessage({
      type: 'ASK',
      payload: { text, mode, thread: this.messageHistory }
    }, (response) => {
      console.log('Received response in callback:', response);
      
      // Remove loading message
      const loading = this.container.querySelector('.wingman-loading');
      if (loading) loading.remove();
      
      if (!response) {
        console.error('No response received from background script');
        this.addMessage('No response from server', 'error');
        return;
      }
      
      if (response.error) {
        console.error('Error from API:', response.error);
        this.addMessage(`Error: ${response.error}`, 'error');
      } else {
        console.log('Adding answer to chat:', response.answer);
        this.addMessage(response.answer, 'assistant');
        this.messageHistory.push({ role: 'user', content: text });
        this.messageHistory.push({ role: 'assistant', content: response.answer });
      }
    });

    if (this.interactionCount >= this.maxInteractions) {
      this.container.querySelector('.wingman-input').disabled = true;
      this.container.querySelector('.wingman-input').placeholder = 'Limit reached';
    }
  }

  sendFollowUp() {
    const input = this.container.querySelector('.wingman-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    this.ask(text, 'explain');
    input.value = '';
  }

  addMessage(text, type) {
    const messages = this.container.querySelector('.wingman-messages');
    const message = document.createElement('div');
    message.className = `wingman-message wingman-${type}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }
}
