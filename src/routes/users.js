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
  '/:id',
  validateSchema(config.joi.schemaTypes.params, schemas.idParam),
  async (req, res, next) => {
    try {
      const user = await identityUserService.getUserById(req.params.id);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  validateSchema(config.joi.schemaTypes.params, schemas.idParam),
  validateSchema(config.joi.schemaTypes.body, schemas.updateBody),
  async (req, res, next) => {
    try {
      const user = await identityUserService.updateUser(req.params.id, req.body);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/deactivate',
  validateSchema(config.joi.schemaTypes.params, schemas.idParam),
  async (req, res, next) => {
    try {
      const user = await identityUserService.deactivateUser(req.params.id);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/activate',
  validateSchema(config.joi.schemaTypes.params, schemas.idParam),
  async (req, res, next) => {
    try {
      const user = await identityUserService.activateUser(req.params.id);
      res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
