const userStore = require('../dbs/postgresql/stores/userStore');
const ErrorApi = require('../modules/ErrorApi');
const {
  hashPassword,
  verifyPassword,
  generatePasswordResetToken,
  hashOpaqueToken,
} = require('../utils/password');

const RESET_EXPIRES_MIN = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 60;

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

/** Respuesta pública: identificador principal = userId + clientId */
function toPublicUser(user) {
  if (!user) return null;
  return {
    userId: user.id,
    clientId: user.clientId,
    email: user.email,
    name: user.name,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

class IdentityUserService {
  constructor() {
    this.name = 'IdentityUserService';
    this.userStore = userStore;
  }

  async createUser({ clientId, email, password, name }) {
    const cid = String(clientId).trim();
    const normalizedEmail = normalizeEmail(email);
    const existing = await this.userStore.findByEmailAndClientId(normalizedEmail, cid);
    if (existing) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_EMAIL_IN_USE);
    }

    const passwordHash = await hashPassword(password);
    const user = await this.userStore.create({
      clientId: cid,
      email: normalizedEmail,
      passwordHash,
      name: name != null ? String(name).trim() || null : null,
    });

    return toPublicUser(user);
  }

  async getUserByUserIdAndClientId(userId, clientId) {
    const user = await this.userStore.findByUserIdAndClientId(userId, String(clientId).trim());
    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }
    return toPublicUser(user);
  }

  async updateUser(userId, clientId, { email, name }) {
    const cid = String(clientId).trim();
    const existing = await this.userStore.findByUserIdAndClientId(userId, cid);
    if (!existing) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }

    const data = {};
    if (email !== undefined) {
      const next = normalizeEmail(email);
      if (next !== existing.email) {
        const taken = await this.userStore.findByEmailAndClientIdExcludingUser(next, cid, existing.id);
        if (taken) {
          ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_EMAIL_IN_USE);
        }
        data.email = next;
      }
    }
    if (name !== undefined) {
      data.name = name === null || name === '' ? null : String(name).trim();
    }

    if (Object.keys(data).length === 0) {
      return toPublicUser(existing);
    }

    const user = await this.userStore.updateById(existing.id, data);
    return toPublicUser(user);
  }

  async deactivateUser(userId, clientId) {
    const user = await this.userStore.findByUserIdAndClientId(userId, String(clientId).trim());
    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }
    const updated = await this.userStore.updateById(user.id, { status: 'INACTIVE' });
    return toPublicUser(updated);
  }

  async activateUser(userId, clientId) {
    const user = await this.userStore.findByUserIdAndClientId(userId, String(clientId).trim());
    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }
    const updated = await this.userStore.updateById(user.id, { status: 'ACTIVE' });
    return toPublicUser(updated);
  }

  async changePasswordWithCurrent({ clientId, email, currentPassword, newPassword }) {
    const cid = String(clientId).trim();
    const normalizedEmail = normalizeEmail(email);
    const user = await this.userStore.findByEmailAndClientId(normalizedEmail, cid);
    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_INVALID_CREDENTIALS);
    }
    if (user.status !== 'ACTIVE') {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_INACTIVE);
    }

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_INVALID_OLD_PASSWORD);
    }

    const passwordHash = await hashPassword(newPassword);
    await this.userStore.setPasswordHash(user.id, passwordHash);
    await this.userStore.clearPasswordResetFields(user.id);
    return { ok: true };
  }

  async requestPasswordReset(email, clientId) {
    const cid = String(clientId).trim();
    const normalizedEmail = normalizeEmail(email);
    const user = await this.userStore.findByEmailAndClientId(normalizedEmail, cid);

    const genericOk = { ok: true };

    if (!user || user.status !== 'ACTIVE') {
      return genericOk;
    }

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashOpaqueToken(rawToken);
    const passwordResetExpiresAt = new Date(Date.now() + RESET_EXPIRES_MIN * 60 * 1000);

    await this.userStore.setPasswordResetFields(user.id, tokenHash, passwordResetExpiresAt);

    if (process.env.RETURN_RESET_TOKEN_IN_RESPONSE === 'true') {
      return { ...genericOk, resetToken: rawToken };
    }

    return genericOk;
  }

  async confirmPasswordReset({ token, newPassword }) {
    if (!token || !newPassword) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_INVALID_PARAMS);
    }

    const tokenHash = hashOpaqueToken(token);
    const user = await this.userStore.findByValidPasswordResetTokenHash(tokenHash);

    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_RESET_TOKEN_INVALID);
    }

    const passwordHash = await hashPassword(newPassword);
    await this.userStore.setPasswordHash(user.id, passwordHash);
    await this.userStore.clearPasswordResetFields(user.id);

    return { ok: true };
  }
}

module.exports = new IdentityUserService();
