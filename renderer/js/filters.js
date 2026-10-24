import { State } from './storage.js';

export function filterText(text) {
  if (!text) return null;
  const cfg = State.config.filters;
  
  if (cfg.cmds && (text.startsWith('!') || text.startsWith('/'))) return null;
  if (cfg.links && (text.includes('http') || text.includes('www.') || text.includes('.com'))) return null;
  
  const badwords = cfg.badwords.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
  let lowerText = text.toLowerCase();
  for (let word of badwords) {
    if (lowerText.includes(word)) return null; 
  }

  // Limpieza de letras repetidas excesivas (ej: holaaaaa -> holaa)
  text = text.replace(/(.)\1{3,}/gi, '$1$1');
  return text;
}
