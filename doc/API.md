# DeepWork Public API Documentation

Welcome to the DeepWork API documentation. Our endpoints are versioned under `/api/v1/`.

## Base URL
All requests are structured against the base application host, e.g., `https://yourdomain.com/api/v1/`.

## Authentication
Authentication is managed via HTTP-only, secure cookies containing JSON Web Tokens (JWT). The client does not need to handle tokens manually; ensure that your HTTP client includes credentials (e.g., `credentials: 'include'` for `fetch`).

---

## Auth Endpoints

### 1. Register
Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "_id": "64f1a2...",
    "email": "jane@example.com",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Missing fields or invalid email format.
- `409 Conflict`: Email already exists.

---

### 2. Login
Authenticate an existing user and set the session cookie.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "64f1a2...",
    "email": "jane@example.com",
    "name": "Jane Doe"
  }
}
```

**Errors:**
- `400 Bad Request`: Missing fields.
- `401 Unauthorized`: Invalid credentials.

---

### 3. Logout
Clear the session cookie, signing the user out.

**Endpoint:** `POST /api/v1/auth/logout`

**Response (200 OK):**
```json
{
  "data": { "success": true }
}
```

---

### 4. Get Current User
Retrieve the details of the currently authenticated user.

**Endpoint:** `GET /api/v1/auth/me`

*Requires active session cookie.*

**Response (200 OK):**
```json
{
  "data": {
    "_id": "64f1a2...",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "settings": {
      "workDuration": 45,
      "shortBreakDuration": 10,
      "longBreakDuration": 20,
      "dailyFocusThreshold": 100
    }
  }
}
```

**Errors:**
- `401 Unauthorized`: No valid session found.

---

## Session Endpoints

### 5. Create Session
Log a completed focus or break session.

**Endpoint:** `POST /api/v1/sessions`

*Requires active session cookie.*

**Request Body:**
```json
{
  "duration": 2700, // Duration in seconds
  "mode": "focus",  // "focus", "shortBreak", or "longBreak"
  "tag": "DeepWork Project" // Optional string tag
}
```

**Response (201 Created):**
```json
{
  "data": {
    "userId": "64f1a2...",
    "duration": 2700,
    "mode": "focus",
    "tag": "DeepWork Project",
    "_id": "64f2b3...",
    "createdAt": "2024-01-01T13:00:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid parameters.

---

### 6. List Sessions
Retrieve a paginated list of past sessions.

**Endpoint:** `GET /api/v1/sessions`

*Requires active session cookie.*

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "64f2b3...",
      "duration": 2700,
      "mode": "focus",
      "tag": "DeepWork Project",
      "createdAt": "2024-01-01T13:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 7. Get Accumulated Focus Time Today
Returns the total accumulated focus minutes for the current day in UTC.

**Endpoint:** `GET /api/v1/accumulated`

*Requires active session cookie.*

**Response (200 OK):**
```json
{
  "data": {
    "minutes": 120
  }
}
```

---

### 8. List Tags
Retrieve unique tags used by the user, alongside their frequency.

**Endpoint:** `GET /api/v1/tags`

*Requires active session cookie.*

**Response (200 OK):**
```json
{
  "tags": [
    {
      "_id": "DeepWork Project", // The tag name
      "count": 5 // How many sessions have this tag
    }
  ]
}
```

---

## User Settings

### 9. Update Settings
Update configuration settings for the timer. Updates are merged into the existing settings document.

**Endpoint:** `PATCH /api/v1/settings`

*Requires active session cookie.*

**Request Body:**
```json
{
  "workDuration": 50,
  "shortBreakDuration": 15,
  "longBreakDuration": 30,
  "dailyFocusThreshold": 120
}
```

**Response (200 OK):**
```json
{
  "data": {
    "workDuration": 50,
    "shortBreakDuration": 15,
    "longBreakDuration": 30,
    "dailyFocusThreshold": 120
  }
}
```

**Errors:**
- `400 Bad Request`: Validation errors on inputs.
