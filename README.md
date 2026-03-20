# dotbin-auth

Microservicio de identidad genérico: usuarios por **inquilino** (`clientId`), email + contraseña, reset por token y emisión de JWT.

## Identificador principal

La identidad se define por **`userId` + `clientId`**:

- **`userId`**: `id` generado por dotbin-auth (cuid).
- **`clientId`**: identificador del inquilino. Ejemplos:
  - Id de **centro** (dotbin por clínica).
  - Consola **admin dotbin** (un `clientId` fijo acordado para operadores globales).
  - Otro producto o integración que use el mismo servicio.

El **email** es único **por `clientId`** (`@@unique([clientId, email])`). Podés documentar convenciones (p. ej. `clientId = centerId` para apps de centro) en dotbin-server sin cambiar este servicio.

## Arranque

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

- API base: `http://localhost:4100/v1`
- JWKS: `GET /.well-known/jwks.json`

## CRUD interno (`x-api-key: <INTERNAL_API_KEY>`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/v1/users` | `{ clientId, email, password, name? }` |
| `GET` | `/v1/users/:clientId/:userId` | Obtener |
| `PATCH` | `/v1/users/:clientId/:userId` | Editar `{ email?, name? }` |
| `POST` | `/v1/users/:clientId/:userId/deactivate` | Desactivar |
| `POST` | `/v1/users/:clientId/:userId/activate` | Activar |

## Contraseña y sesión (público)

| Método | Ruta | Body relevante |
|--------|------|----------------|
| `POST` | `/v1/auth/password/change` | `{ clientId, email, currentPassword, newPassword }` |
| `POST` | `/v1/auth/password-reset/request` | `{ clientId, email }` |
| `POST` | `/v1/auth/password-reset/confirm` | `{ token, newPassword }` |
| `POST` | `/v1/auth/session/login` | `{ clientId, email, password }` |

## Variables de entorno

`DATABASE_URL`, `INTERNAL_API_KEY`, `RETURN_RESET_TOKEN_IN_RESPONSE`, `PASSWORD_RESET_EXPIRES_MINUTES`, `BCRYPT_ROUNDS`.

## Integración con dotbin-server

- Para usuarios de **centro**: `clientId` = id del `Center` en tu API de negocio.
- Para **admin dotbin**: definir un `clientId` reservado (constante o config) y crear identidades ahí; el JWT llevará `clientId` para que el backend distinga contexto.
