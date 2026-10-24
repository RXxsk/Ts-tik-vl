const logger = require('./logger');

let tiktokLiveConnection = null;
let reconnectTimer = null;

function broadcast(wss, type, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify({ type, data }));
  });
}

async function connect(username, wss) {
  if (tiktokLiveConnection) disconnect(wss);
  logger.log(`Conectando a @${username}`);
  broadcast(wss, 'status', 'connecting');

  try {
    // Importación dinámica compatible con módulos ESM en Node.js
    const { WebcastPushConnection } = await import('tiktok-live-connector');
    
    tiktokLiveConnection = new WebcastPushConnection(username);

    tiktokLiveConnection.connect().then(state => {
      logger.log(`Conectado a Live ID: ${state.roomId}`);
      broadcast(wss, 'status', 'connected');
    }).catch(err => {
      logger.error('Error de conexión', err);
      broadcast(wss, 'status', 'disconnected');
      scheduleReconnect(username, wss);
    });

    tiktokLiveConnection.on('chat', data => broadcast(wss, 'chat', data));
    tiktokLiveConnection.on('gift', data => broadcast(wss, 'gift', data));
    tiktokLiveConnection.on('member', data => broadcast(wss, 'member', data));
    tiktokLiveConnection.on('like', data => broadcast(wss, 'like', data));
    tiktokLiveConnection.on('social', data => broadcast(wss, 'share', data));
    
    tiktokLiveConnection.on('disconnected', () => {
      broadcast(wss, 'status', 'disconnected');
      scheduleReconnect(username, wss);
    });
  } catch (err) {
    logger.error('Error al cargar tiktok-live-connector', err);
    broadcast(wss, 'status', 'disconnected');
  }
}

function scheduleReconnect(username, wss) {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => connect(username, wss), 5000);
}

function disconnect(wss) {
  clearTimeout(reconnectTimer);
  if (tiktokLiveConnection) {
    tiktokLiveConnection.disconnect();
    tiktokLiveConnection = null;
    if (wss) broadcast(wss, 'status', 'disconnected');
  }
}

module.exports = { connect, disconnect };
