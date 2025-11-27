# How to build a Farcaster Mini App

> Source: https://docs.monad.xyz/templates/farcaster-miniapp/getting-started

## Documentation

On this page

In this guide, you will learn how to use the Monad Farcaster Mini App Template to build apps.
The template demonstrates all Mini App capabilities and lets you easily modify it, so you can build Mini Apps.
Cloning the Template​
You can the following command to clone the Mini App template to your local machine:
git clone https://github.com/monad-developers/monad-miniapp-template.git
Install the dependencies​
yarn
Copy .env.example over to .env.local​
cp .env.example .env.local
Run the template​
yarn run dev
View the App in Farcaster Embed tool​
Farcaster has a neat Embed tool that you can use to inspect the Mini App before you publish it.
Unfortunately, the embed tool can only work with remote URL. Inputting a localhost URL does not work.
As a workaround, you may make the local app accessible remotely using a tool like cloudflared or ngrok. In this guide we will use cloudflared.
Install Cloudflared​
brew install cloudflared
For more installation options see the official docs.
Expose localhost​
Run the following command in your terminal:
cloudflared tunnel --url http://localhost:3000
Be sure to specify the correct port for your local server.
Set NEXT_PUBLIC_URL environment variable in .env.local file​
NEXT_PUBLIC_URL=<url-from-cloudflared-or-ngrok>
Use the provided url​
cloudflared will generate a random subdomain and print it in the terminal for you to use. Any traffic to this URL will get sent to your local server.
Enter the provided URL in the Farcaster Embed tool.

Let's investigate the various components of the template.
Customizing the Mini App Embed​
Mini App Embed is how the Mini App shows up in the feed or in a chat conversation when the URL of the app is shared.
The Mini App Embed looks like this:

You can customize this by editing the file app/page.tsx:
page.tsxapp1234567891011121314151617181920...
const appUrl = env.NEXT_PUBLIC_URL;
const frame = {  version: "next",  imageUrl: `${appUrl}/images/feed.png`, // Embed image URL (3:2 image ratio)  button: {    title: "Template", // Text on the embed button    action: {      type: "launch_frame",      name: "Monad Farcaster Mini App Template",      url: appUrl, // URL that is opened when the embed button is tapped or clicked.      splashImageUrl: `${appUrl}/images/splash.png`,      splashBackgroundColor: "#f7f7f7",    },  },};
...
You can either edit the URLs for the images or replace the images in public/images folder in the template.
Once you are happy with the changes, click Refetch in the Embed tool to get the latest configuration.
noteIf you are developing locally, ensure that your Next.js app is running locally and the cloudflare tunnel is open.
Customizing the Splash Screen​
Upon opening the Mini App, the first thing the user will see is the Splash screen:

You can edit the app/page.tsx file to customize the Splash screen.
page.tsxapp1234567891011121314151617181920...
const appUrl = env.NEXT_PUBLIC_URL;
const frame = {  version: "next",  imageUrl: `${appUrl}/images/feed.png`,  button: {    title: "Launch Template",    action: {      type: "launch_frame",      name: "Monad Farcaster Mini App Template",      url: appUrl,      splashImageUrl: `${appUrl}/images/splash.png`, // App icon in the splash screen (200px * 200px)      splashBackgroundColor: "#f7f7f7", // Splash screen background color    },  },};
...
For splashImageUrl, you can either change the URL or replace the image in public/images folder in the template.
Modifying the Mini App​
Upon opening the template Mini App, you should see a screen like this:

The code for this screen is in the components/pages/app.tsx file:
app.tsxcomponents > pages12345678910export default function Home() {  const { context } = useMiniAppContext();  return (    // SafeAreaContainer component makes sure that the app margins are rendered properly depending on which client is being used.    <SafeAreaContainer insets={context?.client.safeAreaInsets}>      {/* You replace the Demo component with your home component */}      <Demo />    </SafeAreaContainer>  )}
You can remove or edit the code in this file to build your Mini App.
Accessing User Context​

Your Mini App receives various information about the user, including username, fid, displayName, pfpUrl and other fields.
The template provides a helpful hook useMiniAppContext that you can use to access these fields:
User.tsxcomponents > Home1234export function User() {    const { context } = useMiniAppContext();    return <p>{context.user.username}</p>}
The template also provide an example of the same in components/Home/User.tsx file.
You can learn more about Context here.
Performing App Actions​

Mini Apps have the capability to perform native actions that enhance the user experience!
Actions like:

addFrame: Allows the user to save (bookmark) the app in a dedicated section
composeCast: Allows the Mini App to prompt the user to cast with prefilled text and media
viewProfile: Presents a profile of a Farcaster user in a client native UI

Learn more about Mini App actions here
The template provides an easy way to access the actions via the useMiniAppContext hook!
FarcasterActions.tsxcomponents > Homeconst { actions } = useMiniAppContext();
An example for the same can be found in components/Home/FarcasterActions.tsx file.
Prompting Wallet Actions​

Every user of Farcaster has a Farcaster wallet with Monad Testnet support.
Mini Apps can prompt the user to perform onchain actions!
The template provides an example for the same in components/Home/WalletActions.tsx file.
WalletActions.tsxcomponents > Home123456789101112export function WalletActions() {    ...
    async function sendTransactionHandler() {        sendTransaction({            to: "0x7f748f154B6D180D35fA12460C7E4C631e28A9d7",            value: parseEther("1"),        });    }
    ...}
warningThe Farcaster wallet supports multiple networks. It is recommended that you ensure that the right network is connected before prompting wallet actions.You can use viem's switchChain or equivalent to prompt a chain switch.WalletActions.tsxcomponents > Home// Switching to Monad TestnetswitchChain({ chainId: 10143 });The template has an example for the same in the components/Home/WalletActions.tsx file.
Conclusion​
In this guide, you explored Farcaster Mini Apps — the simplest way to create engaging, high-retention, and easily monetizable applications!
You also discovered the key capabilities of Mini Apps and how you can use the Monad Farcaster Mini App Template to build your own.
For more details, check out the official Mini App documentation here.
Explore more Farcaster Mini App guides​
Sending NotificationsGenerating custom shareable imagesPublishing Mini App

## Code Examples

```prism
git clone https://github.com/monad-developers/monad-miniapp-template.git
```

```prism
yarn
```

```prism
cp .env.example .env.local
```

```prism
yarn run dev
```

```prism
brew install cloudflared
```

```prism
cloudflared tunnel --url http://localhost:3000
```

```prism
NEXT_PUBLIC_URL=<url-from-cloudflared-or-ngrok>
```

```prism
...
const appUrl = env.NEXT_PUBLIC_URL;
const frame = {  version: "next",  imageUrl: `${appUrl}/images/feed.png`, // Embed image URL (3:2 image ratio)  button: {    title: "Template", // Text on the embed button    action: {      type: "launch_frame",      name: "Monad Farcaster Mini App Template",      url: appUrl, // URL that is opened when the embed button is tapped or clicked.      splashImageUrl: `${appUrl}/images/splash.png`,      splashBackgroundColor: "#f7f7f7",    },  },};
...
```

```prism
...
const appUrl = env.NEXT_PUBLIC_URL;
const frame = {  version: "next",  imageUrl: `${appUrl}/images/feed.png`,  button: {    title: "Launch Template",    action: {      type: "launch_frame",      name: "Monad Farcaster Mini App Template",      url: appUrl,      splashImageUrl: `${appUrl}/images/splash.png`, // App icon in the splash screen (200px * 200px)      splashBackgroundColor: "#f7f7f7", // Splash screen background color    },  },};
...
```

```prism
export default function Home() {  const { context } = useMiniAppContext();  return (    // SafeAreaContainer component makes sure that the app margins are rendered properly depending on which client is being used.    <SafeAreaContainer insets={context?.client.safeAreaInsets}>      {/* You replace the Demo component with your home component */}      <Demo />    </SafeAreaContainer>  )}
```

```prism
export function User() {    const { context } = useMiniAppContext();    return <p>{context.user.username}</p>}
```

```prism
const { actions } = useMiniAppContext();
```

```prism
export function WalletActions() {    ...
    async function sendTransactionHandler() {        sendTransaction({            to: "0x7f748f154B6D180D35fA12460C7E4C631e28A9d7",            value: parseEther("1"),        });    }
    ...}
```

```prism
// Switching to Monad TestnetswitchChain({ chainId: 10143 });
```

