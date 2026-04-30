# BoothOrganizer Mobile

Native Android/Kotlin mobile client for the Booth Organizer system.

## Features

- Login with username/password plus quick demo login for Booth Manager, Merchant, and General User.
- Registration for General User and Merchant, including citizen ID and seller details for merchants.
- Event browsing, manager event create/edit/delete.
- Booth list, manager booth create/edit/delete, merchant booth reservation.
- Reservations, payment submission by Credit Card, TrueMoney, or Bank Transfer, with bank-transfer slip marker support in the current master branch.
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

## SDK Setup

Create or update `implementations/mobile/local.properties` with your Android SDK path:

```powershell
# Example (Windows)
@"
sdk.dir=C\:\\Users\\User\\AppData\\Local\\Android\\Sdk
"@ | Out-File -FilePath "implementations/mobile/local.properties" -Encoding UTF8
```

The `local.properties` file is local-only and is ignored by git. Do not commit it.

## Build APK

```powershell
cd implementations/mobile
./gradlew.bat --no-daemon assembleDebug
```

The APK outputs to `app/build/outputs/apk/debug/app-debug.apk`.

## Create and Launch Emulator

If no AVD exists yet, create one via command line:

```powershell
# Install a system image (example: API 35)
sdkmanager "system-images;android-35;google_apis;x86_64"

# Create an AVD
echo y | avdmanager create avd -n "BoothOrganizer_API35" -k "system-images;android-35;google_apis;x86_64"

# Start the emulator (runs in background)
emulator -avd BoothOrganizer_API35 -no-boot-anim -no-window &

# Wait for device to be ready
adb wait-for-device

# Install the APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Launch MainActivity
adb shell am start -n "com.kkaovsp.boothorganizer/.MainActivity"
```

To list existing AVDs:

```powershell
avdmanager list avd
```

To stop a running emulator:

```powershell
adb emu kill
```

## Runtime Test Checklist

Manual verification on emulator or device:

- [ ] Home screen loads
- [ ] Login with `boothManager` / `boothManager123`
- [ ] Browse events
- [ ] View booths
- [ ] Make or view reservations
- [ ] Check profile page
- [ ] Generate a report (Reports section)
- [ ] Confirm manager-only navigation items are visible
- [ ] Toggle language (TH/EN)
- [ ] Check for crash: scan logcat for `FATAL EXCEPTION` — none should appear

No screenshots are required for this project delivery.

## Android Test Coverage

Run JVM unit tests and generate the JaCoCo XML report:

```powershell
cd implementations/mobile
./gradlew.bat --no-daemon testDebugUnitTest jacocoTestReport
```

Current local result:

| Check | Result |
|---|---|
| Unit tests | 75 passed, 0 failures, 0 errors |
| JaCoCo line coverage | 100% on pure Kotlin utility code |
| JaCoCo branch coverage | 91.21% on pure Kotlin utility code |
| Report path | `app/build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml` |

The coverage gate focuses on `com.kkaovsp.boothorganizer.util`, which contains pure Kotlin logic that can be tested reliably on the JVM. `MainActivity.kt` and `ApiClient.kt` are verified by APK build, emulator runtime checks, and Edge API smoke tests.
