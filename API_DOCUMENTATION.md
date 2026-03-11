# DeepWork API Documentation

This document describes the API endpoints for the DeepWork Pomodoro application.

## General Information

- **Base URL**: `/api/v1`
- **Authentication**: Authentication is handled via a JWT stored in an `HttpOnly` cookie named `token`.
- **Response Format**: All responses are JSON.

---

## 1. Authentication

### Register User
Creates a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe" (optional)
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "message": "User created",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John",
      "settings": { ... }
    }
  }
  ```

### Login
Authenticates a user and sets the session cookie.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response (200 OK)**:
  - Header: `Set-Cookie: token=...; HttpOnly; SameSite=Strict; Path=/`
  - Body:
    ```json
    {
      "message": "Logged in",
      "user": {
        "id": "...",
        "email": "user@example.com",
        "name": "John",
        "settings": { ... }
      }
    }
    ```

### Logout
Clears the authentication session.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Success Response (200 OK)**:
  - Header: `Set-Cookie: token=; Max-Age=0; ...`
  - Body: `{ "message": "Logged out" }`

### Current User
Retrieves information about the currently authenticated user.

- **URL**: `/auth/me`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  {
    "data": {
      "id": "...",
      "email": "user@example.com",
      "name": "John",
      "settings": { ... }
    }
  }
  ```

---

## 2. Sessions

### List Sessions
Retrieves a paginated list of work/break sessions.

- **URL**: `/sessions`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "_id": "...",
        "userId": "...",
        "duration": 1500,
        "mode": "focus",
        "tag": "Project X",
        "createdAt": "..."
      },
      ...
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
  ```

### Create Session
Records a completed work or break session.

- **URL**: `/sessions`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "duration": 1500,
    "mode": "focus", // focus | shortBreak | longBreak
    "tag": "Optional Tag"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "session": { ... }
  }
  ```

### Update Session
Updates the tag of an existing session.

- **URL**: `/sessions/[id]`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "tag": "Updated Tag"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "data": { ... }
  }
  ```

---

## 3. Analytics & Stats

### Accumulated Focus Time
Retrieves the total focus minutes for the current day (UTC).

- **URL**: `/accumulated`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  {
    "data": {
      "minutes": 120
    }
  }
  ```

### Analytics Dashboard
Retrieves comprehensive statistics for the analytics dashboard.

- **URL**: `/analytics`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  {
    "data": {
      "todayStats": {
        "minutes": 120,
        "sessionCount": 5,
        "avgMinutes": 24
      },
      "last7Days": [
        { "date": "2026-03-04", "label": "Wed", "minutes": 150, "count": 6 },
        ...
      ],
      "byTag": [
        { "tag": "Project X", "minutes": 300 },
        { "tag": "Untitled", "minutes": 45 }
      ],
      "recentSessions": [ ... ]
    }
  }
  ```

### List Unique Tags
Retrieves all unique tags used by the user, sorted by frequency.

- **URL**: `/tags`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  {
    "tags": [
      { "_id": "Project X", "count": 15 },
      { "_id": "Admin", "count": 4 }
    ]
  }
  ```

---

## 4. Settings

### Update Settings
Updates the user's timer and focus preferences.

- **URL**: `/settings`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "workDuration": 25,
    "shortBreakDuration": 5,
    "longBreakDuration": 15,
    "dailyFocusThreshold": 240
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "data": {
      "workDuration": 25,
      "shortBreakDuration": 5,
      "longBreakDuration": 15,
      "dailyFocusThreshold": 240
    }
  }
  ```

---

## 5. Health

### Health Check
Simple endpoint to verify the API is running.

- **URL**: `/health`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
  }
  ```
