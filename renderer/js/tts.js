import { State } from './storage.js';

let synth = window.speechSynthesis;
let voices = [];
let isPlaying = false;
export let onFinish = null;

export function loadVoices() {
  return new Promise(resolve => {
    voices = synth.getVoices();
    if (voices.length) {
      resolve(sortSpanishFirst(voices));
    } else {
      synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        resolve(sortSpanishFirst(voices));
      };
    }
  });
}

function sortSpanishFirst(allVoices) {
  // Filtrar y ordenar para poner las voces en español al principio de la lista
  const spanish = allVoices.filter(v => v.lang.toLowerCase().includes('es'));
  const others = allVoices.filter(v => !v.lang.toLowerCase().includes('es'));
  return [...spanish, ...others];
}

export function speak(text, callback) {
  isPlaying = true;
  onFinish = callback;

  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voices.find(v => v.voiceURI === State.config.tts.voiceURI);
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    // Si no hay ninguna seleccionada, buscar la primera en español disponible
    const defaultSpanish = voices.find(v => v.lang.toLowerCase().includes('es'));
    if (defaultSpanish) utterance.voice = defaultSpanish;
  }
  
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
