# Crustecan Warrior API

Sports team ticketing system.

Web UI repository: https://github.com/YosepRA/crustecan-warrior-ui

## Installation

`npm install`

## Start Development Server

`npm run dev`

## Environment Variables

- `NODE_ENV`  
  Node environment.
- `MONGO_URL`  
  MongoDB instance URL. Local or cloud.
- `STRIPE_PUBLIC`  
  Stripe publishable key. Get one from your Stripe account's developer dashboard.
- `STRIPE_SECRET`  
  Stripe secret key. Get one from your Stripe account's developer dashboard.
- `STRIPE_WEBHOOK_SECRET`
  Stripe webhook secret. Get one from either Stripe CLI for local development, or Stripe developer dashboard on production.
- `UI_ORIGIN`  
  Front-end origin for CORS and cookies.
- `SESSION_SECRET`  
  Session secret key.
