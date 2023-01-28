# vue-firebase-tailwind-boilerplate

Setup your next app quickly with Firebase and Tailwind

## Setup

### Clone the boilerplate into a new app folder
```bash
git clone git@github.com:mirorac/vue-firebase-tailwind-boilerplate.git <you-app-folder-name>
cd <you-app-folder-name>
```

### Initialize Firebase
```bash
firebase init
```
When you choose to init functions, ask to overwrite the exidting codebase and answer `N` to every option for rewriting files in `functions/` folder. You can install `npm` dependencies.

### Push to repository (optional)
Create a new empty repository on github and push it there.
```bash
git init
git add .
git commit -m 'setup with boilerplate'
git remote add origin <url>
git push -u origin main
```

## Cloud functions

based on [chidindu-ogbonna/cloud-functions-boilerplate](https://github.com/chidindu-ogbonna/cloud-functions-boilerplate), follow their README.md to setup
