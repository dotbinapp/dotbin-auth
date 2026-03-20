const Joi = require('joi');

const loginBody = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

const refreshBody = Joi.object({
  refreshToken: Joi.string().required(),
});

const logoutBody = Joi.object({
  refreshToken: Joi.string().optional(),
  accessToken: Joi.string().optional(),
}).or('refreshToken', 'accessToken');

module.exports = {
  loginBody,
  refreshBody,
  logoutBody,
};
