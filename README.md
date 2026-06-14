# Lincy Meal Planner

A responsive, installable meal-planning web app with weekly and monthly views, editable recipes, consolidated shopping lists, and meal repetition insights.

## Run locally

Run `npm start`, then open `http://localhost:8765`. Node.js 22.5 or newer is required.

The server creates `lincy.sqlite` automatically. Create the first user and kitchen, then use the displayed invite code when creating a second account. Both accounts share one household plan.

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
