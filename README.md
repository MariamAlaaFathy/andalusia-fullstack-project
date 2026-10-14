# React + TypeScript + Vite

## Courses, Programs, and Career Paths

The Courses page is available at `/Courses` and uses the existing
`GET /api/Courses` endpoint. It supports `search`, `category`, `page`, and
`pageSize` query parameters. The course page, its category filter and type,
navigation links, and homepage entry point are retained alongside the newer
Programs and Career Paths pages.

The Programs and Career Paths pages use the ASP.NET Core API backed by SQL
Server. The development API runs at `http://localhost:5075`; configure
`VITE_API_BASE_URL` in `.env.local` when the API is hosted elsewhere (see
`.env.example`).
Courses, programs, and career paths are stored in the same SQL Server database.

### API endpoints

- `GET /api/Courses?search=&category=&page=1&pageSize=10`
- `GET /api/Courses/{id}`
- `GET /api/Programs?search=&page=1&pageSize=9`
- `GET /api/Programs/{id}`
- `GET /api/CareerPaths?search=&page=1&pageSize=9`
- `GET /api/CareerPaths/{id}`
- `POST /api/applications` (JWT required; body: `{ "courseId": 1 }`)
- `GET /api/applications/me` (JWT required)
- `GET /api/applications/{id}` (JWT required; learner-owned records only)
- `POST /api/payments/application/{applicationId}/checkout` (JWT required)
- `POST /api/payments/confirm` (JWT required; verifies the Checkout session with Stripe)
- `POST /api/payments/webhook` (Stripe signature required)

List endpoints return a paged object with `data`, `page`, `pageSize`,
`totalCount`, `totalPages`, and next/previous-page flags. Program records
include their related career path name. Career path records include `skills`
and related `programs`. The frontend validates the response shape and shows loading and empty states
when catalog data is unavailable.

### Start locally

The backend's Development settings use SQL Server LocalDB. From the repository
root, apply all migrations and start the API:

```powershell
dotnet ef database update --project .\full-stack-project-backend\full-stack-project-backend\full_stack_project_backend.csproj --startup-project .\full-stack-project-backend\full-stack-project-backend\full_stack_project_backend.csproj --configuration Release
dotnet run --project .\full-stack-project-backend\full-stack-project-backend\full_stack_project_backend.csproj --launch-profile http
```

The migrations create the Courses, Programs, CareerPaths, and CareerPathSkills
tables, add course detail fields, and seed the sample catalog. The
`AddCourseDetailsAndSeedCourses` migration adds duration, level, prerequisites,
and learning outcomes to Courses. The `LinkCoursesToPrograms` migration links
each course to one program; the course response includes that program and its
career path, while program and career-path details list their related courses.
In other environments, provide the database connection using the
`ConnectionStrings__DefaultConnection` environment variable before starting
the API.

### Applications and Stripe payments

Applications and payment records are stored in SQL Server. Application and
payment endpoints require a signed JWT with the learner's stable identifier in
the `sub` claim. The login flow should place the access token in
`userContext.user.accessToken`; the app keeps that short-lived token in
`sessionStorage` so it survives the Stripe redirect, and the enrollment client
sends it in the `Authorization: Bearer <token>` header. Records are always
scoped to that authenticated subject—never to a learner ID supplied by the
browser.

Set these backend environment variables or .NET user secrets before using
authenticated enrollment and Stripe Checkout:

- `Authentication__Jwt__SigningKey`: at least 32 UTF-8 bytes; use the same key
  and issuer/audience values as the login/token issuer.
- `Authentication__Jwt__Issuer` and `Authentication__Jwt__Audience`: match the
  values used when issuing the JWT.
- `Stripe__SecretKey`: a Stripe test secret key for local development.
- `Stripe__WebhookSecret`: the signing secret for the configured webhook.
- `Stripe__Currency`: lowercase ISO currency code (defaults to `usd`).
- `Stripe__FrontendBaseUrl`: frontend origin (defaults to
  `http://localhost:5173`; production must use HTTPS).

For local testing, forward Stripe test webhooks to
`http://localhost:5075/api/payments/webhook` and listen for
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, and `checkout.session.expired`.
Apply the database migration before running the new endpoints. The learner is
redirected to Stripe's hosted checkout to enter card details; the application
does not receive or store card numbers or security codes. Payment records store
only the amount, currency, status, timestamps, and Stripe transaction/session
references. Do not use real payment credentials for local testing.

The application/payment API follows the existing repository and service
patterns, maps database entities to response DTOs with AutoMapper, and uses
`MiddlewareGlobal` for consistent problem responses. To inspect the learner
dashboard before the partner's sign-in flow is connected, open
`http://localhost:5173/Dashboard?preview=true`. The preview uses sample data
only; applications and payments still require a real authenticated learner.

In another terminal, run the frontend:

```powershell
npm install
npm run dev
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
