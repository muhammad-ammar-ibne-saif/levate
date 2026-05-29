# Team L-Evate — React Native App

Built with **Expo + NativeWind (Tailwind CSS) + Zustand + Express + MongoDB**

---

## Project Structure

```
team-levate/
├── app/                     # Expo Router screens
│   ├── _layout.tsx          # Root layout, font loading, push notification setup
│   ├── index.tsx            # Auth guard redirect
│   ├── auth/
│   │   ├── onboard.tsx      # 3-slide onboarding carousel
│   │   ├── welcome.tsx      # Welcome / social login
│   │   ├── login.tsx        # Login form
│   │   └── signup.tsx       # Signup form (dynamic name → home greeting)
│   └── app/
│       ├── (tabs)/
│       │   ├── home.tsx         # Home dashboard (dynamic greeting + name)
│       │   ├── goals.tsx        # Goal selector
│       │   ├── notifications.tsx # Real notifications from backend
│       │   ├── settings.tsx     # Settings (NO API URL exposed)
│       │   ├── profile.tsx      # Editable profile
│       │   └── progress.tsx     # Progress ring + chart + calendar
│       ├── workout/
│       │   ├── active.tsx       # Live workout timer (SVG ring)
│       │   └── complete.tsx     # Workout summary
│       ├── settings/
│       │   └── change-password.tsx
│       ├── program.tsx          # Program / week view
│       └── chat.tsx             # AI chatbot screen
├── components/ui/
│   ├── Button.tsx           # Animated primary/outline/ghost button
│   ├── Input.tsx            # Styled text input with error state
│   ├── TimerRing.tsx        # SVG circular countdown timer
│   ├── ProgressRing.tsx     # SVG progress circle (78%)
│   └── WorkoutCard.tsx      # Lift/Run/Race card component
├── store/
│   ├── auth.ts              # Zustand auth store (SecureStore persistence)
│   ├── workout.ts           # Workout timer & session state
│   └── chat.ts              # Chat message state
├── hooks/
│   ├── useWorkoutTimer.ts   # setInterval timer hook
│   └── useGreeting.ts       # Time-based greeting
├── lib/
│   ├── api.ts               # Axios instance (API URL baked in, never shown to user)
│   └notifications.ts        # Expo push notification setup
└── server/                  # Express backend
    ├── index.js
    ├── .env.example         # ← copy to .env and fill in values
    ├── middleware/auth.js
    ├── models/
    │   ├── User.js
    │   ├── WorkoutSession.js
    │   └── Notification.js
    └── routes/
        ├── auth.js          # Register, login, change-password
        ├── user.js          # Profile CRUD
        ├── workout.js       # Session save + history + progress
        ├── chat.js          # Anthropic Claude API integration
        └── notifications.js # Push token, inbox, mark read
```

---

## Setup — Frontend (React Native)

```bash
cd team-levate
npm install

# Before running, set your API URL in lib/api.ts:
# const API_BASE_URL = "https://your-api.com";

npx expo start
```

Requires **Expo Go** app or a physical iOS/Android device.  
For iOS TestFlight: `eas build --platform ios`

---

## Setup — Backend (Express)

```bash
cd server
npm install

# Copy the env template
cp .env.example .env

# Fill in .env:
# MONGODB_URI = your MongoDB Atlas connection string
# JWT_SECRET  = a long random secret
# ANTHROPIC_API_KEY = your Anthropic API key

npm run dev   # development
npm start     # production
```

Deploy to **Railway** or **Render** (free tier available).  
Set environment variables in their dashboard — never in code.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login → returns JWT |
| POST | `/api/auth/change-password` | ✅ | Update password |
| GET | `/api/user/me` | ✅ | Get current user |
| PUT | `/api/user/profile` | ✅ | Update profile |
| POST | `/api/workouts/complete` | ✅ | Save completed session |
| GET | `/api/workouts/history` | ✅ | Workout history |
| GET | `/api/workouts/progress` | ✅ | Weekly aggregates for chart |
| POST | `/api/chat` | ✅ | AI chatbot (Claude API) |
| POST | `/api/notifications/register-token` | ✅ | Save push token |
| GET | `/api/notifications` | ✅ | Notification inbox |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all read |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark one read |

---

## Push Notifications — How They Work

1. On login → `registerForPushNotificationsAsync()` gets device token
2. Token sent to `POST /api/notifications/register-token` → stored in MongoDB
3. Your backend scheduler (BullMQ cron) calls `sendPushToUser(userId, title, body)`
4. That function: saves to DB inbox + POSTs to Expo Push Service
5. Expo delivers to device via Apple APNs / Google FCM
6. App displays it via `expo-notifications` handler in `_layout.tsx`

---

## Security Notes

- API URL is in `lib/api.ts` — change before deploying. Never shown to users.
- MongoDB URI is server-side only (`.env`). Never in frontend code.
- JWT stored in iOS Keychain via `expo-secure-store`. Never in AsyncStorage.
- Passwords hashed with bcrypt (12 rounds) before saving to MongoDB.
- All auth routes rate-limited.
