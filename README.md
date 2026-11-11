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
- `GET /api/landing-page` (public hero content and featured courses)
- `PUT /api/landing-page/hero` (Content Manager or Admin JWT required)
- `PUT /api/landing-page/featured-courses` (Content Manager or Admin JWT required)
- `GET /api/course-content/courses/{courseId}` (public course modules and lessons)
- `GET /api/course-content/modules` (Content Manager or Admin JWT required)
- `GET /api/course-content/lessons` (Content Manager or Admin JWT required)
- `POST /api/course-content/courses/{courseId}/modules` (Content Manager or Admin JWT required)
- `POST /api/course-content/modules/{moduleId}/lessons` (Content Manager or Admin JWT required)
- `PUT`/`DELETE /api/course-content/modules/{id}` (Content Manager or Admin JWT required)
- `PUT`/`DELETE /api/course-content/lessons/{id}` (Content Manager or Admin JWT required)
- `POST /api/auth/register` (also available at `/api/users`)
- `POST /api/auth/login` (also available at `/api/users/login`)
- `POST /api/users/refresh`
- `POST /api/users/logout` (JWT required)
- `GET /api/notifications` (JWT required)
- `GET /api/notifications/unread-count` (JWT required)
- `PATCH /api/notifications/{id}/read` (JWT required)
- `GET /api/courses/{courseId}/assignments` (enrolled Learner or assigned Instructor JWT required)
- `POST /api/courses/{courseId}/assignments` (assigned Instructor JWT required)
- `POST /api/courses/{courseId}/assignments/{assignmentId}/submit` (enrolled Learner JWT required)
- `GET /api/courses/{courseId}/assignments/{assignmentId}/submissions` (assigned Instructor JWT required)
- `PUT /api/courses/{courseId}/assignments/{assignmentId}/submissions/{submissionId}/grade` (assigned Instructor JWT required)
- `GET /api/courses/{courseId}/attendance` (enrolled Learner JWT required)
- `PUT /api/instructor/courses/{courseId}/sessions/{sessionId}` (assigned Instructor JWT required)
- `PATCH /api/admin/applications/{id}/status` (Admin JWT required)
- `PATCH /api/admin/users/{id}/role` (Admin JWT required)
- `PATCH /api/admin/users/{id}/status` (Admin JWT required; `{ "isActive": false }` suspends)
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

Enrolled learners can list course assignments and submit text or repository
links from the Assignments section in `/LearnerLMS`. Each assignment accepts
one submission; its stored status is `Submitted` and changes to `Graded` when
an instructor records a score. The learner view displays the submission, score,
and instructor feedback. Apply the `AddAssignmentSubmissionStatus` migration
and `AddAssignmentInstructor` migrations before using assignment workflows.

The learner course view also shows attendance for past sessions, including
present sessions out of total sessions held and each session's recorded status.
Only the learner's own attendance for courses in which they are enrolled is
returned. The attendance response includes the freshly recalculated
`courseProgress` value as well as the attendance totals.
Course progress is persisted on each enrollment and recalculated after
instructor attendance or grading updates. It is the equal average of the
learner's attendance percentage across sessions held and average score across
graded assignments; when only one measure is available, that measure is used.
When neither measure is available, progress is 0%. The learner dashboard and
`/LearnerLMS` refresh the value from database-backed enrollment and attendance
queries whenever course data is loaded.

Learner notifications are stored in SQL Server and cover account creation,
application status changes (Pending, Approved, or Enrolled), successful
payments, newly scheduled or rescheduled course sessions, and assignment
grading feedback. The header bell and open inbox refresh every 15 seconds and
when the page becomes visible. Learners can read their inbox at `/notifications`
and mark individual items as read. Apply the
`AddNotificationsAndApplicationStatuses` migration before using these endpoints.

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

User profiles, roles, active status, and refresh-token records are persisted in
SQL Server. Registration writes to `Users`; login and refresh issue stateless
access JWTs and persist their refresh-token state in `UserTokens`. Supported
roles are `Learner`, `Instructor`, `Admin`, and `Content Manager`. Suspending a
user persists the status, removes their refresh token, and invalidates their
existing access tokens on the next authenticated request. Apply the
`AddUserActiveStatus` migration before using account suspension.

Role or username changes invalidate existing access tokens; the user must
refresh or sign in again to continue with the updated account state.
Course API responses include assigned instructor name, email, and bio.
Instructor APIs are restricted to assigned courses and support rosters,
progress updates, sessions, attendance, assignments, and submission grading.
Session edits are exposed at
`PUT /api/instructor/courses/{courseId}/sessions/{sessionId}` and save schedule
changes before notifying enrolled learners. Administrators can assign and
unassign instructors through
`PUT`/`DELETE /api/admin/courses/{courseId}/instructors/{instructorId}`; both
operations update the `CourseInstructors` table.

### Admin workspace

Apply all migrations before opening `/AdminDashboard`. The
`SeedDemoAdmin` migration creates `admin@example.com` with the shared local
demo password `Password123!` when that email is not already in use; an
existing account is left unchanged. Sign in with this account to open the admin
dashboard. Admin user-management APIs require the Admin role. This shared demo
credential is for local development only and must be replaced or removed
before deploying outside local development.
Creating an account through admin user management persists a welcome
notification for the new account, regardless of role.

The `SeedDemoLearner` migration also creates `learner@example.com` with the
same local demo password when that email is not already in use. Use this
learner account to test applications and Stripe checkout; admin and instructor
accounts cannot enroll as learners. Demo credentials are not suitable for
staging or production.

On application startup in the Development environment, the backend applies
pending EF Core migrations, then checks the `Users` table for these three demo
email addresses and creates only missing accounts with ASP.NET Core Identity
password hashes. Existing accounts are left unchanged. Startup seeding uses
`Password123!` for local demonstration only and is intentionally disabled
outside Development.

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
