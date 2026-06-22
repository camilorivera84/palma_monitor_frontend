const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.dependencies && packageJson.dependencies['@react-leaflet/core']) {
  delete packageJson.dependencies['@react-leaflet/core'];
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Eliminado @react-leaflet/core del package.json');
}