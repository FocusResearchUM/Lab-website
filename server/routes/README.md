# Authentication API

The professor's existing `admins` record is used as-is. No registration or
password changes are performed. Encoded Argon2id parameters are read by the
verification library, including the hash already supplied.

- `POST /api/auth/login`: JSON `{ "email": "...", "password": "..." }`, with
  `X-Requested-With: focus-admin`. Returns public admin fields and `csrfToken`.
- `GET /api/auth/me`: returns the same public admin fields and CSRF token for
  a valid session; otherwise 401. Use this to restore the frontend login state.
- `POST /api/auth/logout`: requires the session cookie and `X-CSRF-Token` from
  login or `/me`. Deletes the session and clears its cookie.
- All `/api/admin` routes require a valid session; writes also require the CSRF
  header.

## Content API

For each of `news`, `people`, and `publications`:

- `GET /api/<collection>` and `GET /api/<collection>/:id` return published records.
- `GET /api/admin/<collection>` and `GET /api/admin/<collection>/:id` include drafts.
- `POST /api/admin/<collection>` creates a record with an automatically generated
  ID, timestamps, and draft status unless `status: "published"` is supplied.
- `PATCH /api/admin/<collection>/:id` updates supplied fields. Empty optional
  fields remove those fields. IDs and creation timestamps remain unchanged.
- `DELETE /api/admin/<collection>/:id` deletes the record.

Request bodies use the content fields in `models.ts`. Required fields must be
filled in; strings containing only whitespace count as empty. Required arrays
must contain at least one nonempty item. No API format or relationship checks
are added. The existing MongoDB schema still applies, and rejected records return
400. Optional relationships are stored as supplied; deletion does not check
references. Public pages fetch published content from these endpoints.

The browser manages an HttpOnly, SameSite=Strict cookie. In production
(`NODE_ENV=production`) it also uses Secure and a `__Host-` name, requiring HTTPS.
Session tokens are random; only SHA-256 hashes are stored in MongoDB. Sessions
expire after eight hours, are checked on each request, and are invalid if the
admin account no longer exists. Passwords and password hashes are never returned.
No SESSION_SECRET is needed because sessions use opaque random tokens, not JWTs.

Login allows ten attempts per IP per fifteen minutes. The limiter currently
uses process memory; deployments with multiple instances need a shared limiter
store. Reverse-proxy trust settings must be configured for the chosen host,
rather than trusting arbitrary forwarded IP headers. No cross-origin access
is enabled; frontend and API should share an origin through Vite or production
routing.

`npm run test:auth` runs integration checks on port 3011 using a temporary
admin and sessions in the configured database and cleans them up afterward.
It checks login errors, normalization, cookie flags, session expiry, CSRF,
logout, and rate limiting. Do not run while port 3011 is in use.
