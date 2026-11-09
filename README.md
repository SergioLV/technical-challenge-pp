# ProntoPaga — Consulta de Riesgo Financiero

MVP full stack para consultar un score financiero determinista asociado a un RUT. Incluye autenticación JWT, autorización por roles y una SPA responsive desarrollada con React y TypeScript.

## Funcionalidades

- Login con credenciales mock y JWT con expiración.
- Autorización para roles `admin` y `user`.
- El administrador puede consultar cualquier RUT válido.
- El usuario solo puede consultar el RUT incluido en su token.
- Score determinista entre 0 y 100.
- Indicadores visuales de referencia para los rangos del score.
- Manejo de errores de autenticación, autorización y validación.
- Diseño responsive con Tailwind CSS.
- Pruebas unitarias y de integración en backend y frontend.

## Tecnologías

### Backend

- Node.js 22
- TypeScript
- Express
- JSON Web Token
- Jest y Supertest
- esbuild

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Vitest y React Testing Library

## Estructura

```text
technical-challenge-pp/
├── backend/   # API REST, autenticación y cálculo del score
└── frontend/  # SPA de login y consulta
```

El código está organizado por funcionalidad. Cada feature separa su lógica de dominio/aplicación, acceso a API o infraestructura y presentación HTTP/UI según corresponda.

## Requisitos

- Node.js 22
- npm 10 o superior

## Ejecución local

### 1. Backend

```bash
cd backend
npm ci
```

Crea el archivo de configuración local:

```powershell
Copy-Item .env.example .env
```

En macOS o Linux:

```bash
cp .env.example .env
```

Configura un valor seguro para `JWT_SECRET` y ejecuta:

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

### 2. Frontend

En una segunda terminal:

```bash
cd frontend
npm ci
npm run dev
```

La SPA utilizará `http://localhost:3000` como API por defecto. Para cambiarla, crea un `.env` dentro de `frontend`:

```env
VITE_API_URL=http://localhost:3000
```

Vite mostrará en la terminal la URL local del frontend, normalmente `http://localhost:5173`.

## Credenciales de prueba

| Rol | Usuario | Contraseña | RUT autorizado |
| --- | --- | --- | --- |
| `user` | `user` | `user123` | `12.345.678-5` |
| `admin` | `admin` | `admin123` | Cualquier RUT válido |

## API

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `POST` | `/login` | Autentica credenciales mock y retorna un JWT. |
| `GET` | `/score/:rut` | Retorna el score del RUT solicitado. Requiere `Bearer token`. |

La [documentación detallada del backend](backend/README.md) incluye payloads, respuestas, variables de entorno, arquitectura y uso de Postman.

## Pruebas y calidad

Backend:

```bash
cd backend
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm test
npm run lint
npm run build
```

La colección y el ambiente de Postman están disponibles en [`backend/postman`](backend/postman).

## Decisiones técnicas

- El backend mantiene la autorización como fuente de verdad. El frontend decodifica el JWT únicamente para adaptar la experiencia visual.
- El JWT se guarda en `sessionStorage`, por lo que la sesión queda limitada a la pestaña actual.
- El score se calcula mediante una estrategia configurable con `SCORING_ALGORITHM_SELECTION` (`sha256` o `rolling-hash`).
- El RUT se normaliza para que sus distintas representaciones produzcan el mismo score.
- Se valida la estructura del RUT, pero no su dígito verificador porque no forma parte de los requisitos del desafío.
- Los rangos visuales del frontend son informativos y no representan una decisión crediticia.

## Uso de inteligencia artificial

Se utilizó OpenAI Codex como herramienta de pair programming para apoyar el scaffolding, la generación inicial de pruebas, refactorizaciones puntuales, revisión de arquitectura, documentación y validación visual local.

Las decisiones de alcance, reglas de negocio, arquitectura, seguridad y experiencia de usuario fueron revisadas durante el desarrollo. Los cambios se validaron mediante pruebas automatizadas, typecheck, lint, build y pruebas manuales contra la aplicación completa.
