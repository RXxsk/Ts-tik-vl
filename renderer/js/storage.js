export const State = {
  config: JSON.parse(localStorage.getItem('ttslive_config')) || {
    theme: 'dark',
    username: '',
    events: { chat: true, gift: true, member: false, like: false },
    filters: { cmds: true, links: true, badwords: '' },
    tts: { engine: 'web', voiceURI: '', rate: 1, tplGift: '{usuario} envió {cantidad} {regalo}' }
  },
  save() { localStorage.setItem('ttslive_config', JSON.stringify(this.config)); }
};
