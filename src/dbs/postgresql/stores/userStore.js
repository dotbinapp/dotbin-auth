const { getPostgresClient } = require('../index');

/**
 * Persistencia de usuarios de identidad (credenciales).
 */
class UserStore {
  constructor() {
    this.name = 'UserStore';
  }

  _prisma() {
    return getPostgresClient();
  }

  /**
   * @param {string} email normalizado en minúsculas
   */
  async findByEmail(email) {
    return this._prisma().identityUser.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return this._prisma().identityUser.findUnique({
      where: { id },
    });
  }

  async create(data) {
    return this._prisma().identityUser.create({
      data,
    });
  }

  async updateById(id, data) {
    return this._prisma().identityUser.update({
      where: { id },
      data,
    });
  }

  async setPasswordHash(id, passwordHash) {
    return this.updateById(id, { passwordHash });
  }

  async setPasswordResetFields(id, passwordResetTokenHash, passwordResetExpiresAt) {
    return this.updateById(id, {
      passwordResetTokenHash,
      passwordResetExpiresAt,
    });
  }

  async clearPasswordResetFields(id) {
    return this.updateById(id, {
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });
  }

  /** Token de reset guardado como SHA-256 hex */
  async findByValidPasswordResetTokenHash(passwordResetTokenHash) {
    return this._prisma().identityUser.findFirst({
      where: {
        passwordResetTokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });
  }
}

module.exports = new UserStore();
