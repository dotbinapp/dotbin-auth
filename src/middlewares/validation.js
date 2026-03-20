const config = require('../config');

const validateSchema = (
  type = config.joi.schemaTypes.body,
  schema,
  options = { abortEarly: false, stripUnknown: true }
) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[type], options);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        error: 'Validation Error',
        messages: errorMessages,
      });
    }

    req[type] = value;
    if (type === config.joi.schemaTypes.body) {
      req.body = value;
    }
    next();
  };
};

module.exports = {
  validateSchema,
};
