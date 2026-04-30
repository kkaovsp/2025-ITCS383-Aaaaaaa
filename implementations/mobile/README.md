# BoothOrganizer Mobile

Native Android/Kotlin mobile client for the Booth Organizer system.

## Features

- Login with username/password plus quick demo login for Booth Manager, Merchant, and General User.
- Registration for General User and Merchant, including citizen ID and seller details for merchants.
- Event browsing, manager event create/edit/delete.
- Booth list, manager booth create/edit/delete, merchant booth reservation.
- Reservations, payment submission by Credit Card, TrueMoney, or Bank Transfer, and bank slip upload.
- Booth Manager merchant approval, payment approval, and event reports with CSV sharing.
- Profile editing, merchant seller info editing, notifications, and TH/EN language toggle.
- Web color theme matched to the React app: primary `#4f46e5`, secondary `#06b6d4`, light background `#f8fafc`.

## Backend

The app uses the same deployed Supabase Edge Function API as the web app:

```text
https://uaoufhdysqcivheauwyf.supabase.co/functions/v1/api
```

## Demo Accounts

| Role | Username | Password |
|---|---|---|
| Booth Manager | `boothManager` | `boothManager123` |
| Merchant | `demoMerchant` | `merchant123` |
| General User | `demoUser` | `user123` |

## Run

Open this folder in Android Studio, let Gradle sync, then run the `app` configuration on an emulator or Android device.
