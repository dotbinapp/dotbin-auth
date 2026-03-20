'use strict';

const errorDefinitions = require('./errors');

class AppError extends Error {
  constructor(message, code, detail) {
    super(message);
    this.name = 'AppError';
    this.code = code || 'SYS-ERR';
    this.detail = detail;
  }
}

class ErrorAPI {
  constructor(definitions) {
    this.definitions = definitions;
    this.codes = Object.keys(definitions).reduce((acc, alias) => {
      acc[alias] = alias;
      return acc;
    }, {});
  }

  throw(alias, message = null) {
    const def = this.definitions[alias];
    if (!message) {
      message = alias;
    }
    if (!def) {
      throw new AppError(message || 'Unknown error', 'SYS-ERR', alias);
    }
    throw new AppError(message || def.message, def.code, alias);
  }

  error(alias, detail = null, customMessage = null) {
    const def = this.definitions[alias];
    if (!detail) {
      detail = alias;
    }
    if (!def) {
      return new AppError(customMessage || 'Unknown error', 'SYS-ERR', detail);
    }
    return new AppError(customMessage || def.message, def.code, detail);
  }

  getHttpStatus(code, fallback = 500) {
    for (const def of Object.values(this.definitions)) {
      if (def.code === code) return def.statusCode;
    }
    return fallback;
  }

  middleware() {
    return (err, req, res, next) => {
      const code = err.code || 'SYS-ERR';
      const status = this.getHttpStatus(code);
      const message = err.message || 'Error';

      res.status(status).json({
        code,
        message,
        ...(err.detail && { detail: err.detail }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      });
    };
  }
}

module.exports = new ErrorAPI(errorDefinitions);
