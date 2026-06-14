# Lincy Meal Planner

A responsive, installable meal-planning web app with weekly and monthly views, editable recipes, consolidated shopping lists, and meal repetition insights.

## Run locally

Run `npm start`, then open `http://localhost:8765`. Node.js 22.5 or newer is required.

The server creates `lincy.sqlite` automatically and seeds `rony` as the administrator. On first startup, the terminal prints Rony's one-time setup code. Use **Set first password** to choose the admin password.

Only an administrator can create or rename additional kitchen users. Each new account receives a one-time setup code so the user can privately choose their own password. Renaming a user keeps their password and household access intact.

Without a connected API, GitHub Pages runs as a read-only preview. Connecting the free Cloudflare Worker enables shared accounts and saved household data.

## Free login for GitHub Pages

The `cloudflare` folder contains a free Cloudflare Worker and D1 database backend. GitHub Pages continues to host the interface.

The free backend is deployed at `https://lincy-meal-plan-api.ronyk212.workers.dev` and the GitHub Pages app connects to it automatically.

To finish Rony's account, open the GitHub Pages site, select **Set first password**, use username `rony`, enter the private one-time setup code, and choose the permanent admin password.

For future backend changes, run `npm run cloudflare:deploy`. The D1 database configuration is stored in `cloudflare/wrangler.toml`; the private setup code remains an encrypted Cloudflare secret.

The login session is remembered by the browser. No password or setup code is stored in GitHub.

## Features

- Weekly plan with breakfast, lunch, dinner, and snack slots
- Monthly calendar overview
- Recipe and ingredient suggestions generated in the browser
- Editable ingredients, instructions, servings, and video links
- Week or month shopping-list aggregation
- Repeated-meal and plan-coverage insights
- SQLite or Cloudflare D1-backed user accounts and shared household persistence
- Local browser cache and offline PWA support

The current recipe generator is deterministic and runs entirely in the browser. It is intentionally structured so a hosted AI/API endpoint can replace `generateRecipe()` later without changing the planner UI.
