const express = require('express');
const { validateSchema } = require('../middlewares/validation');
const config = require('../config');
const sessionService = require('../services/SessionService');
const identityUserService = require('../services/IdentityUserService');
const schemas = require('./schemas/auth');
const passwordSchemas = require('./schemas/password');

const router = express.Router();

/**
 * Login local: valida email/contraseña contra usuarios alojados en dotbin-auth y emite sesión.
 */
router.post(
  '/session/login',
  validateSchema(config.joi.schemaTypes.body, schemas.loginBody),
  async (req, res, next) => {
    try {
      const { clientId, email, password } = req.body;
      const result = await sessionService.createSessionFromCredentials({ clientId, email, password });
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Renueva access token usando refresh.
 */
router.post(
  '/session/refresh',
  validateSchema(config.joi.schemaTypes.body, schemas.refreshBody),
  async (req, res, next) => {
    try {
      const result = await sessionService.refreshSession(req.body);
      res.status(200).json({ ok: true, ...result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Cierra sesión (revoca refresh en servidor cuando exista persistencia).
 */
router.post(
  '/session/logout',
  validateSchema(config.joi.schemaTypes.body, schemas.logoutBody),
  async (req, res, next) => {
    try {
      await sessionService.revokeSession(req.body);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Cambio de contraseña conociendo la actual (sin API key; el usuario demuestra la contraseña vieja).
 */
router.post(
  '/password/change',
  validateSchema(config.joi.schemaTypes.body, passwordSchemas.changeWithCurrentBody),
  async (req, res, next) => {
    try {
      const result = await identityUserService.changePasswordWithCurrent({
        clientId: req.body.clientId,
        email: req.body.email,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Solicita token de reset (respuesta genérica; en dev puede incluir el token si RETURN_RESET_TOKEN_IN_RESPONSE=true).
 */
router.post(
  '/password-reset/request',
  validateSchema(config.joi.schemaTypes.body, passwordSchemas.resetRequestBody),
  async (req, res, next) => {
    try {
      const result = await identityUserService.requestPasswordReset(req.body.email, req.body.clientId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/password-reset/confirm',
  validateSchema(config.joi.schemaTypes.body, passwordSchemas.resetConfirmBody),
  async (req, res, next) => {
    try {
      const result = await identityUserService.confirmPasswordReset(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
