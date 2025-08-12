class TextSelector {
  constructor() {
    this.chatbox = null;
    this.init();
  }

  init() {
    document.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  handleDoubleClick(e) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (!text || text.length > 600) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    this.showPopover(text, rect);
  }

  showPopover(text, rect) {
    if (!this.chatbox) {
      this.chatbox = new Chatbox();
    }
    
    this.chatbox.show(text, {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  }

  handleClickOutside(e) {
    if (this.chatbox && !this.chatbox.container.contains(e.target)) {
      this.chatbox.hide();
    }
  }
}

// Initialize selector
new TextSelector();
