# Car Collision Game - Three.js

A simple 3D car runner / collision game built with Three.js.

## Project structure
```
car-collision-game/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ game.js
├─ README.md
├─ .gitignore
└─ LICENSE
```

(Your uploaded files show `index.html` referencing `css/style.css` and `js/game.js`. Make sure those files are in those subfolders before committing.)  

## How to run locally
Option A — Quick (open file):
1. Ensure `index.html` is at the project root and `css/style.css` + `js/game.js` are in `css/` and `js/`.
2. Double-click `index.html` to open it in your browser. This often works.

Option B — Recommended (run a local HTTP server):
- Python 3:
```
python -m http.server 8000
# then open http://localhost:8000
```
- Node (if you have Node.js):
```
npx http-server -p 8000
# then open http://localhost:8000
```

## Upload to GitHub — step-by-step (command line)
1. Configure Git (if you haven't already):
```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```
2. Prepare your project folder (from the folder that contains `index.html`):
```
# create folders (if needed) and move files so paths match index.html
mkdir -p css js
mv style.css css/
mv game.js js/

git init
git add .
git commit -m "Initial commit - Car Collision Game"
```
3. Create repository on GitHub (via website) named e.g. `car-collision-game`.

4. Add remote and push:
HTTPS:
```
git branch -M main
git remote add origin https://github.com/<your-username>/car-collision-game.git
git push -u origin main
```
SSH (if you set up SSH keys):
```
git remote add origin git@github.com:<your-username>/car-collision-game.git
git push -u origin main
```

## Publish with GitHub Pages (to make the game live)
1. On GitHub, open your repository → Settings → Pages.
2. Under "Source", choose `main` branch and root `/` (or `gh-pages` branch if you prefer).
3. Save. The site will be live at:

