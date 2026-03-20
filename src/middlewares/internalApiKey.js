/**
 * Protege endpoints llamados solo desde dotbin-server (u operaciones internas).
 * Header: x-api-key: <INTERNAL_API_KEY>
 */
function requireInternalApiKey(req, res, next) {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected || expected.length < 8) {
    return res.status(503).json({
      code: 'AUTH-API-503',
      message: 'INTERNAL_API_KEY no configurada o demasiado corta',
    });
  }

  const provided = req.headers['x-api-key'];
  if (provided !== expected) {
    return res.status(401).json({
      code: 'AUTH-API-006',
      message: 'Unauthorized',
    });
  }

  next();
}

module.exports = {
  requireInternalApiKey,
};
