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

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
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

  async createUser({ email, password, name }) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await this.userStore.findByEmail(normalizedEmail);
    if (existing) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_EMAIL_IN_USE);
    }

    const passwordHash = await hashPassword(password);
    const user = await this.userStore.create({
      email: normalizedEmail,
      passwordHash,
      name: name != null ? String(name).trim() || null : null,
    });

    return toPublicUser(user);
  }

  async getUserById(id) {
    const user = await this.userStore.findById(id);
    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }
    return toPublicUser(user);
  }

  async updateUser(id, { email, name }) {
    const existing = await this.userStore.findById(id);
    if (!existing) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }

    const data = {};
    if (email !== undefined) {
      const next = normalizeEmail(email);
      if (next !== existing.email) {
        const taken = await this.userStore.findByEmail(next);
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

    const user = await this.userStore.updateById(id, data);
    return toPublicUser(user);
  }

  async deactivateUser(id) {
    const user = await this.userStore.findById(id);
    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }
    const updated = await this.userStore.updateById(id, { status: 'INACTIVE' });
    return toPublicUser(updated);
  }

  async activateUser(id) {
    const user = await this.userStore.findById(id);
    if (!user) {
      ErrorApi.throw(ErrorApi.codes.AUTH_ERROR_USER_NOT_FOUND);
    }
    const updated = await this.userStore.updateById(id, { status: 'ACTIVE' });
    return toPublicUser(updated);
  }

  /**
   * Cambio de contraseña con la anterior (flujo conocido por el usuario).
   */
  async changePasswordWithCurrent({ email, currentPassword, newPassword }) {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.userStore.findByEmail(normalizedEmail);
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

  /**
   * Solicitud de reset: genera token opaco; mismo mensaje si el email no existe (no filtrar).
   * @returns {{ ok: true, resetToken?: string }} resetToken solo si RETURN_RESET_TOKEN_IN_RESPONSE=true
   */
  async requestPasswordReset(email) {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.userStore.findByEmail(normalizedEmail);

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

  /**
   * Confirma nueva contraseña con el token enviado por email (o dev).
   */
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
