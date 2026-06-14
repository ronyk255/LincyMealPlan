# Lincy Meal Planner

A responsive, installable meal-planning web app with weekly and monthly views, editable recipes, consolidated shopping lists, and meal repetition insights.

## Run locally

Run `npm start`, then open `http://localhost:8765`. Node.js 22.5 or newer is required.

The server creates `lincy.sqlite` automatically and seeds `rony` as the administrator. On first startup, the terminal prints Rony's one-time setup code. Use **Set first password** to choose the admin password.

Only an administrator can create or rename additional kitchen users. Each new account receives a one-time setup code so the user can privately choose their own password. Renaming a user keeps their password and household access intact.

The GitHub Pages deployment runs in static mode and saves plans in that browser. Shared accounts require the Node server because GitHub Pages cannot run server-side code or SQLite.

## Features

- Weekly plan with breakfast, lunch, dinner, and snack slots
- Monthly calendar overview
- Recipe and ingredient suggestions generated in the browser
- Editable ingredients, instructions, servings, and video links
- Week or month shopping-list aggregation
- Repeated-meal and plan-coverage insights
- SQLite-backed user accounts and shared household persistence
- Local browser cache and offline PWA support

The current recipe generator is deterministic and runs entirely in the browser. It is intentionally structured so a hosted AI/API endpoint can replace `generateRecipe()` later without changing the planner UI.
