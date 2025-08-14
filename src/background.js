// const API_BASE = 'http://localhost:3000'; // dev
const API_BASE = 'https://wingman-kappa.vercel.app'; // prod

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ASK') {
    console.log('Background script received message:', msg);
    
    // Track API usage
    browser.storage.local.get(['wingman_usage']).then((result) => {
      const current = result.wingman_usage || 0;
      const newCount = current + 1;
      return browser.storage.local.set({ wingman_usage: newCount });
    }).catch(console.error);
    
    // Use a simple fetch without async/await to ensure sendResponse is called
    fetch(`${API_BASE}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg.payload)
    })
    .then(res => {
      console.log('API response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return res.json();
    })
    .then(json => {
      console.log('API response data:', json);
      sendResponse(json);
    })
    .catch(e => {
      console.error('Background script error:', e);
      sendResponse({error: e.message});
    });
    
    return true; // async sendResponse
  }
});
