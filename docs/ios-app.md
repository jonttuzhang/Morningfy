# Morningfy iPhone app

The iPhone app bundles the same React screens as the website and connects directly to Supabase. Use the same email account on both. Internet is required to load and save data.

## Build and update

Use Node 22+ and the pnpm version from package.json. Run `pnpm install --frozen-lockfile`, then `pnpm ios:sync`. This builds dist-mobile and copies it into the generated ios project. Re-run after UI and dependency changes. Commit the shared source and iOS project together.

On a Mac with supported Xcode, run `pnpm ios:open`. Select your Apple development team in Signing & Capabilities, connect your iPhone and Run. Bundle ID: com.jonathan.morningfy (change if unavailable). No signing credentials are stored here.

Windows can edit and build the web bundle. Xcode compilation and signing require a Mac or macOS build service. TestFlight requires Apple Developer membership. No paid services have been purchased.

## Account links

Confirmation and password-reset emails open the /email page of the website. Complete them in the browser, then return to the app and sign in. Custom deep links are not configured.

## Verification limits

TypeScript, the mobile bundle, Capacitor iOS generation and asset syncing have been checked on Linux. Xcode compilation, signing, device timers, keyboard and safe areas, external navigation and two-device syncing still require Apple tooling and device testing. No signed IPA or TestFlight upload exists yet.

Only a publishable Supabase key is bundled. RLS restricts data to auth.uid(), with no anonymous table/RPC access. No journal data is included in the binary.

## App icon and launch screen

The icon (`ios/App/App/Assets.xcassets/AppIcon.appiconset`) is a full-bleed 1024×1024 image; iOS rounds the corners itself. The launch screen (`Splash.imageset`) is the app's cream background with the Morningfy sunrise.
