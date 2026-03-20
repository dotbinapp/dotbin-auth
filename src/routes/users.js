const express = require('express');
const { validateSchema } = require('../middlewares/validation');
const { requireInternalApiKey } = require('../middlewares/internalApiKey');
const config = require('../config');
const identityUserService = require('../services/IdentityUserService');
const schemas = require('./schemas/users');

const router = express.Router();

router.use(requireInternalApiKey);

router.post(
  '/',
  validateSchema(config.joi.schemaTypes.body, schemas.createBody),
  async (req, res, next) => {
    try {
      const user = await identityUserService.createUser(req.body);
      res.status(201).json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:clientId/:userId',
  validateSchema(config.joi.schemaTypes.params, schemas.clientAndUserParams),
  async (req, res, next) => {
    try {
      const { clientId, userId } = req.params;
      const user = await identityUserService.getUserByUserIdAndClientId(userId, clientId);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:clientId/:userId',
  validateSchema(config.joi.schemaTypes.params, schemas.clientAndUserParams),
  validateSchema(config.joi.schemaTypes.body, schemas.updateBody),
  async (req, res, next) => {
    try {
      const { clientId, userId } = req.params;
      const user = await identityUserService.updateUser(userId, clientId, req.body);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:clientId/:userId/deactivate',
  validateSchema(config.joi.schemaTypes.params, schemas.clientAndUserParams),
  async (req, res, next) => {
    try {
      const { clientId, userId } = req.params;
      const user = await identityUserService.deactivateUser(userId, clientId);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:clientId/:userId/activate',
  validateSchema(config.joi.schemaTypes.params, schemas.clientAndUserParams),
  async (req, res, next) => {
    try {
      const { clientId, userId } = req.params;
      const user = await identityUserService.activateUser(userId, clientId);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
