const { getPostgresClient } = require('../index');

/**
 * Persistencia de usuarios de identidad (credenciales), scoped por clientId (inquilino).
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
   * @param {string} clientId
   */
  async findByEmailAndClientId(email, clientId) {
    return this._prisma().identityUser.findUnique({
      where: {
        clientId_email: { clientId, email },
      },
    });
  }

  /**
   * userId = id de IdentityUser (generado por dotbin-auth).
   * @param {string} userId
   * @param {string} clientId
   */
  async findByUserIdAndClientId(userId, clientId) {
    return this._prisma().identityUser.findFirst({
      where: { id: userId, clientId },
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

  async findByEmailAndClientIdExcludingUser(email, clientId, excludeUserId) {
    return this._prisma().identityUser.findFirst({
      where: {
        clientId,
        email,
        NOT: { id: excludeUserId },
      },
    });
  }
}

module.exports = new UserStore();
