# pure-asmr
Browser extension to play high quality audio over YT video

# First Setup

1. Install npm
2. Install packages with
```
npm install aws-sdk browserify
```
3. Run browserify to build the `bfy_content.js` script from `content.js`(https://github.com/browserify/browserify)
```
npm run build
```
4. Load extension folder (this repo) in Chrome within `chrome://extensions/`
5. Open `https://www.youtube.com/watch?v=MdhIfhuP42g`

# Code update workflow

1. Changes made to `content.js` have to be parsed to `bfy_content.js` again so the following has to be run again:
```
npm run build
```
2. The changes can then be reloaded within `chrome://extensions/`
3. The browser page must be reloaded
