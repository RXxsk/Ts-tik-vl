window.AppUI = {
  status(text, connected = false) {
    document.getElementById('server-status').textContent = text;
    document.getElementById('live-state').textContent = connected ? 'Conectado' : 'Desconectado';
    document.querySelectorAll('.connection-pill .status-dot').forEach(dot => dot.style.background = connected ? '#6be5b0' : '#ffb86b');
  },
  event(type, payload) {
    const list = document.getElementById('events-list');
    const empty = list.querySelector('.empty-state'); if (empty) empty.remove();
    const item = document.createElement('div'); item.className = 'event-item';
    const top = document.createElement('div'); top.className = 'event-top';
    const label = document.createElement('span'); label.className = 'event-type'; label.textContent = type;
    const time = document.createElement('span'); time.className = 'helper'; time.textContent = new Date().toLocaleTimeString();
    const body = document.createElement('div'); body.className = 'event-body';
    const user = payload?.nickname || payload?.uniqueId || payload?.user?.nickname || 'TikTok';
    const message = payload?.comment || payload?.giftName || payload?.label || payload?.displayType || JSON.stringify(payload).slice(0, 180);
    body.textContent = `${user}: ${message}`;
    top.append(label, time); item.append(top, body); list.prepend(item);
    while (list.children.length > 80) list.lastElementChild.remove();
  }
};