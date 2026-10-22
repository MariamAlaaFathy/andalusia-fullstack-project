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
Courses, programs, career paths, and users are stored in the
`AndalusiaFullStackProject` SQL Server database.

### API endpoints

- `GET /api/Courses?search=&category=&page=1&pageSize=10`
- `GET /api/Courses/{id}`
- `GET /api/Programs?search=&page=1&pageSize=9`
- `GET /api/Programs/{id}`
- `GET /api/CareerPaths?search=&page=1&pageSize=9`
- `GET /api/CareerPaths/{id}`
- `POST /api/users` (register)
- `POST /api/users/login`
- `POST /api/users/refresh`
- `POST /api/users/logout` (JWT required)
- `POST /api/payments/create-checkout-session` (Learner JWT required)
- `POST /api/payments/webhook` (Stripe signature required)

List endpoints return a paged object with `data`, `page`, `pageSize`,
`totalCount`, `totalPages`, and next/previous-page flags. Program records
include their related career path name. Career path records include `skills`
and related `programs`. The frontend validates the response shape and shows loading and empty states
when catalog data is unavailable.

Registration creates the account and signs the user in. The access JWT is kept
in memory and attached as a Bearer token to API calls; the rotating refresh
token is kept in session storage and used to restore a session after a page
reload or renew an expired access token. Logging out revokes the refresh token.

### Start locally

The backend's Development settings use SQL Server LocalDB. From the repository
root, apply all migrations and start the API:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet ef database update --project .\full-stack-project-backend\full-stack-project-backend\full_stack_project_backend.csproj --startup-project .\full-stack-project-backend\full-stack-project-backend\full_stack_project_backend.csproj --configuration Release
dotnet run --project .\full-stack-project-backend\full-stack-project-backend\full_stack_project_backend.csproj --launch-profile http
```

Local development uses a development-only JWT signing key in
`appsettings.Development.json`. Never use that key outside local development;
set `Jwt__Key` to a unique secret of at least 32 bytes in other environments.

The migrations create the Courses, Programs, CareerPaths, CareerPathSkills,
CourseApplications, and Payments tables, add course detail fields, and seed the sample catalog. The
`AddCourseDetailsAndSeedCourses` migration adds duration, level, prerequisites,
and learning outcomes to Courses. The `LinkCoursesToPrograms` migration links
each course to one program; the course response includes that program and its
career path, while program and career-path details list their related courses.
In other environments, provide the database connection using the
`ConnectionStrings__DefaultConnection` environment variable before starting
the API.

Signed-in learners have the `Learner` role and can apply to courses and review
their enrollment and payment status on `/Dashboard`. Free courses enroll
directly. Paid courses use Stripe Checkout; the browser redirects to Stripe and
never handles card details. Configure `Stripe__SecretKey` and
`Stripe__WebhookSecret` in the backend environment, and set
`Stripe__FrontendBaseUrl` to the frontend origin. For local testing, use Stripe
test keys and forward events to the backend:

```powershell
stripe listen --forward-to http://localhost:5075/api/payments/webhook
```

Use the webhook signing secret printed by Stripe CLI as `Stripe__WebhookSecret`.
The `checkout.session.completed` webhook updates the payment and enrollment
status after successful payment.

### Instructor workspace

Apply all migrations, including `AddInstructorLms` and `SeedDemoInstructor`,
before using `/InstructorDashboard`; the instructor dashboard reads assigned
courses, learners, sessions, attendance, and progress from the configured SQL
Server database and does not show sample data when the API is unavailable.
New accounts default to the `Learner` role. The `SeedDemoInstructor` migration
creates the `instructor@example.com` account if that email is not already in
use, then assigns the demo account to existing courses. A pre-existing account
with that email is left unchanged. For local demonstration, sign in with
`Password123!`. This shared demo credential is not suitable for staging or
production; replace or remove the account before deploying outside local
development.

The instructor must sign in again to receive a token with the updated role.
Course API responses include assigned instructor name, email, and bio.
Instructor APIs are restricted to assigned courses and support rosters,
progress updates, sessions, attendance, assignments, and submission grading.

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
