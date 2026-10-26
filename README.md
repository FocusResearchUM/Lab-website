# FOCUS research lab website

A React + TypeScript website with an Express backend and MongoDB content storage. The admin dashboard manages news, people, and publications; public pages load published records from the API. See [server/README.md](server/README.md) for environment setup, import commands, and admin access.

## Run locally

Use Node.js 22.12 or newer (Node.js 24 LTS recommended) and pnpm 10 or newer.

```sh
npm ci
npm run dev
```

Open the local URL shown in your terminal.

To run the backend, open a second terminal and run `npm run dev:server`.
Visit `/api/health` on the Vite development URL to check the proxy connection.
See [server/README.md](server/README.md) for backend commands and scope.
Use `package-lock.json` with npm; the older pnpm lockfile does not include the backend dependencies.

```sh
pnpm typecheck   # Strict TypeScript checks
pnpm build       # TypeScript check and production build
pnpm preview     # Serve the production build locally
```

The included `dist/` folder is a production build, ready for static hosting. It still needs an HTTP server; opening `index.html` with a `file://` URL will not reliably run a module-based React app.

## Pages and functionality

- Home with research themes and featured news
- Research overview and project detail pages for Contorter and CONTEXTS
- People, including current members and alumni
- Publications with title/author search, year filters, theme filters, result counts and an empty state
- News index and an individual page for every announcement
- Join us with links to the existing application form and admissions requirements
- Contact with the director’s email and faculty profile
- A page-not-found screen for invalid routes or record IDs
- Responsive desktop, tablet and phone layouts
- Keyboard navigation, a skip link, visible focus, accessible menu labels and reduced-motion support

## Project structure

```text
public/
  assets/                 # Network hero and transparent research icons
  favicon.svg
src/
  components/
    Icons.tsx              # Functional interface icons
    Layout.tsx             # Header, responsive navigation, footer
    Shared.tsx             # Hero, research themes and shared sections
  data/
    content.ts             # Typed site content and all external URLs
  pages/
    Home.tsx
    Research.tsx           # Overview and project detail
    People.tsx
    Publications.tsx
    News.tsx               # Index and article detail
    Utility.tsx            # Join, Contact and 404
  App.tsx                  # Route definitions
  main.tsx                 # React entry point
  styles.css               # Tokens and shared/responsive styles
  styles-pages.css         # Page-specific layouts
index.html
package.json
pnpm-lock.yaml
tsconfig.json
vite.config.ts
```

## Update content

Manage news, people, and publications at `/#/admin`. To import the original content once, run `npm run seed:content`; existing records are preserved. Site settings, themes, and research descriptions remain in **`src/data/content.ts`**. The arrays there are original reference data and no longer control public content.

- **People:** add or edit a record in `people`. To use a real headshot, put it in `public/assets/people/` and set `image: 'people/name.jpg'`. The site uses initials when no image is provided.
- **Publications:** add a record to `publications` with its year, authors, venue and theme IDs. Add verified `paperUrl` and `codeUrl` values when available. Missing links are omitted. The page groups entries by year.
- **Projects:** add a record to `projects` and reference a publication using `publicationId`. Each record automatically gets a detail route.
- **News:** add a record to `news`, keeping the newest first. The first item appears as the News page’s feature. Each item gets a detail route. Dates use `YYYY-MM` because the original announcements provide month precision.
- **Homepage feature:** edit the featured story in `src/pages/Home.tsx` when you want to promote a different item.
- **Application/contact links:** update the `site` object.

Research categories use the IDs `provenance`, `ai`, `network` and `cloud`. Filter links and publication records use these same IDs.

## Change the design

The main colors and typeface are CSS variables at the top of `src/styles.css`. The layout uses Georgia for editorial headings and Arial for body text, with system fallbacks. No font download is needed. The network background and transparent PNG icons come from the supplied design assets.

The FOCUS wordmark is rendered as selectable text. All page text, controls and layouts are real React components; the website does not display full-page mockup images. The project diagram is an illustrative SVG, not a research result.

## Static hosting

1. Run `pnpm build`.
2. Upload the **contents of `dist/`** to your static host, or configure its build command as `pnpm build` and output folder as `dist`.

The app uses `HashRouter`, producing routes such as `/#/research/contorter`. This supports direct links, refreshes and project subfolders without server rewrite rules. Vite uses `base: './'` for portable asset paths. Hash routing has less search-engine visibility than prerendered page URLs; if search indexing becomes a priority, move to prerendered/static routes before public launch.

Static hosting alone does not run the backend. Configure production `/api` routing to a Node.js backend and provide its MongoDB environment settings. Application information stays in the existing Google Form; contact links open the visitor’s email client. Search and filtering operate on published publications fetched from the API.

## Content and assets

The initial content comes from the public FOCUS lab site and the director’s academic profile. The design uses proposed editorial summaries. Review current membership and opening availability before public launch.

- Lab: https://sites.google.com/view/focusresearch
- Director and publications: https://azadeht.github.io/
- Application form: https://docs.google.com/forms/d/e/1FAIpQLSdFX1XZh8LTzpguhUn5Sa9Fo0NIpPr10z3HdL-kjAwezG2mHw/viewform
- Admission requirements: https://umanitoba.ca/science/computer-science/graduate-programs-application-info
- Contorter paper: https://azadeht.github.io/papers/Contorter_sp26.pdf
- Contorter code: https://github.com/focusResearchLab/Contorter
- CONTEXTS paper: https://azadeht.github.io/papers/CONTEXTS-sp25.pdf

The generated graphics are design assets. No official university logo or staff photograph is included. React, React Router, Vite and other dependencies retain their respective licenses.

## Troubleshooting in restricted environments

If Vite’s default config bundler is blocked by filesystem restrictions, Node.js 24 can load the config natively:

```sh
pnpm exec vite build --configLoader native
pnpm exec vite preview --configLoader native
```

These commands still create and serve the normal production build. Vite’s development dependency optimizer may need ordinary read access to the project’s parent directories in a restricted agent sandbox.
