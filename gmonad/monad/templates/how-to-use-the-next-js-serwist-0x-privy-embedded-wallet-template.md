# How to use the Next.js Serwist 0x Privy embedded wallet template

> Source: https://docs.monad.xyz/templates/next-serwist-0x-privy-embedded-wallet

## Documentation

On this page

This guide walks you through using the template which uses Next.js, Serwist (offline capabilities), 0x (token trading), and Privy embedded wallet (authentication) to build a Progressive Web Application (PWA) on Monad.
Prerequisites​

Node.js (v18 or higher)
a Privy account
a 0x account

Setting up Privy

Create your Privy app:

Select "Web" as the platform. Then, click "Create app".

On the next screen, make sure to save your App ID.


Set up login methods:



Disable External Wallets:



Scroll down and enable "Automatically create embedded wallets on login" and select "EVM Wallets":


tipYou can enable "Test Accounts" for testing purposes.
Setting up 0x

Create your 0x account:
Go to 0x dashboard and create your account.
On the next screen, make sure to save your API Key.


Get your API Key:
To get your API key, create an app and then go to API Keys.
Copy the API key and save it for later.


Setup​


Clone the repository:
git clone https://github.com/monad-developers/next-serwist-privy-0x.git


cd into the project directory:
cd next-serwist-privy-0x


Install dependencies:
npm install


Create a .env.local file in the root directory:
cp .env.example .env.local


Start adding your environment variables to the .env.local file:
# PrivyNEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_hereNEXT_PUBLIC_PRIVY_CLIENT_ID= # optional, you can leave this empty
# VAPID Keys for push notificationsNEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_hereVAPID_PRIVATE_KEY=your_vapid_private_key_here
# 0x ConfigurationZEROX_API_KEY=your_0x_api_key_here
If you lost your Privy App ID, you can find it in the Privy dashboard.


Generate VAPID keys for web push notifications:
npx web-push generate-vapid-keys --json
Copy the generated keys to your .env.local file (replace the placeholder values from step 5).


Running the Application:
Development Mode:
npm run dev
The application will be available at http://localhost:3000.
Production Mode:
For full PWA functionality (including install prompts):
npm run build && npm run start


Folder structure of the template​
next-serwist-privy-0x/├── app/│   ├── components/          # React components│   │   ├── 0x/             # 0x Protocol integration│   │   ├── InstallPWA.tsx  # PWA install prompt│   │   ├── SwapComponent.tsx # Token swap interface│   │   └── ...│   ├── api/                # API routes│   │   ├── price/          # Token price endpoints│   │   └── quote/          # Swap quote endpoints│   ├── ~offline/           # Offline page│   └── ...├── public/                 # Static assets├── utils/                  # Utility functions└── ...
Changing the app name​

Edit public/manifest.json:

Change the name and short_name fields


Run npm run build to update the app

Notification Setup​
Enable notifications for the best experience!To receive push notifications from this app, you need to enable notifications in your browser and/or system settings:
Browser Settings​
Chrome/Edge
Click the lock icon 🔒 in the address bar
Set "Notifications" to "Allow"
Or go to Settings → Privacy and security → Site Settings → Notifications

Firefox
Click the shield icon 🛡️ in the address bar
Turn off "Enhanced Tracking Protection" for this site (if needed)
Allow notifications when prompted
Or go to Settings → Privacy & Security → Permissions → Notifications

Safari
Go to Safari → Settings → Websites → Notifications
Find your site and set it to "Allow"

System Settings​
macOS
System Preferences → Notifications & Focus
Find your browser and ensure notifications are enabled
Check "Allow notifications from websites" in browser settings

Windows
Settings → System → Notifications & actions
Ensure your browser can send notifications
Check browser notification settings

iOS
Settings → Notifications → [Your Browser]
Enable "Allow Notifications"
Also enable in browser settings

Android
Settings → Apps → [Your Browser] → Notifications
Enable notifications
Check browser notification permissions

Backend Integration Required​
The SendNotification.tsx component is sample codeThis requires backend implementation:
Save subscription data when users subscribe (see TODO comments in code)
Delete subscription data when users unsubscribe
Implement /notification endpoint to send actual push notifications
Use web-push library or similar for server-side notification delivery

Customizing Notification Content​
To customize your push notification content, edit app/notification/route.ts and modify the title, message, icon, and other properties in the sendNotification call.
Modifying the App Icon & Splash Screen​
App Icons​
Replace the icon files in the public/icons/ directory with your custom icons:

icon-512x512.png - Main app icon (512×512px)
android-chrome-192x192.png - Android icon (192×192px)
apple-touch-icon.png - iOS home screen icon (180×180px)

Also update the favicon:

public/favicon.ico - Browser favicon
app/favicon.ico - Next.js app favicon

Splash Screen​
Splash screens are automatically generated from your app icon and theme colors defined in manifest.json. To customize:

Update the theme_color and background_color in manifest.json
Ensure your main icon (icon-512x512.png) represents your brand
Run npm run build to apply changes

tipUse tools like PWA Asset Generator to create all required icon sizes from a single source image.
Adding More Tokens​
The template currently supports WMON and USDT tokens. To add more tokens for trading, follow these steps:
1. Find Token Information​
Before adding a token, you'll need the following information:

Contract Address: The token's smart contract address
Symbol: The token's symbol (e.g., "ETH", "USDC")
Name: The full name of the token
Decimals: Number of decimal places (usually 18 for most ERC-20 tokens)
Logo URI: URL to the token's logo image

You can find this information on the DEXes that 0x Swap API supports.
To get the DEXes that 0x Swap API supports, you can query the sources endpoint. For reference, see getSources page.
2. Update Token Constants​
Edit utils/constants.ts and add your new token to three places:
A. Add to MONAD_TESTNET_TOKENS array​
constants.tsutilsexport const MONAD_TESTNET_TOKENS: Token[] = [  // ... existing tokens ...  {    chainId: 1,    name: "Your Token Name",    symbol: "YOUR_SYMBOL",    decimals: 18,    address: "0xYourTokenContractAddress",    logoURI: "https://your-token-logo-url.png",  },];
B. Add to MONAD_TESTNET_TOKENS_BY_SYMBOL record​
constants.tsutilsexport const MONAD_TESTNET_TOKENS_BY_SYMBOL: Record<string, Token> = {  // ... existing tokens ...  your_symbol: {    // lowercase key    chainId: 1,    name: "Your Token Name",    symbol: "YOUR_SYMBOL",    decimals: 18,    address: "0xYourTokenContractAddress",    logoURI: "https://your-token-logo-url.png",  },};
C. Add to MONAD_TESTNET_TOKENS_BY_ADDRESS record​
constants.tsutilsexport const MONAD_TESTNET_TOKENS_BY_ADDRESS: Record<string, Token> = {  // ... existing tokens ...  "0xyourtokencontractaddress": {    // lowercase address    chainId: 1,    name: "Your Token Name",    symbol: "YOUR_SYMBOL",    decimals: 18,    address: "0xYourTokenContractAddress", // original case    logoURI: "https://your-token-logo-url.png",  },};
3. Example: Adding shMON​
Here's a complete example of adding USDC:
constants.tsutils// In MONAD_TESTNET_TOKENS array{  chainId: 1,  name: "shMonad",  symbol: "shMON",  decimals: 18,  address: "0x3a98250F98Dd388C211206983453837C8365BDc1",  logoURI: "put_your_logo_url_here_or_use_the_default_logo",},
// In MONAD_TESTNET_TOKENS_BY_SYMBOL recordshmon: {  chainId: 1,  name: "shMonad",  symbol: "shMON",  decimals: 18,  address: "0x3a98250F98Dd388C211206983453837C8365BDc1",  logoURI: "put_your_logo_url_here_or_use_the_default_logo",},
// In MONAD_TESTNET_TOKENS_BY_ADDRESS record"0x3a98250F98Dd388C211206983453837C8365BDc1": {  chainId: 1,  name: "shMonad",  symbol: "shMON",  decimals: 18,  address: "0x3a98250F98Dd388C211206983453837C8365BDc1",  logoURI: "put_your_logo_url_here_or_use_the_default_logo",},
4. Important Notes​

Decimals: Most tokens use 18 decimals, but some (like USDT, USDC) use 6
Logo URLs: Use permanent, reliable image URLs. Consider hosting logos yourself for better reliability
Testing: Test thoroughly with small amounts before using in production
0x Protocol Support: Ensure the token is supported by 0x Protocol for your target network

5. Rebuild and Test​
After adding tokens:
npm run buildnpm run start
The new tokens will automatically appear in the token selector dropdowns in the swap interface.
Configuring Slippage Tolerance​
Slippage tolerance determines how much price movement you're willing to accept during a trade. The app currently uses the 0x API's default slippage tolerance of 1% (100 basis points).
Adding Slippage Configuration​
1. Update Constants​
Add slippage options to utils/constants.ts:
constants.tsutilsexport const DEFAULT_SLIPPAGE_BPS = 100; // 1% in basis points
export const SLIPPAGE_OPTIONS = [  { label: "0.1%", value: 10 },  { label: "0.5%", value: 50 },  { label: "1%", value: 100 },  { label: "2%", value: 200 },  { label: "3%", value: 300 },];
2. Update API Routes​
Add slippageBps parameter to both API routes:
app/api/price/route.ts and app/api/quote/route.ts:
route.tsapp > api > priceexport async function GET(request: NextRequest) {  const searchParams = request.nextUrl.searchParams;
  // Add default slippage if not provided  if (!searchParams.has("slippageBps")) {    searchParams.set("slippageBps", "100"); // 1% default  }
  const res = await fetch(    `https://api.0x.org/swap/permit2/price?${searchParams}`, // or /quote    {      headers: {        "0x-api-key": process.env.ZEROX_API_KEY as string,        "0x-version": "v2",      },    }  );  const data = await res.json();  return Response.json(data);}
3. Add Slippage to Components​
Update the price/quote requests to include slippageBps parameter:
In app/components/0x/price.tsx:
price.tsxapp > components > 0xconst [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
// Add slippageBps to your API request parametersconst priceRequest = useMemo(  () => ({    chainId,    sellToken: sellTokenObject.address,    buyToken: buyTokenObject.address,    sellAmount: parsedSellAmount,    taker,    slippageBps, // Add this    // ... other params  }),  [...dependencies, slippageBps]);
Slippage Parameter Details​

Range: 0-10000 basis points (0%-100%)
Default: 100 (1%)
Format: Basis points (100 bps = 1%)

Reference: 0x API Documentation
Deploying to Vercel​
Using Vercel Dashboard​


Connect your repository:

Push your code to GitHub
Visit vercel.com and import your repository



Configure environment variables:

In your Vercel project dashboard, go to Settings → Environment Variables
Add the same variables from your .env.local:
NEXT_PUBLIC_PRIVY_APP_IDNEXT_PUBLIC_PRIVY_CLIENT_IDNEXT_PUBLIC_VAPID_PUBLIC_KEYVAPID_PRIVATE_KEYZEROX_API_KEY




Deploy: Vercel will automatically build and deploy your app


Update Privy settings: In your Privy dashboard, add your Vercel domain (e.g., your-app.vercel.app) to the allowed origins


tipPWA features (install prompts, offline support, push notifications) work automatically on HTTPS domains like Vercel deployments.
Using Vercel CLI​
Alternatively, deploy using the Vercel CLI:


Install Vercel CLI:
npm i -g vercel


Login to Vercel:
vercel login


Deploy:
vercel
Follow the prompts to configure your project.


Add environment variables:
vercel env add NEXT_PUBLIC_PRIVY_APP_IDvercel env add NEXT_PUBLIC_PRIVY_CLIENT_IDvercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEYvercel env add VAPID_PRIVATE_KEYvercel env add ZEROX_API_KEY
Or you can go to the Vercel dashboard and add the environment variables there.


Redeploy with environment variables:
vercel --prod


Learn more​

Serwist: docs | guides
Privy: create a wallet | send a transaction | sign a transaction
0x: docs | guides
Monad: supported tooling and infra

## Code Examples

```prism
git clone https://github.com/monad-developers/next-serwist-privy-0x.git
```

```prism
cd next-serwist-privy-0x
```

```prism
npm install
```

```prism
cp .env.example .env.local
```

```prism
# PrivyNEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_hereNEXT_PUBLIC_PRIVY_CLIENT_ID= # optional, you can leave this empty
# VAPID Keys for push notificationsNEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_hereVAPID_PRIVATE_KEY=your_vapid_private_key_here
# 0x ConfigurationZEROX_API_KEY=your_0x_api_key_here
```

```prism
npx web-push generate-vapid-keys --json
```

```prism
npm run dev
```

```prism
npm run build && npm run start
```

```prism
next-serwist-privy-0x/├── app/│   ├── components/          # React components│   │   ├── 0x/             # 0x Protocol integration│   │   ├── InstallPWA.tsx  # PWA install prompt│   │   ├── SwapComponent.tsx # Token swap interface│   │   └── ...│   ├── api/                # API routes│   │   ├── price/          # Token price endpoints│   │   └── quote/          # Swap quote endpoints│   ├── ~offline/           # Offline page│   └── ...├── public/                 # Static assets├── utils/                  # Utility functions└── ...
```

```prism
export const MONAD_TESTNET_TOKENS: Token[] = [  // ... existing tokens ...  {    chainId: 1,    name: "Your Token Name",    symbol: "YOUR_SYMBOL",    decimals: 18,    address: "0xYourTokenContractAddress",    logoURI: "https://your-token-logo-url.png",  },];
```

```prism
export const MONAD_TESTNET_TOKENS_BY_SYMBOL: Record<string, Token> = {  // ... existing tokens ...  your_symbol: {    // lowercase key    chainId: 1,    name: "Your Token Name",    symbol: "YOUR_SYMBOL",    decimals: 18,    address: "0xYourTokenContractAddress",    logoURI: "https://your-token-logo-url.png",  },};
```

```prism
export const MONAD_TESTNET_TOKENS_BY_ADDRESS: Record<string, Token> = {  // ... existing tokens ...  "0xyourtokencontractaddress": {    // lowercase address    chainId: 1,    name: "Your Token Name",    symbol: "YOUR_SYMBOL",    decimals: 18,    address: "0xYourTokenContractAddress", // original case    logoURI: "https://your-token-logo-url.png",  },};
```

```prism
// In MONAD_TESTNET_TOKENS array{  chainId: 1,  name: "shMonad",  symbol: "shMON",  decimals: 18,  address: "0x3a98250F98Dd388C211206983453837C8365BDc1",  logoURI: "put_your_logo_url_here_or_use_the_default_logo",},
// In MONAD_TESTNET_TOKENS_BY_SYMBOL recordshmon: {  chainId: 1,  name: "shMonad",  symbol: "shMON",  decimals: 18,  address: "0x3a98250F98Dd388C211206983453837C8365BDc1",  logoURI: "put_your_logo_url_here_or_use_the_default_logo",},
// In MONAD_TESTNET_TOKENS_BY_ADDRESS record"0x3a98250F98Dd388C211206983453837C8365BDc1": {  chainId: 1,  name: "shMonad",  symbol: "shMON",  decimals: 18,  address: "0x3a98250F98Dd388C211206983453837C8365BDc1",  logoURI: "put_your_logo_url_here_or_use_the_default_logo",},
```

```prism
npm run buildnpm run start
```

```prism
export const DEFAULT_SLIPPAGE_BPS = 100; // 1% in basis points
export const SLIPPAGE_OPTIONS = [  { label: "0.1%", value: 10 },  { label: "0.5%", value: 50 },  { label: "1%", value: 100 },  { label: "2%", value: 200 },  { label: "3%", value: 300 },];
```

```prism
export async function GET(request: NextRequest) {  const searchParams = request.nextUrl.searchParams;
  // Add default slippage if not provided  if (!searchParams.has("slippageBps")) {    searchParams.set("slippageBps", "100"); // 1% default  }
  const res = await fetch(    `https://api.0x.org/swap/permit2/price?${searchParams}`, // or /quote    {      headers: {        "0x-api-key": process.env.ZEROX_API_KEY as string,        "0x-version": "v2",      },    }  );  const data = await res.json();  return Response.json(data);}
```

```prism
const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
// Add slippageBps to your API request parametersconst priceRequest = useMemo(  () => ({    chainId,    sellToken: sellTokenObject.address,    buyToken: buyTokenObject.address,    sellAmount: parsedSellAmount,    taker,    slippageBps, // Add this    // ... other params  }),  [...dependencies, slippageBps]);
```

```prism
NEXT_PUBLIC_PRIVY_APP_IDNEXT_PUBLIC_PRIVY_CLIENT_IDNEXT_PUBLIC_VAPID_PUBLIC_KEYVAPID_PRIVATE_KEYZEROX_API_KEY
```

```prism
npm i -g vercel
```

```prism
vercel login
```

```prism
vercel
```

```prism
vercel env add NEXT_PUBLIC_PRIVY_APP_IDvercel env add NEXT_PUBLIC_PRIVY_CLIENT_IDvercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEYvercel env add VAPID_PRIVATE_KEYvercel env add ZEROX_API_KEY
```

```prism
vercel --prod
```

