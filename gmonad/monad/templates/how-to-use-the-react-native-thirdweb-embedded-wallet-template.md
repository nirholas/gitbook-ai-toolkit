# How to use the React Native Thirdweb embedded wallet template

> Source: https://docs.monad.xyz/templates/react-native-thirdweb-embedded-wallet

## Documentation

On this page

This guide walks you through using the embedded wallet template which uses Expo, React Native, and Thirdweb embedded wallet to build a mobile app on Monad.
Start developing by editing the files inside the app directory. This project uses file-based routing.
Prerequisites​

Node.js
Yarn or NPM
a thirdweb account

For Android
JDK 17 (Java Development Kit version 17)

Set the JAVA_HOME environment variable to point to your JDK 17 installation
Example: export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-17.jdk/Contents/Home


Android Studio (API version 35 and above)

See this guide to set up Android Studio for Expo
Configure Gradle JDK in Android Studio:

Open Android Studio Settings/Preferences
Navigate to Build, Execution, Deployment → Build Tools → Gradle
Set Gradle JDK to JDK 17 (e.g., JAVA_HOME 17.0.13 - aarch64 /Library/Java/JavaVirtualMachines/microsoft-17.jdk/Contents/Home)





For iOS
Xcode (Xcode 16 requires OpenSSL version 3.3.2000)

See this guide to set up iOS Simulator for Expo



Get started​
Install dependencies​
yarn install
Set up the environment variables​
Create a copy of .env.example:
cp .env.example .env
Add your thirdweb client ID to the .env file:
EXPO_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
How to get EXPO_PUBLIC_THIRDWEB_CLIENT_ID
Navigate to thirdweb dashboard
Sign in or create a new account
Create a new project

Copy your Client ID from the project settings; Client ID is the value for EXPO_PUBLIC_THIRDWEB_CLIENT_ID.

Start the app​
noteThis template comes with a simple transfer example screen, which you can edit by editing the index.tsx file in the app folder.
Prebuild for native modules​
noteThe thirdweb SDK uses native modules, which means it cannot run on Expo Go. You must build the iOS and Android apps to link the native modules.npx expo prebuild
For iOS:
yarn ios
For Android:
yarn android
Folder structure of the template​
expo-thirdweb-example/  ├── app/                                   # Expo router entrypoint   │   ├── +html.tsx                          # Web HTML configuration  │   ├── +native-intent.tsx                 # Deep link handling  │   ├── +not-found.tsx                     # 404 page  │   ├── _layout.tsx                        # Root layout with ThirdwebProvider  │   └── index.tsx                          # Main screen  ├── assets/  │   ├── fonts/                             # Custom fonts  │   └── images/                            # App images and icons  │       ├── adaptive-icon.png  │       ├── icon.png  │       ├── monad-logo.png  │       └── splash.png  ├── components/                            # Reusable UI components  │   ├── ThemedButton.tsx                   # Themed button component  │   ├── ThemedText.tsx                     # Themed text component  │   ├── ThemedView.tsx                     # Themed view component  │   ├── SocialProfileCard.tsx              # Social profile display  │   └── navigation/  │       └── TabBarIcon.tsx                 # Tab bar icons  ├── constants/  │   ├── Colors.ts                          # App color scheme  │   └── thirdweb.ts                        # Blockchain configuration  ├── hooks/                                 # Custom React hooks  │   ├── useColorScheme.ts                  # Theme detection  │   └── useThemeColor.ts                   # Theme color utilities  ├── app.json                               # Expo app configuration  ├── babel.config.js  ├── metro.config.js                        # Metro bundler config  ├── package.json  ├── tsconfig.json  └── yarn.lock
Customizing your app​
Modifying the app name​
Edit the name property in the app.json file:
{   "expo": {      "name": "your-app-name", // ← Edit this      ...   }}  
Modifying the app icon​
You can edit the app icon by replacing the assets/images/icon.png file.
Recommended App Icon size is 1024x1024.
If you name the icon file something else, edit the icon property in app.json accordingly:
{   "expo": {      "name": "your-app-name",      ...      "icon": "./assets/images/icon.png", // ← Change this      ...   }}
Modifying the splash screen​
Edit the splash object in app.json to modify the splash screen:
{   "expo": {      "name": "your-app-name",      ...      "splash": { // ← Edit this object         "image": "./assets/images/splash.png",         "backgroundColor": "#ffffff"      }   }  }
Modifying the deep linking scheme​
Edit the scheme property in app.json file for your custom deep linking scheme:
{  "expo": {    ...    "scheme": "your-app-scheme",    ...  }}
For example, if you set this to mywalletapp, then mywalletapp:// URLs would open your app when tapped.
This is a build-time configuration and has no effect in Expo Go.
Modifying the package/bundleIdentifier​
When publishing to the app store, you need a unique package/bundleIdentifier. Change it in app.json:
{  "expo": {    "name": "your-app-name",    ...    "ios": {      "bundleIdentifier": "com.yourcompany.yourapp", // ← Edit this      ...    },    "android": {      ...      "package": "com.yourcompany.yourapp" // ← Edit this    },  }}
notethirdweb Bundle ID Configuration: Your bundleIdentifier and package must match the Bundle ID Restrictions configured in your thirdweb project settings.
Go to the thirdweb dashboard
Select your project
Navigate to Settings → Bundle ID Restrictions
Add your iOS bundleIdentifier and Android package to the allowed bundle IDs
This ensures your app can properly authenticate with thirdweb services.
Learn More​
To learn more about developing your project with Expo, thirdweb, and Monad, look at the following resources:

Expo: documentation | guides | tutorial
thirdweb: documentation | templates | YouTube
Monad: supported tooling and infra

Join the Community​
Chat with fellow Monad developers and ask questions in Monad Developer Discord

## Code Examples

```prism
yarn install
```

```prism
cp .env.example .env
```

```prism
EXPO_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
```

```prism
npx expo prebuild
```

```prism
yarn ios
```

```prism
yarn android
```

```prism
expo-thirdweb-example/  ├── app/                                   # Expo router entrypoint   │   ├── +html.tsx                          # Web HTML configuration  │   ├── +native-intent.tsx                 # Deep link handling  │   ├── +not-found.tsx                     # 404 page  │   ├── _layout.tsx                        # Root layout with ThirdwebProvider  │   └── index.tsx                          # Main screen  ├── assets/  │   ├── fonts/                             # Custom fonts  │   └── images/                            # App images and icons  │       ├── adaptive-icon.png  │       ├── icon.png  │       ├── monad-logo.png  │       └── splash.png  ├── components/                            # Reusable UI components  │   ├── ThemedButton.tsx                   # Themed button component  │   ├── ThemedText.tsx                     # Themed text component  │   ├── ThemedView.tsx                     # Themed view component  │   ├── SocialProfileCard.tsx              # Social profile display  │   └── navigation/  │       └── TabBarIcon.tsx                 # Tab bar icons  ├── constants/  │   ├── Colors.ts                          # App color scheme  │   └── thirdweb.ts                        # Blockchain configuration  ├── hooks/                                 # Custom React hooks  │   ├── useColorScheme.ts                  # Theme detection  │   └── useThemeColor.ts                   # Theme color utilities  ├── app.json                               # Expo app configuration  ├── babel.config.js  ├── metro.config.js                        # Metro bundler config  ├── package.json  ├── tsconfig.json  └── yarn.lock
```

```prism
{   "expo": {      "name": "your-app-name", // ← Edit this      ...   }}
```

```prism
{   "expo": {      "name": "your-app-name",      ...      "icon": "./assets/images/icon.png", // ← Change this      ...   }}
```

```prism
{   "expo": {      "name": "your-app-name",      ...      "splash": { // ← Edit this object         "image": "./assets/images/splash.png",         "backgroundColor": "#ffffff"      }   }  }
```

```prism
{  "expo": {    ...    "scheme": "your-app-scheme",    ...  }}
```

```prism
{  "expo": {    "name": "your-app-name",    ...    "ios": {      "bundleIdentifier": "com.yourcompany.yourapp", // ← Edit this      ...    },    "android": {      ...      "package": "com.yourcompany.yourapp" // ← Edit this    },  }}
```

