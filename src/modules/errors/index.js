'use strict';

/** Códigos propios del servicio de auth (prefijo AUTH) */
module.exports = {
  AUTH_ERROR_INVALID_PARAMS: {
    code: 'AUTH-API-004',
    message: 'Invalid parameters',
    statusCode: 400,
  },
  AUTH_ERROR_INVALID_CREDENTIALS: {
    code: 'AUTH-API-005',
    message: 'Invalid email or password',
    statusCode: 401,
  },
  AUTH_ERROR_INVALID_TOKEN: {
    code: 'AUTH-API-001',
    message: 'Invalid or expired token',
    statusCode: 401,
  },
  AUTH_ERROR_UNAUTHORIZED: {
    code: 'AUTH-API-006',
    message: 'Unauthorized',
    statusCode: 401,
  },
  AUTH_ERROR_FORBIDDEN: {
    code: 'AUTH-API-033',
    message: 'Forbidden',
    statusCode: 403,
  },
  AUTH_ERROR_NOT_IMPLEMENTED: {
    code: 'AUTH-API-501',
    message: 'Not implemented',
    statusCode: 501,
  },
  AUTH_ERROR_INTERNAL: {
    code: 'AUTH-API-500',
    message: 'Internal error',
    statusCode: 500,
  },
  AUTH_ERROR_USER_NOT_FOUND: {
    code: 'AUTH-API-404',
    message: 'User not found',
    statusCode: 404,
  },
  AUTH_ERROR_EMAIL_IN_USE: {
    code: 'AUTH-API-409',
    message: 'Email already in use',
    statusCode: 409,
  },
  AUTH_ERROR_INVALID_OLD_PASSWORD: {
    code: 'AUTH-API-007',
    message: 'Current password is incorrect',
    statusCode: 401,
  },
  AUTH_ERROR_USER_INACTIVE: {
    code: 'AUTH-API-008',
    message: 'User account is inactive',
    statusCode: 403,
  },
  AUTH_ERROR_RESET_TOKEN_INVALID: {
    code: 'AUTH-API-009',
    message: 'Invalid or expired reset token',
    statusCode: 400,
  },
};
