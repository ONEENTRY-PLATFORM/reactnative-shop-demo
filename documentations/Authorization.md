[Back to README](../README.md)
# Authorization Documentation

Authorization is a critical component of the system. Without it, many features are inaccessible because they require a **JWT session token**.

---

## How It Works

1. **JWT Tokens**
    - **`accessToken`**:
        - Used for API requests.
        - Short-lived and refreshed automatically by the SDK.
    - **`refreshToken`**:
        - Persisted in `AsyncStorage` under the `refresh-token` key.
        - The SDK writes it there via the `saveFunction` callback whenever it obtains a new token pair.
        - Also used to restore the session on the next app launch.

2. **SDK Handles Tokens**
    - Most token management is handled by the **OneEntry SDK**.
    - The SDK is initialised once in [defineApi.ts] via `defineOneEntry(...)`. The `auth.saveFunction` callback receives fresh refresh tokens after every successful `auth()` / silent refresh and stores them in `AsyncStorage` — application code no longer needs to persist tokens manually after login.
    - On sign-in, `defineApi.AuthProvider.auth(provider, data)` returns `{ accessToken, refreshToken, ... }`; both tokens are placed onto the current SDK instance automatically, and `refreshToken` is persisted through `saveFunction`. `signInUser` only needs to remember the provider marker (`AsyncStorage.setItem('provider-marker', provider)`) so the SDK can perform a proactive refresh at the start of the next session.

3. **Device fingerprint (`deviceMetadata`)**
    - Refresh tokens are bound to a device fingerprint. The SDK generates one on first use.
    - [initDeviceMetadata()][defineApi] loads a stable fingerprint from `AsyncStorage` (key `oneentry-device-metadata`) at app start, or persists the freshly generated one if none exists, and pins it onto the current SDK instance.
    - **This must run before `validateToken()`**, otherwise a rebuilt SDK instance will use a fresh fingerprint and the saved refresh token will be rejected. In [AuthContext] this is done inside `onInit()`, immediately before `reDefine(...)`.

---

## [AuthContext]

All authorization logic — sign-in, sign-up, sign-out, session validation, push-token registration, and error handling — lives in the **[AuthContext]**. It is a React context that wraps the whole application in `App.tsx`.

- **Lifecycle**
    1. On mount, `onInit()` runs: it loads `deviceMetadata`, reads the saved `refresh-token` and `provider-marker` from `AsyncStorage`, rebuilds the SDK instance via `reDefine(...)`, and calls `validateToken()`.
    2. `validateToken()` triggers the RTK Query `getMe` endpoint. On success it seeds Redux with the server-side `user.state` (favourites / cart) via `initializeUserState`.
    3. On failure it clears the stored tokens, resets Redux user state and lets the UI redirect to the auth flow.

- **Google Sign-In**
    - The [useGoogleSignIn][useGoogleSignIn] hook handles the OAuth-based flow. Unlike `auth()`, `oauth('google_ios', ...)` does **not** invoke `saveFunction`, so the hook explicitly stores the refresh token, sets both tokens on the SDK instance via `setAccessToken` / `setRefreshToken`, and then calls `validateToken()` to load the user.

[AuthContext]: ../src/state/contexts/AuthContext.tsx
[defineApi]: ../src/api/api/defineApi.ts
[useGoogleSignIn]: ../src/components/auth/WelcomeScreen/useGoogleSignIn.ts
