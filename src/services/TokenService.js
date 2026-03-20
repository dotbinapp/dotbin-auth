const ErrorApi = require('../modules/ErrorApi');

/**
 * Firma y verificación de JWT de sesión + JWKS público.
 * Esqueleto: sin claves RS256 reales hasta que configures rotación / almacenamiento seguro.
 */
class TokenService {
  constructor() {
    this.name = 'TokenService';
  }

  /**
   * Documento JWKS para que dotbin-server (u otros) validen el access token.
   * @returns {{ keys: object[] }}
   */
  getJwksDocument() {
    return { keys: [] };
  }

  serveJwks(req, res) {
    res.json(this.getJwksDocument());
  }

  /**
   * @param {Record<string, unknown>} _payload
   * @returns {Promise<{ accessToken: string, expiresIn: number }>}
   */
  async signAccessToken(_payload) {
    ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_NOT_IMPLEMENTED);
  }

  /**
   * @param {string} _token
   * @returns {Promise<Record<string, unknown>>}
   */
  async verifyAccessToken(_token) {
    ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_NOT_IMPLEMENTED);
  }
}

module.exports = new TokenService();
