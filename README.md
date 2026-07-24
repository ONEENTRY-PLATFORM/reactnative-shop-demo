<p align="center">
    <img alt="React Native Template OneEntry" src="https://doc.oneentry.cloud/img/logo.svg" width="180" />
</p>

<h1 align="center">
  OneEntry: Shopping online on React native
</h1>

![expo](https://img.shields.io/badge/%20expo-%20~57.0.8-blue) ![OneEntry](https://img.shields.io/badge/%20oneentry-%201.0.156-blue)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Error handling](#error-handling)
6. [Detailed docs](#detailed-docs)
---
## Project overview

This mobile application📱 showcases the capabilities of the [OneEntry CMS][oneentry] with [React Native][rn]. 
All app data is sourced from OneEntry. You can customize it to meet your requirements by modifying in the CMS. 
In this application, you will find the use of all the functional features of OneEntry, fully available on both Android and iOS.

This app provides a fully immersive shopping experience with all essential e-commerce features. Start by registering for an account, and dive into a comprehensive, flexible catalog of products complete with powerful search options, extensive filtering, and organizational tools. Users can add products to their favorites and cart, with state managed on the server to support consistency across sessions.

| Home                                        | Catalog                                           | Order                                       | Profile                                    | Menu                                 |
|---------------------------------------------|---------------------------------------------------|---------------------------------------------|--------------------------------------------|--------------------------------------|
| ![Home screen](assets/screenshots/home.png) | ![Catalog screen](assets/screenshots/catalog.png) | ![Order page](assets/screenshots/order.png) | ![Profile](assets/screenshots/profile.png) | ![Menu](assets/screenshots/menu.png) |

## Features

All interactions with the OneEntry CMS in this application are powered by the [OneEntry SDK for JavaScript][oneentry-sdk], ensuring seamless integration and efficient data handling. Additionally, most of the app's content is editable directly through the CMS.

This application is built using the [Expo framework][expo], allowing for streamlined development across both iOS and Android platforms. For optimal functionality, the app is configured to work with **Expo Prebuild**. The layout leverages Tailwind CSS (via [NativeWind][nativewind]). Push notifications built in for both platform and can be sent and customized directly from the OneEntry CMS and FCM.

- 📝 **User creation:** Register users via different providers (email, phone) and customize which data to store.
- ✅ **User Activation:** Activate users via code, such as through email verification code.
- 🔐 **Google Sign-In:** One-tap authentication via Google OAuth alongside classic email/password.
- 🔄 **State Management:** Utilize Redux Toolkit for effective state management.
- 🛒 **Efficient Shop Catalog:** Easily manage an unlimited number of products in the catalog.
- 🔍 **Advanced Filtering:** Apply a variety of filters to the product catalog for better organization and search.
- 💡 **Product Recommendations:** Display various selections of products.
- ⭐ **Product Reviews:** Users can leave star ratings, text and photo reviews on products.
- 🖼️ **Block Content:** Using entities of the "Block" type from CMS.
- 📋 **Feedback Forms:** Include customizable feedback forms with captcha protection to prevent spam.
- 💳 **Order Creation and Purchases:** Complete transactions using [Stripe][stripe] for secure, seamless payments.
- 📜 **Order History:** View past purchases and maintain a record of all transactions.
- 📬 **Event Notifications:** Allow users to subscribe to events via email, push notifications, and WebSocket.
- 🚀 **TypeScript Integration:** The project is beginner-friendly and uses lightweight TypeScript for development.
- 🎨 **Tailwind:** User-friendly layout comprehensible to everyone.

## Architecture

| File(s)                                              | Description                                           |
|------------------------------------------------------|-------------------------------------------------------|
| `.env` / `.env.example`                              | OneEntry CMS project configuration                    |
| `/src/api`                                           | OneEntry SDK setup, RTK Query slice and helpers       |
| `/src/components`                                    | Components used **directly on pages**                 |
| &nbsp;&nbsp;├─ `/auth`                               | Components for **auth pages** (login, registration)   |
| &nbsp;&nbsp;├─ `/content`                            | Components for **content pages** (order creation, etc.) |
| &nbsp;&nbsp;│&nbsp;&nbsp;└─ `PrepareOrderScreen`     | Components for the order preparation screen           |
| &nbsp;&nbsp;├─ `/shared`                             | Reusable components used across **multiple pages**    |
| &nbsp;&nbsp;└─ `/ui`                                 | Generic UI elements (buttons, modals, inputs, etc.)   |
| `/src/hooks`                                         | Custom hooks                                          |
| &nbsp;&nbsp;├─ `/auth`                               | Hooks for authentication logic                        |
| &nbsp;&nbsp;├─ `/content`                            | Hooks for content manipulation                        |
| &nbsp;&nbsp;│&nbsp;&nbsp;└─ `PrepareOrderScreen`     | Hooks for order preparation logic                     |
| &nbsp;&nbsp;└─ `/shared`                             | Universal hooks used across the app                   |
| `/src/pages`                                         | Application screens                                   |
| &nbsp;&nbsp;├─ `/auth`                               | Authentication screens (login, registration, etc.)    |
| &nbsp;&nbsp;├─ `/content`                            | Content display/editing screens                       |
| &nbsp;&nbsp;│&nbsp;&nbsp;└─ `PrepareOrderScreen.tsx` | Example page                                          |
| &nbsp;&nbsp;└─ `/shared`                             | Shared page components (headers, footers, layouts)    |
| `/src/navigation`                                    | React Navigation configuration                        |
| `/src/state`                                         | Redux Toolkit slices and core reducers                |
| `/src/types`                                         | TypeScript types                                      |
| `/src/utils`                                         | Helper functions/constants                            |

### Key Principles

#### **Separation of Concerns**
- **Auth-related** and **content-related** logic/components are strictly separated to avoid ambiguity.
- **Pages** (`/src/pages`) act as layout containers with minimal logic, delegating functionality to components.

#### **Component-Driven Design**
- Components are nested under domain-specific folders (e.g., `components/content/PrepareOrderScreen`).
- **Example**:
- PrepareOrderScreen → components/content/PrepareOrderScreen/ItemsInOrderList

#### **Hook Organization**
- **Feature-specific hooks** (e.g., `usePrepareOrderData`) are colocated with their components:
- hooks/content/PrepareOrderScreen/usePrepareOrderData
- **Shared hooks** (universal logic) live in `hooks/shared/`.

#### **Shared Resources**
- Reusable components/hooks are isolated in `/shared` folders (e.g., `components/shared/Rating`).

## Configuration

### Step 1. Set up the project

Copy the environment template and fill in your OneEntry project credentials:

```bash
cp .env.example .env
```

Then edit `.env` and set `PROJECT_URL` and `APP_TOKEN` to values from your OneEntry project. The real `.env` is git-ignored so your token never gets committed.

Configure push notifications **and Google Sign-In**. Both features rely on the Firebase config files:

- `google-services.json` — Android
- `GoogleService-Info.plist` — iOS (used by FCM **and** by Google Sign-In)

Add both files to the project root. Detailed instructions for the Push Notifications setup are available in our [Documentation][doc-push].

Configure Google Sign-In:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create OAuth 2.0 Client IDs of types **Web** and **iOS** for your project.
2. Open `App.tsx` and replace the empty `webClientId` and `iosClientId` in the `GoogleSignin.configure({...})` call with your own values.
3. Open `src/components/auth/WelcomeScreen/useGoogleSignIn.ts` and replace the empty `client_id`, `client_secret` and `redirect_uri` in the `oauth('google_ios', {...})` call with values from your Google Cloud project. **Never commit real client secrets to a public repo.**
4. Open `app.json` and set the `iosUrlScheme` under the `@react-native-google-signin/google-signin` plugin to the reversed iOS OAuth client ID (e.g. `com.googleusercontent.apps.<YOUR_IOS_CLIENT_ID>`).

Finally, fill in the empty fields in `app.json` — `expo.name`, `expo.slug`, `ios.bundleIdentifier`, `android.package`, `ios.appleTeamId`, and `ios.associatedDomains` — with values that match your own Apple Team ID and app identifiers.

### Step 2. Install dependencies

Install project dependencies using **yarn**.

```bash
yarn install
```

To verify your project is set up correctly, use the following Expo command:

```bash
npx expo-doctor
```

This will identify any configuration issues and ensure your environment is properly configured for development.

To run the app with Expo Prebuild, use the following commands:

> **Note**: This app requires native dependencies and will not work with Expo Go.

**Android:**

```bash
npx expo run:android
```

**iOS:**

```bash
npx expo run:ios
```

Running the app with Expo Prebuild will create dedicated android and ios folders in your project for native code.

If you prefer to avoid managing native code, consider using [Expo Application Services (EAS)][eas], which allows for custom builds without needing direct access to these native folders.

After completing all these steps, your app should run correctly. If you encounter any issues, we've created a guide to help you troubleshoot common errors.

## Error handling

First, try running doctor with the following command to check for any issues:

```bash
npx expo-doctor
```

If you encounter **errors with Firebase** during an Android build, try updating the `<meta-data>` tags in your [AndroidManifest.xml](./android/app/src/main/AndroidManifest.xml) as follows:

Replace:

```bash
<meta-data android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="default"/>
<meta-data android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/notification_icon_color"/>
<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/notification_icon"/>
```

with:

```bash
<meta-data tools:replace="android:value" android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="default"/>
<meta-data tools:replace="android:resource" android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/notification_icon_color"/>
<meta-data tools:replace="android:resource" android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/notification_icon"/>
```

For iOS, ensure you are using the latest version of Xcode and iOS.

## Detailed docs!

This is the central hub for all documentation. Below are links to specific sections.

#### Authorization
- [Authorization Documentation](./documentations/Authorization.md)
- Covers login, sign-up, Google Sign-In (OAuth), token management, device fingerprinting, and account activation.

#### Orders
- [Orders Documentation](./documentations/OrderFlow.md)
- Details order creation, tracking, and transaction handling.

#### Events
- [Events Documentation](./documentations/Events.md)
- Explains real-time updates and event triggers.

#### State
- [State Documentation](./documentations/UserState.md)
- Describes user state management and synchronization.

---

In case of any issues or questions, you can post:
[GitHub discussion for React Native][discussion]

[oneentry]: https://oneentry.cloud/
[rn]: https://reactnative.dev
[oneentry-sdk]: https://www.npmjs.com/package/oneentry
[discussion]: https://oneentry.cloud/
[expo]: https://expo.dev/
[nativewind]: https://www.nativewind.dev/
[stripe]: https://stripe.com/
[eas]: https://expo.dev/eas
[doc]: https://doc.oneentry.cloud/
[doc-push]: https://doc.oneentry.cloud/docs/events/introduction
