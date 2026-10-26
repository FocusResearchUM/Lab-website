# Tanager hosting preparation

SSH access does not establish that persistent Node.js applications are allowed.
First run these read-only commands after logging into Tanager:

```sh
node --version
npm --version
uname -s
command -v systemctl
command -v pm2
```

This project requires Node.js >=22.12.0. Confirm with CS server support whether
your account can run a persistent Node process, how it should be supervised,
and whether the HTTPS web server can proxy the site's URL to localhost:3001.
Also confirm the assigned website URL: domain root versus a user subdirectory.
The current browser API URLs use `/api`, so a subdirectory deployment requires
adjusting API routing before launch. Do not place the whole project or its
credentials in a public_html directory.

Once Node hosting and routing are confirmed, keep the application in a private
directory. Upload source plus package.json/package-lock.json, excluding
node_modules and Windows build output. Install and build on the Linux server:

```sh
npm ci
npm run build:all
```

Provide MongoDB configuration using the host's environment configuration or
`atlas-credentials.env` in the private project root (permissions 600). Use:

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3001
# Only if the web proxy is on the same machine and configured appropriately:
TRUST_PROXY=loopback
```

Keep Express on loopback behind a local HTTPS reverse proxy. If the university
uses another network setup, configure HOST and proxy trust for that setup.
Secure login cookies require HTTPS in production. The proxy should replace
forwarded client IP headers with verified client information. Atlas must allow
the server's outbound IP, and the server must allow outbound MongoDB connections.

`npm start` runs the built frontend and API together; it must be managed by the
university-supported process supervisor to survive logout and restart.
Verify `/api/ready`, the homepage, `/#/admin`, login, publish, and logout through
the actual HTTPS URL. Keep runtime files (`dist/`, `dist-server/`, package files,
node_modules, and backend environment settings). Existing MongoDB content does
not need to be imported again.

If persistent Node hosting is unavailable, this host can serve only the built
frontend; an approved separate backend host and API routing will be needed.
