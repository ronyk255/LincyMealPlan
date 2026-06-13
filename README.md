# Lincy Meal Planner

A responsive, installable meal-planning web app with weekly and monthly views, editable recipes, consolidated shopping lists, and meal repetition insights.

## Run locally

Open `index.html`, or serve the folder with any static file server.

## Features

- Weekly plan with breakfast, lunch, dinner, and snack slots
- Monthly calendar overview
- Recipe and ingredient suggestions generated in the browser
- Editable ingredients, instructions, servings, and video links
- Week or month shopping-list aggregation
- Repeated-meal and plan-coverage insights
- Local browser persistence and offline PWA support

The current recipe generator is deterministic and runs entirely in the browser. It is intentionally structured so a hosted AI/API endpoint can replace `generateRecipe()` later without changing the planner UI.
