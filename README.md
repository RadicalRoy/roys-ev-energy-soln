# Setup and Run

After cloning the repo
Checkout the branch `feat/select-charging-station`

Remember to

```
npm install
```

The feature was only tested on and developed for iOS. So please only check the iOS simulator.

```
npm run ios -c
```

# Design Notes

I chose to use the Google Maps `react-native-mapview` library to display nearby charging stations to the user.

It is hardcoded to select the nearest 10 from the `chargepointmap` api and expects US format of addresses.

Native `fetch` is used for requests though `axios` would make for a suitable alternative (and perhaps scale better).

`expo-router` is used for navigation. I found this painful as directory based navigation seems like a bad trend, and the proliferation of anything building on `index.js` conventions is probably a bad idea (see Ryan Dahl's regret around this https://www.youtube.com/watch?v=M3BM9TB-8yA&t=876s). But I digress. The assignment was to use `expo` libraries where possible, and we could discuss `react-navigation` trade offs to `expo-router`.

# Known Issues

There appears to be a bug where sometimes (pretty often really) pressing a location `Marker` propogates the press to a nearby marker resulting in what appears to be a second press. This is reportedly a common bug with the `react-native-maps` library: https://github.com/react-native-maps/react-native-maps/issues/2410
