# Expire Share — Client

Web interface for [expire-share](https://github.com/mkaascs/ExpireShare). Allows users to download and upload files by alias, register, log in. Access and refresh tokens are stored in `localStorage`; protected requests automatically refresh the token pair on `401`.

---

## Features

- **File download** — enter an alias, file downloads automatically; password prompt appears if required
- **Authentication** — register, login, logout with JWT token pair
- **Auto token refresh** — on `401` the client silently refreshes tokens and retries the request; on refresh failure redirects to `/login`
- **Session persistence** — tokens survive page reloads via `localStorage`

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Language** | JavaScript (ES2022+) |
| **Framework** | React 19 |
| **Routing** | React Router v7 |
| **Bundler** | Vite 8 |
| **Styles** | CSS Modules |
| **Fonts** | Inter, Caveat (Google Fonts) |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with alias input form |
| `/download/:alias` | File download page — auto-fetches on load |
| `/login` | Login form |
| `/register` | Registration form |

---

## Quick Start

### Prerequisites

- Node.js 22+
- Docker + Docker Compose
- [expire-share](https://github.com/mkaascs/ExpireShare) backend running

### Environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_TARGET` | Backend base URL, e.g. `http://localhost:8080` | Yes |

Create a `.env` file in the project root:

```env
VITE_API_TARGET=http://localhost:8080
```

### Local

```bash
npm install
npm run dev
```

App will be available at `http://localhost:3000`.

### Docker

```bash
docker compose up --build
```

---

## Docker networking

The frontend container joins the shared `services-network` created by auth-service. The backend is reachable inside Docker via the `expire-share` hostname.

`VITE_API_TARGET` must point to a host-accessible address (e.g. `http://localhost:8080`), since the variable is used by the browser, not the container.

```
Browser  ──HTTP──►  expire-share-client (3000)  ──API calls──►  expire-share (8080)
                          └── services-network (shared)
```

---