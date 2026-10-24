const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../assets/icon.svg');
const buildDir = path.join(__dirname, '../build');
const pngPath = path.join(buildDir, 'icon.png');
const icoPath = path.join(buildDir, 'icon.ico');

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

sharp(svgPath)
  .resize(1024, 1024)
  .png()
  .toFile(pngPath)
  .then(() => pngToIco(pngPath))
  .then(buf => fs.writeFileSync(icoPath, buf))
  .then(() => console.log('Iconos generados exitosamente en build/'))
  .catch(err => console.error('Error generando iconos:', err));
