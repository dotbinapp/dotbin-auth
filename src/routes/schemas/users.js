const Joi = require('joi');

const createBody = Joi.object({
  clientId: Joi.string().min(1).max(128).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().max(200).allow(null, ''),
});

const updateBody = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().max(200).allow(null, ''),
}).min(1);

const clientAndUserParams = Joi.object({
  clientId: Joi.string().min(1).required(),
  userId: Joi.string().min(1).required(),
});

module.exports = {
  createBody,
  updateBody,
  clientAndUserParams,
};
