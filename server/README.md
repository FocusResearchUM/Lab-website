# Backend foundation

Start the API with `npm run dev:server` and the frontend in another terminal with
`npm run dev`. The API listens on `127.0.0.1:3001`; Vite forwards `/api` requests
to it. If you change `PORT`, update the Vite proxy target too.

## Admin interface

Open `/#/admin` on the frontend's local URL (for example,
`http://127.0.0.1:5173/#/admin`). This project uses hash routing, so include `/#/`.
Log in using an account in the `admins` collection. The dashboard has News,
People, and Publications tabs with add/edit forms, preview, draft/publish
buttons, and delete confirmation. Save draft also unpublishes an existing entry.
Separate news paragraphs with blank lines. Photo paths refer to existing assets
under `public/assets`; uploading photos is not implemented yet.

The UI checks required fields for empty values only. MongoDB's existing schema
still enforces record formats. Public pages now read published content from the
API. Reload or navigate back to a page to see dashboard changes; returning to
the browser tab also refreshes content. Drafts are hidden from public pages.

## Import existing content

Run `npm run seed:content` to import the snapshot in `server/seed-content.json`.
This adds missing records as published while preserving existing IDs, edits,
and drafts. Rerunning does not overwrite matching records. It does not modify
admin accounts. The JSON file is an initial migration snapshot, not the live
content source. The server/seed-content.json file must accompany the compiled
seed script when running an import on a host.

News, people, publications, homepage news, and project publication details use
the API. Site settings, themes, and research project descriptions remain in
`src/data/content.ts`. Public pages now require the backend; static-only hosting
needs a separately hosted API and production routing for `/api`.

The backend loads `atlas-credentials.env` from the project root when present.
Production environment variables take precedence; production does not require
that file. See `.env.example` for the supported settings. `MONGODB_DB` defaults
to `focus`. Supply credentials inside the URI or through `MONGODB_USERNAME` and
`MONGODB_PASSWORD` (separate credentials take precedence). Never use `VITE_`
variables for database credentials.

The API starts only after MongoDB connects and responds to a ping.
`GET /api/health` checks the API process; `GET /api/ready` pings MongoDB and returns
503 when the database is unavailable. Neither endpoint exposes credentials.

Run `npm run check:db` for a standalone, read-only database connection check.
If it fails, confirm your Atlas database user's credentials, allow the backend's
IP address in Atlas Network Access, and check network/DNS connectivity. Raw
driver errors are deliberately not printed because they can contain secrets.

## Database records

Run `npm run setup:db` to configure the `admins`, `sessions`, `news`, `people`,
and `publications` collections. This applies strict MongoDB validation and
indexes; it does not insert accounts or import content. It can be run again.
Existing incompatible records stop setup during preflight. Duplicate IDs or
emails stop unique-index creation; setup is not transactional and may partially
complete, so resolve the issue before rerunning.

`models.ts` defines typed collection access. Content keeps the existing public
`id` separate from MongoDB's `_id`, with `status` (`draft` or `published`) and
`createdAt`/`updatedAt` dates. Optional fields should be omitted when empty.
News dates use `YYYY-MM`; people retain the current groups and optional image
path; publications retain themes and optional project/paper/code links.

Admins store normalized lowercase emails and Argon2id password hashes. Account
creation will normalize emails before saving. Sessions store only a SHA-256
token hash, an admin reference, and creation/expiration dates. MongoDB's TTL
index cleans expired sessions asynchronously; login middleware must still check
`expiresAt` on every authenticated request. Content API checks are limited to
empty required fields; optional relationships are stored as supplied.

Run `npm run typecheck:server` to check the backend, `npm run build:server` to
compile it, and `npm run start:server` to run the compiled output.

As features are implemented, add database setup in `db.ts`, request handlers in
`routes/`, authorization in `middleware/`, and setup commands in `scripts/`.
The server currently binds to loopback for local development. Deployment will
need an appropriate listen address and HTTPS routing.
