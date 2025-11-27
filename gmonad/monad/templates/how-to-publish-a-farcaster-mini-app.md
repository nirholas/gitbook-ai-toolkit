# How to publish a Farcaster Mini App

> Source: https://docs.monad.xyz/templates/farcaster-miniapp/publishing-miniapp

## Documentation

On this page

Publishing the Mini App makes it discoverable in the Farcaster app. However, the Mini App has to be hosted on a domain before it can be published.
Since Farcaster is a decentralized network with multiple clients, a standard has been adopted wherein the Farcaster clients look for the farcaster.json file on the Mini App hosted domain for information about the Mini App.
Hosting the farcaster.json file​
The farcaster.json has to be placed in /.well-known/farcaster.json endpoint.
If you are using the Monad Mini App template you can edit the farcaster.json file with your app details before publishing the app!
If you are not using the template then you have to make sure you have a farcaster.json file hosted on your domain at [domain]/.well-known/farcaster.json endpoint.
route.tsapp > .well-known > farcaster.json12345678910111213141516171819202122232425262728...
const appUrl = process.env.NEXT_PUBLIC_URL;const farcasterConfig = {    // accountAssociation details are required to associate the published app with it's author    // instructions on how to get these values are provided later in this guide.    accountAssociation: {        "header": "",        "payload": "",        "signature": ""    },    frame: {        version: "1",        name: "Monad Farcaster Mini App Template", // Name of your Mini App        iconUrl: `${appUrl}/images/icon.png`, // Icon of the app in the app store        homeUrl: `${appUrl}`, // Default launch URL        imageUrl: `${appUrl}/images/feed.png`, // Default image to show if shared in a feed.        screenshotUrls: [], // Visual previews of the app        tags: ["monad", "farcaster", "miniapp", "template"], // Descriptive tags for search        primaryCategory: "developer-tools",        buttonTitle: "Launch Template",        splashImageUrl: `${appUrl}/images/splash.png`, // URL of image to show on loading screen.	        splashBackgroundColor: "#ffffff", // Hex color code to use on loading screen.        webhookUrl: `${appUrl}/api/webhook` // Webhook url for notifications    }};
...
The above example is a partial representation of the farcaster.json file. The full reference for the farcaster.json file can be found here.
Generating accountAssociation using the Farcaster Mobile App.​
The accountAssociation object in the farcaster.json file is used to associate the Mini App with the publisher's Farcaster account.
To generate the accountAssociation object you can use the Farcaster Mobile App.
Go to Settings (under Developer) > Domains, enter the domain where the Mini App is hosted and click Generate Domain Manifest.
Can't see Developer options?For the Developer options to be visible you will need to have Developer mode enabled in Farcaster.You can enable it by going to Settings (under Profile and Account) > Advanced > scroll down and enable Developer mode.
The accountAssociation object will be generated it will be available in your clipboard you can then paste the values in the farcaster.json file.
route.tsapp > .well-known > farcaster.json12345678910111213...
const appUrl = process.env.NEXT_PUBLIC_URL;const farcasterConfig = {    accountAssociation: {        header: "eyJmaWQiOjE3OTc5LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4MGMxNWE5QkVmRTg3RjY0N0IwMDNhMjI0MTY4NDYwMzYyODQ0M2Y4YiJ9",        payload: "eyJkb21haW4iOiJtb25hZC1taW5pYXBwLXRlbXBsYXRlLXNldmVuLnZlcmNlbC5hcHAifQ",        signature: "MHgwYzY2NDdjZDhjOWJiY2JmYzg2NGIzZjVjYWVjY2ExMTdlOTY4ZGQwMWIzMmM0NGViMjU5ZDhlOGQyMzdhZTZiMDU1MmNmNWRiMDU1MDMwNTZmNTNhZmEwZDZlZTBlZmIyMmJmNDNmMDQ4NTdhMzk2NmY0YmMzODk2N2NlZDI5ZjFi"    },    ...};
...

You can find the farcaster.json file for Monad Mini App Template app here.
Once the farcaster.json file is hosted, your Mini App is now discoverable in the Farcaster app, you can test it by searching for the Mini App in the Farcaster app!

## Code Examples

```prism
...
const appUrl = process.env.NEXT_PUBLIC_URL;const farcasterConfig = {    // accountAssociation details are required to associate the published app with it's author    // instructions on how to get these values are provided later in this guide.    accountAssociation: {        "header": "",        "payload": "",        "signature": ""    },    frame: {        version: "1",        name: "Monad Farcaster Mini App Template", // Name of your Mini App        iconUrl: `${appUrl}/images/icon.png`, // Icon of the app in the app store        homeUrl: `${appUrl}`, // Default launch URL        imageUrl: `${appUrl}/images/feed.png`, // Default image to show if shared in a feed.        screenshotUrls: [], // Visual previews of the app        tags: ["monad", "farcaster", "miniapp", "template"], // Descriptive tags for search        primaryCategory: "developer-tools",        buttonTitle: "Launch Template",        splashImageUrl: `${appUrl}/images/splash.png`, // URL of image to show on loading screen.	        splashBackgroundColor: "#ffffff", // Hex color code to use on loading screen.        webhookUrl: `${appUrl}/api/webhook` // Webhook url for notifications    }};
...
```

```prism
...
const appUrl = process.env.NEXT_PUBLIC_URL;const farcasterConfig = {    accountAssociation: {        header: "eyJmaWQiOjE3OTc5LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4MGMxNWE5QkVmRTg3RjY0N0IwMDNhMjI0MTY4NDYwMzYyODQ0M2Y4YiJ9",        payload: "eyJkb21haW4iOiJtb25hZC1taW5pYXBwLXRlbXBsYXRlLXNldmVuLnZlcmNlbC5hcHAifQ",        signature: "MHgwYzY2NDdjZDhjOWJiY2JmYzg2NGIzZjVjYWVjY2ExMTdlOTY4ZGQwMWIzMmM0NGViMjU5ZDhlOGQyMzdhZTZiMDU1MmNmNWRiMDU1MDMwNTZmNTNhZmEwZDZlZTBlZmIyMmJmNDNmMDQ4NTdhMzk2NmY0YmMzODk2N2NlZDI5ZjFi"    },    ...};
...
```

