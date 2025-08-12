const API_BASE = 'http://localhost:3000'; // dev
// const API_BASE = 'https://wingman-api.vercel.app'; // prod

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type !== 'ASK') return;
  
  try {
    const res = await fetch(`${API_BASE}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg.payload)
    });
    const json = await res.json();
    sendResponse(json);
  } catch (e) {
    sendResponse({error: e.message});
  }
  return true; // async sendResponse
});
