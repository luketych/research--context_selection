# Necessary Files for Both Branches

These files must exist in both the `all` and `main` branches for the system to function properly:

## Required Files

**`package.json`**
- Purpose: Contains npm scripts for sync and toggle operations  
- Without it: Cannot run `npm run sync`, `npm run sync-force`, or `npm run toggle` commands

**`README.md`**
- Purpose: Auto-generated navigation page with links to all visible files
- Without it: Users cannot navigate the documentation from the GitHub Pages site

**`.github-pages-visibility.json`**
- Purpose: Configuration file that determines which files are visible in main branch
- Without it: Sync script cannot determine which files to show/hide

**`scripts/sync-branches.js`**
- Purpose: Main sync script that manages branch synchronization
- Without it: Cannot sync files between branches

**`scripts/toggle-visibility.js`**
- Purpose: Script for toggling file visibility settings
- Without it: Cannot use `npm run toggle` to change file visibility

**`.github/workflows/pages.yml`**
- Purpose: GitHub Actions workflow for deploying to GitHub Pages
- Without it: GitHub Pages deployment will fail

---

*These files enable the two-branch system where `all` contains everything and `main` contains only visible files.*