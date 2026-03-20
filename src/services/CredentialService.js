const userStore = require('../dbs/postgresql/stores/userStore');
const ErrorApi = require('../modules/ErrorApi');
const { verifyPassword } = require('../utils/password');

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

/**
 * Valida credenciales contra usuarios alojados en este servicio (sin Auth0 ni OIDC).
 */
class CredentialService {
  constructor() {
    this.name = 'CredentialService';
    this.userStore = userStore;
  }

  /**
   * @param {{ email: string, password: string }} input
   * @returns {Promise<{ id: string, email: string }>}
   */
  async validateCredentials(input) {
    const { email, password } = input;
    const user = await this.userStore.findByEmail(normalizeEmail(email));

    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_INVALID_CREDENTIALS);
    }

    if (user.status !== 'ACTIVE') {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_INACTIVE);
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_INVALID_CREDENTIALS);
    }

    return { id: user.id, email: user.email };
  }
}

module.exports = new CredentialService();
