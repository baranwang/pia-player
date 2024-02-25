const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const feVersion = pkg.version;
const versionRegex = /version = "(.*)"/;

const cargoTomlPath = path.resolve(__dirname, './src-tauri/Cargo.toml');

let cargoToml = fs.readFileSync(cargoTomlPath, 'utf-8');
const [, rsVersion] = cargoToml.match(versionRegex);

if (feVersion !== rsVersion) {
  cargoToml = cargoToml.replace(versionRegex, `version = "${feVersion}"`);
  fs.writeFileSync(cargoTomlPath, cargoToml);
  console.log('sync version success');
} else {
  console.log('version is already sync');
}
