# API Contract (Step 1)

This is the agreed contract between the React frontend and the backend service.

## Base rules

- Base path: `/api`
- Frontend calls use relative URLs (example: `fetch('/api/scores')`)
- Auth uses HTTP-only cookie token set by auth endpoints
- Error shape: `{ "msg": "Human-readable message" }`

## Data models

### Auth request

```json
{
  "username": "carson",
  "password": "secret123"
}
```

### Auth response

```json
{
  "username": "carson"
}
```

### Score entry

```json
{
  "username": "carson",
  "score": 17,
  "date": "2026-03-14"
}
```

### Submit score request

```json
{
  "score": 17
}
```

### Submit score response

```json
{
  "personalBest": 17,
  "isNewPersonalBest": true,
  "date": "2026-03-14"
}
```

## Endpoints

### Register

- Method: `POST`
- Path: `/api/auth`
- Body: auth request
- Success: `200`, sets auth cookie, returns auth response
- Errors:
  - `400` if missing username/password
  - `409` if username already exists

### Login

- Method: `PUT`
- Path: `/api/auth`
- Body: auth request
- Success: `200`, sets auth cookie, returns auth response
- Errors:
  - `400` if missing username/password
  - `401` if bad credentials

### Logout

- Method: `DELETE`
- Path: `/api/auth`
- Body: none
- Success: `200`, clears auth cookie, returns `{}`

### Get current user (protected)

- Method: `GET`
- Path: `/api/user/me`
- Body: none
- Success: `200`, returns auth response
- Errors:
  - `401` if not authenticated

### Get leaderboard

- Method: `GET`
- Path: `/api/scores`
- Body: none
- Success: `200`

```json
{
  "scores": [
    { "username": "carson", "score": 17, "date": "2026-03-14" }
  ]
}
```

### Submit score (protected)

- Method: `POST`
- Path: `/api/scores`
- Body: submit score request
- Success: `200`, returns submit score response
- Behavior:
  - Saves only if submitted score is higher than existing personal best
  - Updates date only when a new personal best is saved
  - Rejects scores above the configured server max (`MAX_ACCEPTED_SCORE`, default `1000`)
- Errors:
  - `400` if score is missing or invalid
  - `401` if not authenticated

## Sorting rule for leaderboard

- Backend returns scores sorted by:
  1. `score` descending
  2. `date` descending (most recent first) if score ties

## Cookie rule

- Cookie name: `token`
- `httpOnly: true`
- `sameSite: 'strict'`
- `secure: true` in production (use non-secure for localhost development)
