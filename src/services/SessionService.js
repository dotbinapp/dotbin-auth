const tokenService = require('./TokenService');
const credentialService = require('./CredentialService');
const ErrorApi = require('../modules/ErrorApi');

/**
 * Orquesta login local (email/contraseña/clientId) → tokens de sesión (access/refresh).
 */
class SessionService {
  constructor() {
    this.name = 'SessionService';
    this.tokenService = tokenService;
    this.credentialService = credentialService;
  }

  /**
   * @param {{ email: string, password: string, clientId: string }} input
   */
  async createSessionFromCredentials(input) {
    const user = await this.credentialService.validateCredentials(input);
    return tokenService.signAccessToken({
      sub: user.userId,
      clientId: user.clientId,
      email: user.email,
    });
  }

  /**
   * @param {{ refreshToken: string }} _input
   */
  async refreshSession(_input) {
    ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_NOT_IMPLEMENTED);
  }

  /**
   * @param {{ refreshToken?: string, accessToken?: string }} _input
   */
  async revokeSession(_input) {
    ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_NOT_IMPLEMENTED);
  }
}

module.exports = new SessionService();
