$ yarn create solana-dapp
yarn create v1.22.22
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Installed "create-solana-dapp@4.4.0" with binaries:
      - create-solana-dapp
[##############################] 30/30┌  create-solana-dapp 4.4.0
│
◇  Enter project name
│  loudness
│
◇  Select a framework
│  Solana Mobile
│
◇  Select a template
│  web3js-expo-paper
│
◇  Cloned template to /home/h/Projects/solana-mobile-hackathon/loudness
│
◇  Installed via yarn
│
◇  Init script done
│
│
▲  Directory is already under version control. Skipping initialization of git.
◇  Initialized git repo
│
◇  Installation successful ────────────────────╮
│                                              │
│  That's it!                                  │
│                                              │
│  Change to your new directory:               │
│                                              │
│  cd ./loudness                               │
│                                              │
│  To buld the Android app locally, run this:  │
│                                              │
│  yarn run android                            │
│                                              │
├──────────────────────────────────────────────╯
│
└  Good luck with your project!

Done in 75.32s.



instead of yarn run android, follow these steps if app not installed on phone

https://docs.expo.dev/tutorial/eas/configure-development-build/#initialize-a-development-build

npm install -g eas-cli

sign up for eas account https://expo.dev/signup

eas login

https://docs.solanamobile.com/react-native/expo#build-with-eas-build

npx eas build --profile development --platform android

when build finishes, scan QR code to download apk

go to file manager and open apk to install



(app installed on phone)

open app

npx expo start --dev-client --tunnel

scan QR code, and enter URL manually in app

press Connect button

you will see activity in the terminal

app will load on phone

