import { speak, skip } from './tts.js';
import { filterText } from './filters.js';
import { State } from './storage.js';

let queue = [];
let isProcessing = false;

export function addEvent(type, data) {
  const evConfig = State.config.events[type];
  if (evConfig === false) return;

  let textToSpeak = '';
  let priority = 2; // Default
  
  if (type === 'chat') {
    textToSpeak = filterText(data.comment);
    if (!textToSpeak) return;
  } else if (type === 'gift') {
    priority = 1; // Donaciones primero
    textToSpeak = State.config.tts.tplGift
      .replace('{usuario}', data.nickname)
      .replace('{cantidad}', data.gift.repeat_count)
      .replace('{regalo}', data.gift.gift_name);
  } else if (type === 'member') {
    textToSpeak = `${data.nickname} se ha unido`;
  } else if (type === 'like') {
    textToSpeak = `${data.nickname} dio me gusta`;
  }

  if (!textToSpeak) return;

  queue.push({ type, text: textToSpeak, data, id: Date.now() });
  queue.sort((a, b) => a.priority - b.priority); // Reordenar por prioridad
  updateUI();
  processQueue();
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  
  const current = queue.shift();
  updateUI();
  
  speak(current.text, () => {
    isProcessing = false;
    processQueue();
  });
}

export function skipCurrent() { skip(); }
export function clearQueue() { queue = []; skip(); updateUI(); }

function updateUI() {
  document.getElementById('queue-count').innerText = queue.length;
  const log = document.getElementById('queue-log');
  log.innerHTML = queue.slice(0, 50).map(q => 
    `<div class="log-item ${q.type}">${q.data.nickname}: ${q.text}</div>`
  ).join('');
}
