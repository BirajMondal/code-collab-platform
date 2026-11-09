# Snipshare

A collaborative code snippet sharing and review workspace. The frontend is a React + Vite app with Monaco Editor. The API is an Express service using MongoDB/Mongoose, JWT authentication, and Socket.IO events.

## Run locally

Requirements: Node.js 20.19+ or 22.12+, and MongoDB 7+ (local or hosted). Zustand manages shared frontend session and workspace state.

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not at `http://localhost:5001`.
3. In `backend`, run `npm install` then `npm run dev`.
4. In `frontend`, run `npm install` then `npm run dev`.
5. Open the Vite URL shown in the terminal. API docs are at `http://localhost:5001/api/docs`.

The frontend opens with registration/login and stores its refresh session in an HTTP-only cookie. The API requires MongoDB for account-backed features. The frontend now uses the API for snippet listing/search, create/edit/delete, sharing, discussion, version history, profile updates, and activity. OAuth is optional and requires provider credentials.

To create the first administrator, set `ADMIN_EMAIL` in `backend/.env` to the email address of your account, restart the API, then register or log in with that address. Admins can set roles through `PATCH /api/admin/users/:id/role`; snippet owners can invite registered users as editors or viewers from the snippet view.

For optional social login, create a GitHub OAuth App and/or Google OAuth client, set the matching client ID and secret in `backend/.env`, and register the exact callback URL shown there (`http://localhost:5001/api/auth/github/callback` or `http://localhost:5001/api/auth/google/callback`). Restart the API after changing provider settings. The sign-in page will show only configured providers.

### Run with Docker Compose

Copy `backend/.env.example` to `backend/.env`, replace `JWT_SECRET` with a long random secret, and optionally set `ADMIN_EMAIL`. Then run `docker compose up --build`. The app is available at `http://localhost:5173`, the API at `http://localhost:5000`, and MongoDB data is stored in the `mongo_data` volume.

### Production readiness

The Docker Compose file is for local development, not a hardened public deployment. Before deploying, use managed MongoDB with authentication and backups, deploy the API and frontend behind HTTPS, and configure these values in the hosting provider's secret/environment settings (never commit secrets):

- `NODE_ENV=production`
- `MONGODB_URI`: production MongoDB connection string
- `JWT_SECRET`: unique random secret with at least 32 bytes
- `CLIENT_ORIGIN`: exact HTTPS frontend origin, with no path
- `VITE_API_URL`: HTTPS API base URL, set as a frontend build variable
- `GITHUB_CALLBACK_URL` / `GOOGLE_CALLBACK_URL`: exact HTTPS API callback URLs if those providers are enabled

The API now refuses production startup when required database, JWT, origin, or configured OAuth settings are invalid. It also rejects the example JWT secret. Password reset is intentionally unavailable in production until a real email delivery provider is configured; development uses a mock reset link and never logs the token. Add automated authorization/authentication tests, deployment health checks, backups, and monitoring before opening the site to users. The admin role-management endpoint currently has no admin UI.

## Architecture

- `frontend/`: responsive React workspace, Monaco syntax editing, Zustand shared state, Axios API integration, refresh-session handling, snippet filters, discussion and history views.
- `backend/`: Express REST API, short-lived JWT access tokens plus rotating refresh tokens in HTTP-only cookies, bcrypt password hashing, role-aware snippet permissions, MongoDB schemas and indexes, pagination, request logging, Helmet headers, and rate limiting.
- Socket.IO supports authenticated snippet rooms, permission-checked edit broadcasts, new comment events, and scoped activity events. Each REST content update records a version snapshot. New comments also log a mock email notification in the API console.
- MongoDB collections: users, snippets, versions, comments, and activities. Snippets index language, owner, and text-searchable title/description/content/tags.

## API overview

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register and receive an access token |
| POST | `/api/auth/login` | Log in and receive an access token |
| GET/PATCH | `/api/users/me` | Read or update the authenticated profile |
| GET/POST | `/api/snippets` | Search/paginate or create snippets |
| GET/PATCH/DELETE | `/api/snippets/:id` | Read, update/version, or delete a snippet |
| POST | `/api/snippets/:id/comments` | Add a line comment or threaded reply |
| PATCH | `/api/comments/:id/resolve` | Resolve a discussion |
| GET | `/api/snippets/:id/versions` | Read version history |
| GET | `/api/activity` | Read recent activity |

Send `Authorization: Bearer <token>` to protected routes. Snippet search accepts `q`, `language`, `author`, `from`, `to`, `page`, and `limit`. Swagger UI: `/api/docs`.

## Current scope

Registration/login, refresh-token rotation, profile updates, admin/editor/viewer access roles, snippet CRUD and sharing, language selection, threaded line comments, resolution, version records, searchable/paginated listing with language/author/date filters, live Socket.IO events, mock email notices, configurable GitHub/Google OAuth, and Docker Compose are implemented. Social login requires provider app credentials. Email uses a mock console notice; configure an email provider to send real messages. Public repository hosting and deployment still require your GitHub/hosting accounts and credentials.
