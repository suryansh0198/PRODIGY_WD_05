# 🌦️ CommuteCast

A niche weather application designed to help students and daily commuters make better travel decisions based on current weather conditions.

---

## 🏛️ Architecture & Project Structure

The project has been upgraded into a modular full-stack client-server architecture:

```text
PRODIGY_WD_05/
├── legacy/                  # Original Vanilla HTML/CSS/JS application (preserved)
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── server/                  # Backend Node.js & Express REST API
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   │   └── db.js        # Mongoose connection & status tracker
│   │   ├── models/          # Mongoose data schemas
│   │   │   ├── User.js      # Commuter profile, bcrypt pre-save hook, transport mode
│   │   │   └── SavedLocation.js # Saved commute endpoints with lat/long bounds
│   │   ├── middleware/      # Express middlewares
│   │   │   ├── authMiddleware.js # JWT Bearer token route protection
│   │   │   └── validateAuth.js   # Request body & email regex validation
│   │   ├── controllers/     # Request handlers
│   │   │   └── authController.js # Register, Login, Me, UpdatePreferences
│   │   ├── routes/          # Express route declarations
│   │   │   └── authRoutes.js     # /api/auth endpoints
│   │   ├── app.js           # Express app instance, middleware & routes
│   │   └── server.js        # Server listener & DB bootstrap
│   ├── test/                # Automated native Node.js test suite (15 tests)
│   │   ├── health.test.js   # Health check & route tests
│   │   └── auth.test.js     # User registration, JWT, and bcrypt tests
│   ├── .env.example         # Environment template
│   └── package.json
│
├── client/                  # Frontend React + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── App.jsx          # Root component with Dark/Light mode & status
│   │   ├── main.jsx         # React DOM render root
│   │   └── index.css        # Tailwind directives and glassmorphism utilities
│   ├── index.html           # Vite HTML entry point
│   ├── tailwind.config.js   # Tailwind theme customization
│   ├── vite.config.js       # Vite proxy config (/api -> localhost:5000)
│   └── package.json
│
└── README.md
```

---

## 🚀 How to Run

### Option 1: Running the Full-Stack App

1. **Start MongoDB**:
   * If running as a Windows service: `net start MongoDB`
   * Or run local binary: `mongod --dbpath <data_dir>`
   * Or set a remote MongoDB Atlas URI in `server/.env` (`MONGO_URI=...`).

2. **Start the Express API Server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *The server starts on `http://localhost:5000`.*
   *Health & database status is live at `http://localhost:5000/api/health`.*

3. **Start the React Frontend Client** (in a second terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The client starts on `http://localhost:5173`.*
   *Vite automatically proxies any `/api/*` call to the Express server.*

4. **Run Backend Automated Tests**:
   ```bash
   cd server
   npm test
   ```
   *Runs 15 automated tests covering health checks, user registration, bcrypt password hashing, login, input validation, and JWT route guards.*

---

## 🔐 Authentication Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new commuter account (hashes password with bcryptjs, issues 24h JWT) |
| `POST` | `/api/auth/login` | Public | Authenticate credentials (timing-safe compare, issues 24h JWT) |
| `GET` | `/api/auth/me` | Protected | Returns authenticated commuter profile (requires `Authorization: Bearer <token>`) |
| `PUT` | `/api/auth/preferences` | Protected | Update preferred transport mode (`walking`, `cycling`, `two_wheeler`, `transit`, `driving`) |

---

### Option 2: Running the Original Legacy Static Version

The original vanilla HTML/CSS/JS application is completely preserved:
1. Open [legacy/index.html](file:///d:/programming/Mywork/PRODIGY_WD_05/legacy/index.html) directly in any web browser.
2. Alternatively, checkout the permanent Git snapshot branch:
   ```bash
   git checkout backup-legacy-vanilla
   ```

---

## ✨ Features Roadmap

- 🔍 Search weather by city
- 📍 Get weather using your current location (with reverse-geocoded place names)
- 🌡️ Real-time temperature & "feels like" metrics
- 💨 Wind speed and humidity indicators
- 🌅 Accurate sunrise and sunset timing
- ☔ Umbrella & precipitation warnings
- 🧥 Temperature-calibrated clothing recommendations
- 🚶 Personalized commute score & mode-specific advice (Walk, Bike, Transit, Drive)
- 🍃 Dual Air Quality monitoring (US AQI & European AQI standards)
- 🗺️ Interactive Leaflet map with commute endpoints
- 🌙 True Light & Dark theme toggle
- 📱 Mobile-first, fully responsive design
- 🔐 User authentication with JWT & encrypted passwords (bcrypt)
- 💾 Saved commute routes ("Home", "Work", "Campus")

---

## 🛠️ Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, REST APIs, CORS, dotenv
- **Database & Auth**: MongoDB, Mongoose, JWT (jsonwebtoken), bcryptjs
- **APIs**: Open-Meteo Weather Forecast, Open-Meteo Air Quality, Geocoding API, Reverse Geocoding API, Browser Geolocation API

---

## 👨‍💻 Author

Suryansh
