const fs = require('fs');
const path = require('path');

const configDir = __dirname;
const config = {};

const resolveEnvVars = (obj) => {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{(.+?)\}/g, (_, name) => process.env[name] || '');
  }

  if (Array.isArray(obj)) {
    return obj.map(resolveEnvVars);
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, resolveEnvVars(val)])
    );
  }

  return obj;
};

fs.readdirSync(configDir)
  .filter((file) => file.endsWith('.json'))
  .forEach((file) => {
    const name = path.basename(file, '.json');
    const filePath = path.join(configDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    config[name] = resolveEnvVars(parsed);
  });

module.exports = config;
