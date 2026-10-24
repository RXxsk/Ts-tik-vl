import { State } from './storage.js';

let synth = window.speechSynthesis;
let voices = [];
let isPlaying = false;
export let onFinish = null;

export function loadVoices() {
  return new Promise(resolve => {
    voices = synth.getVoices();
    if (voices.length) resolve(voices);
    else synth.onvoiceschanged = () => { voices = synth.getVoices(); resolve(voices); };
  });
}

export async function speak(text, callback) {
  isPlaying = true;
  onFinish = callback;

  if (State.config.tts.engine === 'kokoro') {
    // Placeholder para implementación WASM local de Kokoro-82M
    // Requiere transformers.js y modelo onnx en userData. 
    // Fallback automático a Web Speech si falla:
    console.warn("Kokoro engine seleccionado pero modelo no detectado localmente. Usando Web Speech API (Fallback).");
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voices.find(v => v.voiceURI === State.config.tts.voiceURI);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = parseFloat(State.config.tts.rate);
  
  utterance.onend = () => { isPlaying = false; if(onFinish) onFinish(); };
  utterance.onerror = () => { isPlaying = false; if(onFinish) onFinish(); };
  
  synth.speak(utterance);
}

export function skip() {
  synth.cancel();
  isPlaying = false;
  if(onFinish) onFinish();
}
