const userStore = require('../dbs/postgresql/stores/userStore');
const ErrorApi = require('../modules/ErrorApi');
const { verifyPassword } = require('../utils/password');

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

/**
 * Valida credenciales en el ámbito de un inquilino (clientId): email + password.
 */
class CredentialService {
  constructor() {
    this.name = 'CredentialService';
    this.userStore = userStore;
  }

  /**
   * Identidad principal: { userId, clientId, email } tras login correcto.
   * @param {{ email: string, password: string, clientId: string }} input
   */
  async validateCredentials(input) {
    const { email, password, clientId } = input;
    const cid = String(clientId).trim();
    const user = await this.userStore.findByEmailAndClientId(normalizeEmail(email), cid);

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

    return {
      userId: user.id,
      clientId: user.clientId,
      email: user.email,
    };
  }
}

module.exports = new CredentialService();
