# ProteoBuild: A Web-Based Interactive Simulator for Protein Structure, Folding and Stability

**Biotechnology Capstone Project • BIA01 Unit III Syllabus**

ProteoBuild is a responsive, web-based educational simulator engineered to guide undergraduate biotechnology students through the hierarchy of protein organization:
$$\text{Amino-Acid Sequence} \longrightarrow \text{Secondary-Structure Patterns} \longrightarrow \text{3D Tertiary \& Quaternary Assemblies} \longrightarrow \text{Environmental Stability \& Denaturation}$$

---

## 1. Educational Purpose & Scientific Limitations

ProteoBuild is designed as an interactive teaching instrument aligned with the **BIA01 Unit III syllabus** (Protein Chemistry, Higher-Order Conformations, Thermodynamics of Folding, and Denaturation).

### Explicit Model Limitations (Crucial Notice)
- **Simplified Educational Representations:** All visualizations, including the Three.js 3D models, cartoon ribbons, hydrogen-bond networks, and Ramachandran angle plots, are **simplified conceptual models** meant for instruction.
- **Not Molecular Dynamics Software:** ProteoBuild does not run physical molecular dynamics (MD), quantum mechanical force-field calculations, or molecular simulations.
- **Not a Structure-Prediction Tool:** The application does not perform ab-initio or AI structure prediction (such as AlphaFold or Rosetta) from sequence. The 3D views illustrate general architectural motifs and do not calculate actual atomic coordinates from typed sequences.
- **Illustrative Stability Score:** The stability score in Module 4 is an illustrative conceptual metric based on two-state equilibrium thermodynamics, not a clinically or experimentally validated biochemical measurement.

---

## 2. The Four Learning Modules

| Module | Title | Syllabus Coverage & Key Concepts | Interactive Features |
| :--- | :--- | :--- | :--- |
| **Module 1** | **Amino Acids & Primary Structure** | General backbone ($NH_2-C_\alpha H(R)-COOH$), 20 standard amino acid side chains, chemical classifications (nonpolar, aromatic, polar, acidic, basic), peptide bond condensation ($-\text{H}_2\text{O}$), sequence directionality ($N \to C$). | Interactive residue search & selector grid, dehydration synthesis visualizer, sequence builder with Molecular Weight ($MW$), estimated $pI$, net charge at pH 7.4, hydropathy score, backspace undo, and random motif generator. |
| **Module 2** | **Secondary Structure Patterns** | Local repeating backbone patterns stabilized by hydrogen bonds ($C=O \cdots H-N$). Pauling-Corey-Branson $\alpha$-helix ($3.6$ residues/turn, $5.4\text{ \AA}$ pitch, $i \to i+4$ H-bonding, dipole), parallel vs. antiparallel $\beta$-sheets (collinear vs. angled H-bonds), helix breakers (Proline, Glycine). | Interactive Alpha-Helix vs. Beta-Sheet switcher, H-bond network inspector, sidechain orientation toggle, and an **Interactive Ramachandran Plot** showing allowed $(\phi, \psi)$ dihedral angle space. |
| **Module 3** | **3D Tertiary & Quaternary Structure** | Single polypeptide chain 3D folding driven by the hydrophobic effect, salt bridges, H-bonds, and covalent disulfide bridges ($-S-S-$). Multi-subunit quaternary complexes (e.g., Hemoglobin $\alpha_2\beta_2$ tetramer, allosteric regulation, subunit interfaces). | **Interactive Three.js 3D Viewer** with drag-to-rotate, zoom, pan, reset view, ribbon cartoon / backbone tube / atom representations, non-covalent force lines, subunit switcher (Monomer, Dimer, Tetramer), gesture guides, and sequence linkage. |
| **Module 4** | **Stability, Denaturation & Renaturation** | Thermodynamic marginal stability ($\Delta G_\text{fold} \approx -20\text{ to }-60\text{ kJ/mol}$), thermal melting temperature ($T_m$), extreme pH electrostatic disruption, chemical chaotropes (Urea, GdnHCl), irreversible aggregation vs. Anfinsen's renaturation principle. | 1-Click environmental stress presets, **Dynamic Thermal Melting Curve** (Canvas plotting fraction folded $\theta$ vs $T$), animated conformational morphing (Native $\to$ Molten Globule $\to$ Unfolded $\to$ Aggregated), and inline Anfinsen renaturation test. |

---

## 3. Four-Person Student Team Work Split

To ensure balanced contribution and clear accountability across all development milestones:

### Student 1 — Primary Structure & Sequence Chemistry
- Researched and compiled the comprehensive 20-amino acid biochemical database (`aminoData.js`).
- Authored the general amino-acid backbone and peptide bond dehydration condensation visualizer.
- Built the interactive Sequence Builder, implementing physicochemical math ($MW$, Henderson-Hasselbalch $pI$ bisection, charge at pH 7.4, GRAVY hydropathy).
- Created Module 1 knowledge checks and feedback explanations.

### Student 2 — Secondary Structure & Dihedral Geometry
- Authored the comparative curriculum on $\alpha$-helices, parallel $\beta$-sheets, and antiparallel $\beta$-sheets (`secondaryVisualizer.js`).
- Implemented high-contrast SVG structural schematics showing pitch, rise, $i \to i+4$ H-bonds, and alternating sidechains.
- Designed and coded the **Interactive Ramachandran Plot Canvas**, mapping $(\phi, \psi)$ dihedral angles to allowed conformational energy basins.
- Created Module 2 knowledge checks and feedback explanations.

### Student 3 — 3D Architecture & Three.js Graphics
- Engineered the Three.js 3D teaching visualizer (`viewer3d.js`) loaded via CDN ES modules.
- Implemented procedural ribbon cartoons, backbone tubes, and atom sphere representations.
- Added interactive non-covalent force networks: dotted hydrogen bonds, covalent cystine disulfide bridges, and hydrophobic core clustering.
- Developed multi-subunit assembly switching (Monomer, Dimer, Tetramer $\alpha_2\beta_2$) and curated classic presets (Myoglobin, Hemoglobin, Insulin, Lysozyme).
- Created Module 3 knowledge checks and feedback explanations.

### Student 4 — Thermodynamics, Stability & Environmental Lab
- Designed the environmental laboratory simulation (`stabilityLab.js`) modeling Temperature ($0\text{--}100^\circ\text{C}$), pH ($0\text{--}14$), and chemical chaotropes ($0\text{--}8\text{ M}$ Urea).
- Implemented the **Dynamic Thermal Melting Curve Canvas** plotting two-state fraction folded ($\theta$) with apparent $T_m$ tracking.
- Created the conformational state morphing animation (Native compact fold $\to$ Molten globule $\to$ Unfolded polymer $\to$ Amorphous aggregate).
- Programmed the Christian Anfinsen renaturation experiment test button and Module 4 knowledge checks.

### Shared & Collaborative Responsibilities
- **Design System & Aesthetics:** Master CSS variables, "Clean Bio-Lab Modern" theme, full light/dark mode support, responsive layouts for mobile/tablet/desktop, and `@media (prefers-reduced-motion)` accessibility.
- **Local Persistence & Data Management:** Browser `LocalStorage` management (`storage.js`), JSON export/import with validation, and plain-text FASTA format exports.
- **Capstone Integration & Reviews:** Rotating integration coordination, cross-checking scientific wording, and GitHub Pages deployment testing.

---

## 4. Local Storage Behavior vs. Cloud Storage Requirements

### Current Client-Side Architecture (Static Website)
- ProteoBuild runs **entirely in the user's web browser** as a static application.
- User-created sequences, library entries, and module progress are stored using browser `localStorage`.
- **Key Characteristics:**
  - Fast, immediate, and works without an account, login, or internet backend.
  - Data remains on the specific computer and web browser used.
  - Clearing browser cookies or cache may reset local progress.

### What Synchronized Cloud Saving Would Require
GitHub Pages hosts static files and **does not provide a backend database or user authentication system**. To support multi-device synchronization, online accounts, or cloud backup, the following separate architecture would be required:
1. **Authentication Service:** OAuth 2.0 / JWT login (e.g., Google Sign-In, Supabase Auth, or Firebase Auth).
2. **Backend Database:** Cloud database (e.g., PostgreSQL, MongoDB, or Firestore) with user-scoped tables for sequences and scores.
3. **API Layer:** REST or GraphQL server endpoints with authorization tokens, rate limiting, and input sanitization.
4. **Privacy & Governance:** A privacy policy complying with student data protection regulations (e.g., FERPA / GDPR).

---

## 5. How to Run Locally

Because ProteoBuild is built with pure web technologies (HTML5, Vanilla CSS, and modern ES JavaScript modules), no complex build step, bundling, or npm installation is required.

### Quick Start with Python
Open your terminal in the project directory and run:
```bash
# Python 3
python3 -m http.server 8000
```
Then open your browser and navigate to:
```
http://localhost:8000
```

### Quick Start with Node / npx
```bash
npx serve .
```

> **Note on 3D Viewer:** The Three.js 3D viewer loads Three.js and OrbitControls dynamically from secure public CDNs (`cdnjs.cloudflare.com` and `cdn.jsdelivr.net`). An active internet connection is needed for the initial 3D viewer load unless the library files are downloaded locally into a `vendor/` directory.

---

## 6. How to Deploy on GitHub Pages

ProteoBuild is configured for instant deployment to **GitHub Pages**:

1. **Initialize Git Repository (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ProteoBuild Biotechnology Capstone"
   ```
2. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. **Activate GitHub Pages:**
   - In your GitHub repository, navigate to **Settings** $\to$ **Pages**.
   - Under **Build and deployment** $\to$ **Source**, select `Deploy from a branch`.
   - Under **Branch**, select `main` and root folder `/ (root)`.
   - Click **Save**.
   - Your website will be live in 1--2 minutes at: `https://<your-username>.github.io/<your-repo-name>/`.

---

## 7. Accessibility & Technology Stack

- **Semantic HTML5:** Native landmark tags (`<header>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`), keyboard skip links, explicit form labels, and ARIA roles.
- **Vanilla CSS3:** Custom design tokens (`--bg`, `--text`, `--accent-coral`, `--accent-lavender`), modern flexbox and CSS grid, high contrast ratios ($>4.5:1$), and `@media (prefers-reduced-motion: reduce)`.
- **Vanilla JavaScript (ES6+ Modules):** Clean separation of concerns across biochemical datasets, sequence math, vector graphics, 3D WebGL rendering, and storage.
- **Three.js (r128):** Lightweight WebGL library rendering rotatable 3D protein cartoon ribbons and non-covalent force lines.
