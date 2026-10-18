# ProteoBuild

ProteoBuild is a static educational simulator for BIA01 Unit III. It introduces amino-acid classification, primary and secondary structure, tertiary and quaternary structure, and protein stability, denaturation, and renaturation.

The models are conceptual teaching aids. The 3D chain is illustrative and the stability score is a simplified response to slider settings; neither predicts real protein folding or behavior.

## Run locally

Because the 3D view uses JavaScript modules, serve this folder over HTTP rather than opening `index.html` directly. For example, from this folder run `python -m http.server 8000`, then visit `http://localhost:8000`.

The Three.js library and OrbitControls load from jsDelivr, so the 3D module needs an internet connection. The other page content is local.

## Publish on GitHub Pages

1. Create a GitHub repository and add the files in this folder to its root.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.
5. Open the Pages URL shown in Settings after deployment finishes.

## Suggested four-person split

- **Student 1:** `view-amino` in `index.html`, amino-acid data and sequence controls in `app.js`.
- **Student 2:** `view-secondary` in `index.html`, structure styles in `styles.css`, and structure switching in `app.js`.
- **Student 3:** `view-folding` in `index.html`, Three.js model and controls in `app.js`.
- **Student 4:** `view-stability` in `index.html`, stability lab styles in `styles.css`, and slider behavior in `app.js`.
- **Shared integration:** overview, navigation, accessibility, responsive layout, and final content review.

If several students are editing simultaneously, agree on module boundaries first and combine changes through separate Git branches or pull requests.
