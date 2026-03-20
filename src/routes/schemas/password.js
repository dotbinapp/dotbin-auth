const Joi = require('joi');

const changeWithCurrentBody = Joi.object({
  email: Joi.string().email().required(),
  currentPassword: Joi.string().min(1).required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

const resetRequestBody = Joi.object({
  email: Joi.string().email().required(),
});

const resetConfirmBody = Joi.object({
  token: Joi.string().min(1).required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

module.exports = {
  changeWithCurrentBody,
  resetRequestBody,
  resetConfirmBody,
};
