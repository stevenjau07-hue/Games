# Dama: Checkers vs AI

A checkers game with its own AI (minimax). Works fully offline. No install, no internet needed after the first load.

## Put it on GitHub and run it
1. Create a new repository on github.com (name it `dama`, set it to Public).
2. Click "Add file" > "Upload files". Drag in ALL files from this folder (not the folder itself). Click "Commit changes".
3. Go to Settings > Pages. Under "Branch" choose `main` and `/ (root)`, then Save.
4. Wait about 1 minute. Your game is live at `https://YOUR-USERNAME.github.io/dama/`

## Install it as an app
- Android (Chrome): open the link, tap "Install app" or the menu (3 dots) > "Install app".
- Windows (Chrome/Edge): click the install icon in the address bar.
- iPhone (Safari): Share > "Add to Home Screen".
After installing it works with no internet.

## Files
- `game.js`  the rules (moves, forced captures, kings)
- `ai.js`    the AI model (minimax + alpha-beta pruning + scoring)
- `app.js`   the screen and buttons
- `index.html`, `style.css`  the page and its look
- `sw.js`, `manifest.json`, icons  make it installable and offline
- `test.js`  run `node test.js` to test the engine

When you change any file, change `dama-v1` to `dama-v2` in `sw.js` so phones load the update.
