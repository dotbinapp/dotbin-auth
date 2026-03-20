# dotbin-auth

Microservicio de identidad: usuarios locales (email + contraseña), reset por token y emisión de JWT. Estructura alineada con **dotbin-server** (`routes`, `services` singleton, `dbs/.../stores`, `config` JSON).

## Arranque

```bash
cp .env.example .env
# Edita DATABASE_URL e INTERNAL_API_KEY (mínimo 8 caracteres)
npm install
npx prisma generate
npx prisma db push   # o: npm run db:migrate
npm run dev
```

- API base: `http://localhost:4100/v1` (`src/config/swagger.json`).
- JWKS: `GET /.well-known/jwks.json`

## Usuario de identidad (Prisma `IdentityUser`)

Campos principales: `email` único, `passwordHash` (bcrypt), `name`, `status` ACTIVE/INACTIVE, campos opcionales para reset (`passwordResetTokenHash`, `passwordResetExpiresAt`).

### CRUD interno (requiere `x-api-key: <INTERNAL_API_KEY>`)

Llamadas típicas desde **dotbin-server** al crear admins, etc.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/v1/users` | Crear usuario `{ email, password, name? }` |
| `GET` | `/v1/users/:id` | Obtener usuario (sin hash) |
| `PATCH` | `/v1/users/:id` | Editar `{ email?, name? }` (sin contraseña) |
| `POST` | `/v1/users/:id/deactivate` | Desactivar |
| `POST` | `/v1/users/:id/activate` | Activar |

### Contraseña (público, sin API key)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/v1/auth/password/change` | `{ email, currentPassword, newPassword }` |
| `POST` | `/v1/auth/password-reset/request` | `{ email }` — respuesta siempre `{ ok: true }`; si `RETURN_RESET_TOKEN_IN_RESPONSE=true` incluye `resetToken` (solo dev) |
| `POST` | `/v1/auth/password-reset/confirm` | `{ token, newPassword }` |

### Sesión (pendiente JWT completo en `TokenService`)

| Método | Ruta |
|--------|------|
| `POST` | `/v1/auth/session/login` |

## Variables de entorno

- `DATABASE_URL` — obligatoria para arrancar con DB.
- `INTERNAL_API_KEY` — obligatoria para `/v1/users/*`.
- `RETURN_RESET_TOKEN_IN_RESPONSE` — `true` solo en desarrollo para probar el flujo de reset sin email.
- `PASSWORD_RESET_EXPIRES_MINUTES` — default `60`.
- `BCRYPT_ROUNDS` — default `12`.

## Modelo con dotbin-server

- **Identidad** (este repo): credenciales + `id` estable.
- **Negocio** (`CenterUser` en dotbin-server): enlazar `auth0UserId` → sustituir por el `id` devuelto al crear usuario aquí.
