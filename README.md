# Juyo Analytics – Demo Dashboard

A simplified analytics dashboard inspired by Juyo Analytics.  
Built with **Angular (latest)** + **RxJS** and includes **3 independent widgets** powered by mocked HTTP endpoints.

## Quick start

npm install
npm start

Local: http://localhost:4200/

## What’s included

- **Dashboard with shared filters**
  - Hotel selector
  - Date range selector (Last 7 days / Last 30 days / ...)
- **3 widgets (independent + reactive)**
  1. **Performance** (Revenue + Occupancy) — **amCharts**
  2. **KPIs** tiles (Total Revenue, ADR, Avg Occupancy, Total Bookings)
  3. **Bookings by Channel** (distribution)
- **UX states covered (per widget)**
  - Loading
  - Empty
  - Error + retry

## Tech choices (short)

- **Angular (standalone components + modern DI)**
- **RxJS-first data flow** (no nested subscriptions, async pipe in templates)
- **amCharts** used for the main performance visualization
- **Mock API files** live under `src/assets/mock/**` and are served from `/assets/mock/**` at runtime.
- **Performance awareness**
  - Charts created **outside Angular zone** to reduce change detection overhead
  - `OnPush` change detection where appropriate
