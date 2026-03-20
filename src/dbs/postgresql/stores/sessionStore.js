/**
 * Persistencia de refresh tokens / sesiones revocables (implementar con Prisma).
 */
class SessionStore {
  constructor() {
    this.name = 'SessionStore';
  }

  async saveRefreshSession(_record) {
    throw new Error('SessionStore.saveRefreshSession no implementado');
  }

  async findRefreshSessionByJti(_jti) {
    return null;
  }

  async revokeByJti(_jti) {
    return { ok: false };
  }
}

module.exports = new SessionStore();
