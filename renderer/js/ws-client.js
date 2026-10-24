import { addEvent } from './queue.js';
let ws;

export function initWS() {
  ws = new WebSocket(`ws://${location.host}`);
  ws.onmessage = (event) => {
    const res = JSON.parse(event.data);
    if (res.type === 'status') {
      const badge = document.getElementById('status-badge');
      badge.innerText = res.data;
      badge.style.color = res.data === 'connected' ? '#10b981' : '#ef4444';
      badge.style.borderColor = badge.style.color;
    } else {
      addEvent(res.type, res.data);
    }
  };
  ws.onclose = () => setTimeout(initWS, 2000);
}

export function connectLive(username) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ action: 'connect', username }));
  }
}
