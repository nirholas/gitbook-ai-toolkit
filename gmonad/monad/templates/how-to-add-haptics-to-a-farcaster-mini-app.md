# How to add haptics to a Farcaster Mini App

> Source: https://docs.monad.xyz/templates/farcaster-miniapp/haptics

## Documentation

On this page

Haptics are a way to add tactile feedback to your app to enhance user interaction and responsiveness.
This guide walks you through implementing haptics in a Farcaster Mini App for a more intuitive and engaging user experience.
Implementing haptics in a Farcaster Mini App​
If you are using the Monad Mini App template, you can use haptics from the useFrame hook.
If you are not using the Monad Mini App template, you can inspect the useFrame hook to check out the implementation details.
Below is an example of how to implement haptics in a Farcaster Mini App:
...
export default function MyComponent() {  const { haptics } = useFrame();
  return (    <div>      <button onClick={() => haptics.impactOccurred('light')}>Light Impact</button>    </div>  );}
Supported haptics​
The following haptics are supported:
Haptic TypeCodeLight Impacthaptics.impactOccurred('light')Medium Impacthaptics.impactOccurred('medium')Heavy Impacthaptics.impactOccurred('heavy')Soft Impacthaptics.impactOccurred('soft')Rigid Impacthaptics.impactOccurred('rigid')Success Notificationhaptics.notificationOccurred('success')Warning Notificationhaptics.notificationOccurred('warning')Error Notificationhaptics.notificationOccurred('error')Selection Changehaptics.selectionChanged()

## Code Examples

```prism
...
export default function MyComponent() {  const { haptics } = useFrame();
  return (    <div>      <button onClick={() => haptics.impactOccurred('light')}>Light Impact</button>    </div>  );}
```

