# ChurchLink SecureCare App

Expo + React Native + TypeScript starter for the ChurchLink and SecureCare stack.

## Stack

- Expo
- React Native
- TypeScript
- NativeWind
- Supabase Auth and Database

## Project Structure

```text
.
|-- App.tsx
|-- src
|   |-- features
|   |   `-- schedule
|   |-- lib
|   |-- types
|   `-- utils
`-- supabase
    |-- functions
    `-- migrations
```

## Setup

1. Copy `.env.example` to `.env`
2. Add `EXPO_PUBLIC_SUPABASE_URL`
3. Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Install dependencies with `npm install`
5. Start the app with `npm start`

## Current Status

- Expo TypeScript scaffold created
- NativeWind configured
- Supabase client configured
- Monthly Leader Dashboard scaffolded
- Initial Supabase schema and scheduling Edge Function added
