const Joi = require('joi');

const createBody = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().max(200).allow(null, ''),
});

const updateBody = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().max(200).allow(null, ''),
}).min(1);

const idParam = Joi.object({
  id: Joi.string().required(),
});

module.exports = {
  createBody,
  updateBody,
  idParam,
};
