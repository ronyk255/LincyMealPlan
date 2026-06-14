# Lincy Meal Planner

A responsive, installable meal-planning web app with weekly and monthly views, editable recipes, consolidated shopping lists, and meal repetition insights.

## Run locally

Run `npm start`, then open `http://localhost:8765`. Node.js 22.5 or newer is required.

The server creates `lincy.sqlite` automatically and seeds `rony` as the administrator. On first startup, the terminal prints Rony's one-time setup code. Use **Set first password** to choose the admin password.

Only an administrator can create or rename additional kitchen users. Each new account receives a one-time setup code so the user can privately choose their own password. Renaming a user keeps their password and household access intact.

Without a connected API, GitHub Pages runs as a read-only preview. Connecting the free Cloudflare Worker enables shared accounts and saved household data.

## Free login for GitHub Pages

The `cloudflare` folder contains a free Cloudflare Worker and D1 database backend. GitHub Pages continues to host the interface.

1. Create a free Cloudflare account and install Wrangler with `npm install --save-dev wrangler`.
2. Run `npx wrangler login`.
3. Run `npx wrangler d1 create lincy-meal-plan`.
4. Copy the returned database ID into `cloudflare/wrangler.toml`.
5. Run `npx wrangler d1 execute lincy-meal-plan --remote --file cloudflare/schema.sql`.
6. Run `npx wrangler secret put ADMIN_SETUP_CODE --config cloudflare/wrangler.toml` and enter a private one-time code for Rony.
7. Run `npm run cloudflare:deploy`.
8. On the GitHub Pages preview, paste the resulting `https://...workers.dev` address into **Cloudflare Worker URL** and select **Connect free login**.
9. Select **Set first password**, use username `rony`, enter the private setup code, and choose the permanent admin password.

The Worker URL and login session are remembered by that browser. No password or setup code is stored in GitHub.

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
