const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let displayWs = null;
const controllers = new Set();

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type === 'display') {
      displayWs = ws;
      ws.on('close', () => { if (displayWs === ws) displayWs = null; });
      return;
    }

    if (msg.type === 'controller') {
      controllers.add(ws);
      if (displayWs && displayWs.readyState === 1) {
        displayWs.send(JSON.stringify({ type: 'controller-connected' }));
      }
      ws.on('close', () => controllers.delete(ws));
      return;
    }

    if (controllers.has(ws) && displayWs && displayWs.readyState === 1) {
      displayWs.send(raw.toString());
    } else if (ws === displayWs) {
      const str = raw.toString();
      for (const ctrl of controllers) {
        if (ctrl.readyState === 1) ctrl.send(str);
      }
    }
  });
});

const publicPath = path.join(__dirname, '..', 'public');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

app.use(express.static(publicPath));
app.use('/node_modules', express.static(nodeModulesPath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicPath, 'presentacion.html'));
});

app.get('/remote', (_req, res) => {
  res.sendFile(path.join(publicPath, 'remote.html'));
});

app.get('/api/connect-info', (_req, res) => {
  const ips = getAllIPs();
  res.json({
    port: PORT,
    ips: ips.map(i => i.address)
  });
});

app.get('/api/qr', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  try {
    const dataUrl = await QRCode.toDataURL(url, { width: 280, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
    res.json({ dataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getAllIPs() {
  const ips = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({ name, address: net.address });
      }
    }
  }
  return ips;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const ips = getAllIPs();
  console.log('');
  console.log('============================================');
  console.log('  PRESENTACION CON CONTROL REMOTO');
  console.log('============================================');
  console.log('');
  console.log('  PC (abri en el navegador de la compu):');
  console.log('    http://localhost:' + PORT);
  console.log('');
  if (ips.length === 0) {
    console.log('  CELULAR: No se pudo detectar la IP automaticamente.');
    console.log('  Buscala manualmente con: ipconfig');
  } else {
    console.log('  CELULAR (probá cada una hasta que funcione):');
    ips.forEach(function(iface) {
      console.log('    http://' + iface.address + ':' + PORT + '/remote  (' + iface.name + ')');
    });
  }
  console.log('');
  console.log('  Si no funciona, desactivá el firewall o agregá una regla:');
  console.log('    netsh advfirewall firewall add rule name="Node3000" dir=in action=allow protocol=TCP localport=' + PORT);
  console.log('');
  console.log('============================================');
  console.log('');
});
