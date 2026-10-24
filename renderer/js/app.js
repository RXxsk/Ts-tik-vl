import { State } from './storage.js';
import { loadVoices, speak } from './tts.js';
import { initWS, connectLive } from './ws-client.js';
import { skipCurrent, clearQueue } from './queue.js';

document.documentElement.setAttribute('data-theme', State.config.theme);

// Pestañas
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById(e.target.dataset.target).classList.add('active');
  });
});

// UI Data Binding
document.getElementById('username').value = State.config.username;
document.getElementById('ev-chat').checked = State.config.events.chat;
document.getElementById('ev-gift').checked = State.config.events.gift;
document.getElementById('fl-cmds').checked = State.config.filters.cmds;
document.getElementById('fl-links').checked = State.config.filters.links;
document.getElementById('tts-rate').value = State.config.tts.rate;
document.getElementById('tpl-gift').value = State.config.tts.tplGift;

// Guardar Configs On Change
document.body.addEventListener('change', (e) => {
  if (e.target.id === 'username') State.config.username = e.target.value;
  if (e.target.id === 'ev-chat') State.config.events.chat = e.target.checked;
  if (e.target.id === 'ev-gift') State.config.events.gift = e.target.checked;
  if (e.target.id === 'fl-cmds') State.config.filters.cmds = e.target.checked;
  if (e.target.id === 'fl-links') State.config.filters.links = e.target.checked;
  if (e.target.id === 'fl-badwords') State.config.filters.badwords = e.target.value;
  if (e.target.id === 'tts-engine') State.config.tts.engine = e.target.value;
  if (e.target.id === 'tts-voice') State.config.tts.voiceURI = e.target.value;
  if (e.target.id === 'tts-rate') State.config.tts.rate = e.target.value;
  if (e.target.id === 'tpl-gift') State.config.tts.tplGift = e.target.value;
  State.save();
  showToast();
});

// Botones
document.getElementById('btn-connect').onclick = () => connectLive(State.config.username);
document.getElementById('btn-skip').onclick = skipCurrent;
document.getElementById('btn-clear').onclick = clearQueue;
document.getElementById('btn-theme').onclick = () => {
  State.config.theme = State.config.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', State.config.theme);
  State.save();
};
document.getElementById('btn-test-voice').onclick = () => {
  speak("Prueba de voz conectada exitosamente.", () => {});
};

// Cargar Voces
loadVoices().then(voices => {
  const select = document.getElementById('tts-voice');
  voices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} (${v.lang})`;
    if(v.voiceURI === State.config.tts.voiceURI) opt.selected = true;
    select.appendChild(opt);
  });
});

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// Global Keyboard Shortcuts (Space=Pause, Right=Skip, Esc=Clear)
document.addEventListener('keydown', (e) => {
  if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight') skipCurrent();
  if (e.key === 'Escape') clearQueue();
});

initWS();
