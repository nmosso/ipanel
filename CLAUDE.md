# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Serve dev server at http://localhost:4200
npm run build      # Production build (output: dist/)
npm run watch      # Build in watch mode (development)
npm test           # Run unit tests via Karma
ng generate component components/<name>/<name>  # Scaffold new component
```

## Architecture

This is an **Angular 16** admin panel (based on AdminLTE) for an IPTV/streaming platform management system called **ikpanel**. It manages clients, devices (STBs), resellers (tenants), credits, and system parameters.

### Directory Layout

```
src/app/
├── app-routing.module.ts       # Root routes; all protected routes under DefaultLayoutComponent + authGuard
├── core/
│   ├── default-layout/         # Shell: header, sidebar, footer, control-sidebar
│   │   └── _nav.ts             # Sidebar nav items with role-based auth arrays
│   └── shared/utils/
│       ├── api.service.ts      # Central HTTP wrapper (all requests go through here)
│       └── const.ts            # API_URL, ENDPOINTS, API_ENDPOINTS enums
├── components/                 # Business-domain feature modules (lazy-loaded)
│   ├── clients/                # Client CRUD + payments/dues/logs
│   ├── devices/                # Device/STB management
│   ├── tenants/                # Reseller management
│   ├── parameters/             # System parameters
│   ├── credits/                # Credits management
│   └── monitoring/             # Monitoring with video.js
└── modules/
    ├── auth/                   # Login, register, reset-password + authGuard
    ├── dashboard/              # Dashboard with Chart.js + EMM/ECM stats
    └── user/                   # User management (superadmin only)
```

### API Layer

All HTTP calls go through `ApiService` (`src/app/core/shared/utils/api.service.ts`):
- `requestCall(endpoint, method, params?)` — GET requests
- `requestPost(endpoint, data)` — POST
- `requestPut(endpoint, data)` — PUT
- `requestDelete(endpoint, params?)` — DELETE

Every request reads `token` from `localStorage` and sends `Authorization: Bearer <token>` + `apikey` header from `environment.apikey`.

The base URL comes from `environment.api` (configured in `src/environments/environment.ts`).

### Authentication

- Token stored in `localStorage` as `'token'`
- `authGuard` checks token presence and redirects to `/login` if missing
- `AuthService.logout()` calls `localStorage.clear()`
- Role-based nav filtering via `auth` arrays in `_nav.ts` (roles: `superadmin`, `admin`, `tenant`)

### Feature Module Pattern

Each feature in `components/` follows the same structure:
- `<name>.module.ts` — lazy-loaded NgModule
- `<name>-routing.module.ts` — child routes
- `<name>.component.ts` — list view with DataTables
- `<name>.service.ts` — API calls using `ApiService`
- `<name>-form/` — create/edit form subcomponent

### Key Third-Party Libraries

- **angular-datatables** — all list views use DataTables
- **@sweetalert2/ngx-sweetalert2** — confirmation dialogs
- **@ng-select/ng-select** — select dropdowns
- **chart.js + chartjs-adapter-date-fns** — dashboard charts
- **ngx-socket-io** — real-time updates
- **video.js** — monitoring video streams
- **Bootstrap 5** — layout and components

### Environment Configuration

`src/environments/environment.ts` controls:
- `api`: backend base URL (production: `https://api.ikpanel.xyz`)
- `apikey`: static API key sent with every request
- `clientType`: `"client"` (used to differentiate panel type)
- `env_type`: `1` for production context
