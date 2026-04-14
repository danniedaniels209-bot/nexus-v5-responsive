# Nexus v5 — Midnight Luxury Social Platform

A premium, cinematic, production-ready social platform built with React + Vite + Tailwind CSS.

---

## 🎨 Design System

**Midnight Luxury + Glass UI** — dark, layered, cinematic.

| Token | Value |
|-------|-------|
| Background | `#0B0B0F` |
| Surface | `#111827` |
| Glass | `rgba(255,255,255,0.04)` |
| Border | `rgba(255,255,255,0.08)` |
| Primary Accent (Purple) | `#8B5CF6` |
| Secondary Accent (Cyan) | `#22D3EE` |
| Text Primary | `#E5E7EB` |
| Text Secondary | `#9CA3AF` |

All tokens live in `client/src/index.css` `:root` and `client/tailwind.config.js`.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment

```bash
# server/.env (create or update with your values)
MONGO_URI=mongodb+srv://musadaniel2596_db_user:PVREgnexFmhjCaJs@cluster0.hqjnzci.mongodb.net/nexus?appName=Cluster0
JWT_SECRET=nexus_local_dev_secret_change_me_2026
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open http://localhost:5173

---

## 🧪 Testing

```bash
cd client

# Run all tests once
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage

# Visual test UI
npm run test:ui
```

### Test coverage includes:
- `authStore.test.js` — 9 tests for Zustand auth store (login, register, logout, init, updateUser)
- `Login.test.jsx` — 6 tests for Login form UI interactions
- `ProtectedRoute.test.jsx` — 5 tests for route guard behaviour

---

## 📁 Project Structure

```
nexus-v5/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              ← JWT interceptors + silent refresh
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   └── ParticleField.jsx ← Canvas particle system + mouse parallax
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx        ← Glassmorphism nav + user dropdown
│   │   │   └── ui/
│   │   │       ├── Avatar.jsx        ← Deterministic color initials
│   │   │       ├── ErrorBoundary.jsx ← Class-based error boundary
│   │   │       ├── Modal.jsx         ← Animated glass modal
│   │   │       ├── PostCard.jsx      ← 3D tilt card + like/share
│   │   │       ├── Skeleton.jsx      ← Feed/profile/chat skeleton loaders
│   │   │       └── Spinner.jsx       ← Multi-ring page spinner
│   │   ├── context/
│   │   │   ├── authStore.js          ← Zustand auth + silent refresh
│   │   │   └── SocketContext.jsx     ← Socket.io DM + presence
│   │   ├── hooks/
│   │   │   ├── useDebounce.js
│   │   │   ├── useMediaQuery.js
│   │   │   └── usePosts.js
│   │   ├── pages/
│   │   │   ├── Landing.jsx           ← Cinematic hero + particle BG
│   │   │   ├── Login.jsx             ← Glass auth form
│   │   │   ├── Register.jsx          ← Glass auth + password strength
│   │   │   ├── Feed.jsx              ← Skeleton loading + glass sidebar
│   │   │   ├── Explore.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── NotFound.jsx          ← 404 with gradient number
│   │   ├── tests/
│   │   │   ├── setup.js              ← RTL + mock setup
│   │   │   ├── authStore.test.js
│   │   │   ├── Login.test.jsx
│   │   │   └── ProtectedRoute.test.jsx
│   │   ├── App.jsx                   ← Lazy routes + auth event listener
│   │   ├── index.css                 ← Design system tokens + utilities
│   │   └── main.jsx
│   ├── tailwind.config.js            ← Extended color/animation tokens
│   ├── vite.config.js                ← Build chunks + proxy
│   ├── vitest.config.js              ← Test runner config
│   └── package.json
└── server/                           ← Node/Express/MongoDB backend (unchanged)
    ├── models/
    ├── routes/
    ├── middleware/
    ├── socket/
    └── server.js
```

---

## 🔐 Authentication Flow

1. **Login/Register** → receives `accessToken` in response body + `refreshToken` in HTTP-only cookie
2. **Axios interceptor** attaches `Bearer <token>` to every request
3. **401 response** → interceptor silently calls `/api/auth/refresh` (using cookie)
4. **Refresh success** → new token stored, original request retried
5. **Refresh failure** → `nexus:logout` event dispatched → auth store clears → redirect to `/login`

---

## ⚡ Performance

- All heavy pages lazy-loaded via `React.lazy` + `Suspense`
- ParticleField runs in canvas (off main thread via RAF)
- Vite manual chunk splitting: react-vendor / motion / networking
- Skeleton loaders for Feed, Profile, Chat views
- Error boundaries at app root and can be added per-page

---

## 🎥 3D / Visual Effects

- **ParticleField** — canvas-based, 60 particles with depth, mouse parallax, and purple/cyan/white color mix
- **Glass morphism** — `.glass`, `.glass-card`, `.glass-strong` utility classes
- **3D card tilt** — `onMouseMove` handler on PostCard rotates on hover
- **Animated orbs** — CSS keyframe blob animation on Landing hero background
- **Gradient text** — `.text-gradient-purple` / `.text-gradient-hero` utilities

---

## 🐛 Bugs Fixed from v4

1. ✅ `Outfit` font referenced in App.jsx but never imported → removed, now uses `DM Sans`
2. ✅ `@import` placed after `@tailwind` directives → moved before Tailwind imports
3. ✅ `/home` route had no auth guard → now uses `Home.jsx` redirect component
4. ✅ Footer copyright year hardcoded as 2025 → now `new Date().getFullYear()`
5. ✅ Dead CSS classes (`.nebula-*`, `.stars-field`) → removed from stylesheet
6. ✅ Duplicate `@media` breakpoint blocks → consolidated into single blocks
7. ✅ `server/.env` should NOT be committed → added to `.gitignore`

---

## 🚢 Deployment

See `DEPLOYMENT_GUIDE.md` and `render.yaml` / `vercel.json` for platform-specific configs.

Docker: `docker-compose up --build`
