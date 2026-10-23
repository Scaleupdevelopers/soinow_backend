# SoiNow Backend

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.
3. Install dependencies with `npm install`.

## Run

```bash
npm run dev
```

Production uses `npm run build` followed by `npm start`.

Health check: `GET /api/v1/health`

Authentication endpoints are under `/api/v1/auth`:

- `POST /register`
- `POST /login`
- `POST /refreshToken`
- `POST /logout`
