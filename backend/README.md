# Backend — Consulta de Riesgo Financiero

API REST desarrollada con Node.js, TypeScript y Express para autenticar usuarios y consultar un score financiero determinista asociado a un RUT.

## Requisitos

- Node.js 22
- npm 10 o superior

## Instalación y ejecución

Desde el directorio `backend`:

```bash
npm ci
```

Crea el archivo local de variables de entorno a partir del ejemplo:

```powershell
Copy-Item .env.example .env
```

En macOS o Linux:

```bash
cp .env.example .env
```

Configura un secreto JWT local y ejecuta el servidor:

```bash
npm run dev
```

La API quedará disponible por defecto en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `JWT_SECRET` | Secreto utilizado para firmar y verificar los JWT. | `replace-with-a-strong-secret` |
| `PORT` | Puerto HTTP de la aplicación. | `3000` |
| `SCORING_ALGORITHM_SELECTION` | Algoritmo utilizado para calcular el score. | `sha256` |

Los algoritmos disponibles son:

- `sha256`: genera el score a partir de un hash SHA-256.
- `rolling-hash`: utiliza un hash acumulativo simple.

Una selección no soportada impide que la aplicación se inicie.

## Credenciales mock

La autenticación no utiliza persistencia, según el alcance del desafío.

| Rol | Usuario | Contraseña | RUT |
| --- | --- | --- | --- |
| `user` | `user` | `user123` | `12.345.678-5` |
| `admin` | `admin` | `admin123` | No aplica |

## Endpoints

### `POST /login`

Autentica credenciales mock y entrega un JWT válido por una hora.

Solicitud:

```json
{
  "username": "user",
  "password": "user123"
}
```

Respuesta exitosa:

```json
{
  "success": true,
  "token": "<jwt>",
  "expiresIn": 3600
}
```

El token contiene:

- `sub`: identificador del usuario.
- `role`: `admin` o `user`.
- `rut`: incluido únicamente para el rol `user`.

### `GET /score/:rut`

Retorna un score determinista entre 0 y 100. Requiere el encabezado:

```text
Authorization: Bearer <jwt>
```

Respuesta exitosa:

```json
{
  "rut": "12.345.678-5",
  "score": 73,
  "fecha": "2025-06-27T14:35:00.000Z"
}
```

Reglas de autorización:

- Un `user` solo puede consultar el RUT incluido en su JWT.
- Un `admin` puede consultar cualquier RUT válido.

Respuestas de error relevantes:

- `400`: formato de RUT inválido.
- `401`: token ausente, inválido, expirado o con claims inválidos.
- `403`: un usuario intenta consultar un RUT diferente al suyo.

## Validación y cálculo

El RUT se normaliza removiendo puntos, espacios externos y convirtiendo `k` a `K`. La API valida su estructura antes de calcular el score y retorna el valor con formato canónico.

No se valida el dígito verificador porque no forma parte de los requisitos del desafío. El score se obtiene siempre desde el RUT normalizado, por lo que distintas representaciones del mismo RUT producen el mismo resultado.

## Scripts

```bash
npm run dev        # servidor local con recarga automática
npm test           # typecheck, compilación de pruebas y suite completa
npm run typecheck  # validación estática de TypeScript
npm run build      # genera dist/server.mjs
npm start          # ejecuta el build generado
```

## Pruebas

La suite incluye pruebas unitarias y de integración para:

- Login de usuario y administrador.
- Firma, expiración y claims de los JWT.
- Autenticación y autorización por rol y RUT.
- Normalización y validación del RUT.
- Determinismo y rango de ambos algoritmos de score.
- Respuestas y códigos HTTP.
- Logging sin credenciales, tokens ni RUTs sensibles.

Ejecutar:

```bash
npm test
```

## Postman

El directorio `postman` contiene:

- `technical-challenge.postman_collection.json`
- `local.postman_environment.json`

Importa ambos archivos, selecciona el ambiente **ProntoPaga Local** y ejecuta la colección en orden. Las solicitudes de login guardan automáticamente `userToken` y `adminToken` para las consultas posteriores.

## Arquitectura

El código está organizado por funcionalidad y por límites de responsabilidad:

```text
src/
├── auth/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── http/
├── score/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── http/
├── shared/
├── app.ts
└── server.ts
```

- `domain`: tipos, valores y errores de negocio.
- `application`: casos de uso y puertos.
- `infrastructure`: JWT, usuarios mock, reloj y algoritmos concretos.
- `http`: DTOs, handlers y middlewares de Express.
- `app.ts`: composition root donde se conectan las implementaciones.

Las dependencias apuntan hacia los casos de uso y sus interfaces. Express y las implementaciones concretas permanecen fuera de la lógica de aplicación.

## Uso de inteligencia artificial

Se utilizó OpenAI Codex como herramienta de pair programming para apoyar el scaffolding, la generación inicial de pruebas, refactorizaciones puntuales y documentación. Las decisiones de arquitectura, alcance, reglas de negocio y seguridad fueron revisadas durante el desarrollo, y los cambios se validaron mediante typecheck, build y pruebas automatizadas.
