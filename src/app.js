const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const config = require('./config');
const ErrorApi = require('./modules/ErrorApi');
const tokenService = require('./services/TokenService');

const app = express();
app.use(cors());
app.use(express.json());

// JWKS público (validación del access JWT en dotbin-server y otros clientes)
app.get('/.well-known/jwks.json', (req, res, next) => {
  try {
    tokenService.serveJwks(req, res);
  } catch (err) {
    next(err);
  }
});

const loadAllRoutes = (app, apiVersion) => {
  fs.readdirSync(path.join(__dirname, 'routes')).forEach((file) => {
    const modulePath = path.join(__dirname, 'routes', file);
    const moduleRoute = file.substr(0, file.indexOf('.')).toLowerCase();

    if (fs.lstatSync(modulePath).isFile()) {
      if (moduleRoute === 'index') {
        app.use(apiVersion + '/', require(modulePath));
      } else {
        app.use(apiVersion + '/' + moduleRoute, require(modulePath));
      }
    }
  });
};

loadAllRoutes(app, config.swagger.basePath);

app.use(ErrorApi.middleware());

module.exports = app;
