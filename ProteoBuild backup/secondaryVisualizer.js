/**
 * ProteoBuild - Module 2: Secondary Structure Visualizer
 * Provides interactive comparisons of Alpha-Helices, Beta-Sheets (Parallel & Antiparallel),
 * hydrogen bonding networks, and a dynamic Ramachandran Plot Explorer.
 */

export class SecondaryVisualizer {
  constructor() {
    this.currentMode = 'helix'; // 'helix' | 'beta-antiparallel' | 'beta-parallel'
    this.showHBonds = true;
    this.showSidechains = true;

    this.container = document.getElementById('secondary-diagram-container');
    this.detailsPanel = document.getElementById('secondary-details-panel');
    this.ramaCanvas = document.getElementById('ramachandran-canvas');
    this.ramaReadout = document.getElementById('ramachandran-readout');

    this.init();
  }

  init() {
    this.bindControls();
    this.renderCurrentDiagram();
    this.initRamachandranPlot();
  }

  bindControls() {
    // Mode switcher buttons
    const modeBtns = document.querySelectorAll('.sec-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.renderCurrentDiagram();
      });
    });

    // Toggle checkboxes
    const hBondToggle = document.getElementById('toggle-sec-hbonds');
    if (hBondToggle) {
      hBondToggle.addEventListener('change', (e) => {
        this.showHBonds = e.target.checked;
        this.renderCurrentDiagram();
      });
    }

    const sidechainToggle = document.getElementById('toggle-sec-sidechains');
    if (sidechainToggle) {
      sidechainToggle.addEventListener('change', (e) => {
        this.showSidechains = e.target.checked;
        this.renderCurrentDiagram();
      });
    }
  }

  renderCurrentDiagram() {
    if (!this.container) return;

    if (this.currentMode === 'helix') {
      this.renderAlphaHelix();
      this.updateDetailsPanelHelix();
    } else if (this.currentMode === 'beta-antiparallel') {
      this.renderBetaSheet(true);
      this.updateDetailsPanelBeta(true);
    } else {
      this.renderBetaSheet(false);
      this.updateDetailsPanelBeta(false);
    }
  }

  renderAlphaHelix() {
    const hBondOpacity = this.showHBonds ? 1 : 0;
    const sidechainDisplay = this.showSidechains ? 'inline' : 'none';

    this.container.innerHTML = `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 760 420" class="sec-svg" aria-label="Simplified Alpha-Helix Schematic Diagram">
          <defs>
            <linearGradient id="helixRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#E07A5F" />
              <stop offset="50%" stop-color="#F4A261" />
              <stop offset="100%" stop-color="#E76F51" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Background coordinate grid guide -->
          <line x1="120" y1="40" x2="120" y2="380" stroke="var(--border-color, #e0e0e0)" stroke-dasharray="4,4" />
          <line x1="640" y1="40" x2="640" y2="380" stroke="var(--border-color, #e0e0e0)" stroke-dasharray="4,4" />
          <text x="120" y="30" fill="var(--text-secondary, #666)" font-size="12" text-anchor="middle">N-Terminus (δ+)</text>
          <text x="640" y="30" fill="var(--text-secondary, #666)" font-size="12" text-anchor="middle">C-Terminus (δ-)</text>

          <!-- Dipole Moment Arrow -->
          <g transform="translate(150, 60)">
            <line x1="0" y1="0" x2="460" y2="0" stroke="#6A4C93" stroke-width="2.5" marker-end="url(#arrow)" />
            <polygon points="460,-5 475,0 460,5" fill="#6A4C93" />
            <text x="230" y="-10" fill="#6A4C93" font-size="12" font-weight="600" text-anchor="middle">Overall Helical Dipole Moment (N-term to C-term)</text>
          </g>

          <!-- Pitch measurement bar -->
          <g transform="translate(240, 360)">
            <line x1="0" y1="0" x2="160" y2="0" stroke="#3D5A80" stroke-width="2" />
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#3D5A80" stroke-width="2" />
            <line x1="160" y1="-8" x2="160" y2="8" stroke="#3D5A80" stroke-width="2" />
            <text x="80" y="20" fill="#3D5A80" font-size="12" font-weight="600" text-anchor="middle">1 Pitch = 5.4 Å (3.6 residues)</text>
          </g>

          <!-- Helical Coils (Sinusoidal Backbone Ribbon) -->
          <!-- Turn 1 -->
          <path d="M 120 200 C 140 120, 180 120, 200 200 C 220 280, 260 280, 280 200" 
                fill="none" stroke="url(#helixRibbonGrad)" stroke-width="18" stroke-linecap="round" />
          <!-- Turn 2 -->
          <path d="M 280 200 C 300 120, 340 120, 360 200 C 380 280, 420 280, 440 200" 
                fill="none" stroke="url(#helixRibbonGrad)" stroke-width="18" stroke-linecap="round" />
          <!-- Turn 3 -->
          <path d="M 440 200 C 460 120, 500 120, 520 200 C 540 280, 580 280, 600 200" 
                fill="none" stroke="url(#helixRibbonGrad)" stroke-width="18" stroke-linecap="round" />
          <!-- Turn 4 end -->
          <path d="M 600 200 C 615 140, 630 140, 640 200" 
                fill="none" stroke="url(#helixRibbonGrad)" stroke-width="18" stroke-linecap="round" />

          <!-- Hydrogen Bonds (Residue i to i+4) -->
          <g class="h-bond-layer" opacity="${hBondOpacity}" transition="opacity 0.3s">
            <!-- H-Bond 1 -->
            <line x1="160" y1="140" x2="280" y2="140" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" filter="url(#glowFilter)" />
            <circle cx="160" cy="140" r="5" fill="#E63946" title="Residue i: C=O oxygen" />
            <circle cx="280" cy="140" r="4" fill="#457B9D" title="Residue i+4: N-H hydrogen" />
            <text x="220" y="132" fill="#D4A373" font-size="11" font-weight="700" text-anchor="middle">i ➔ i+4 H-Bond</text>

            <!-- H-Bond 2 -->
            <line x1="320" y1="140" x2="440" y2="140" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" filter="url(#glowFilter)" />
            <circle cx="320" cy="140" r="5" fill="#E63946" />
            <circle cx="440" cy="140" r="4" fill="#457B9D" />

            <!-- H-Bond 3 -->
            <line x1="480" y1="140" x2="600" y2="140" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" filter="url(#glowFilter)" />
            <circle cx="480" cy="140" r="5" fill="#E63946" />
            <circle cx="600" cy="140" r="4" fill="#457B9D" />

            <!-- Lower H-Bonds -->
            <line x1="240" y1="260" x2="360" y2="260" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" filter="url(#glowFilter)" />
            <line x1="400" y1="260" x2="520" y2="260" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" filter="url(#glowFilter)" />
          </g>

          <!-- Outward Projecting Side Chains (R-groups) -->
          <g display="${sidechainDisplay}">
            <!-- Top projecting R-groups -->
            <g transform="translate(160, 120)">
              <line x1="0" y1="0" x2="0" y2="-30" stroke="#81B29A" stroke-width="3" />
              <circle cx="0" cy="-35" r="9" fill="#81B29A" />
              <text x="0" y="-31" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">R1</text>
            </g>
            <g transform="translate(320, 120)">
              <line x1="0" y1="0" x2="0" y2="-30" stroke="#81B29A" stroke-width="3" />
              <circle cx="0" cy="-35" r="9" fill="#81B29A" />
              <text x="0" y="-31" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">R5</text>
            </g>
            <g transform="translate(480, 120)">
              <line x1="0" y1="0" x2="0" y2="-30" stroke="#81B29A" stroke-width="3" />
              <circle cx="0" cy="-35" r="9" fill="#81B29A" />
              <text x="0" y="-31" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">R9</text>
            </g>

            <!-- Bottom projecting R-groups -->
            <g transform="translate(240, 275)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="#81B29A" stroke-width="3" />
              <circle cx="0" cy="35" r="9" fill="#81B29A" />
              <text x="0" y="39" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">R3</text>
            </g>
            <g transform="translate(400, 275)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="#81B29A" stroke-width="3" />
              <circle cx="0" cy="35" r="9" fill="#81B29A" />
              <text x="0" y="39" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">R7</text>
            </g>
          </g>

          <text x="380" y="410" fill="var(--text-muted, #888)" font-size="11" text-anchor="middle" font-style="italic">
            Simplified educational diagram: Sidechains (green) project radially outward; backbone H-bonds (gold dashed) align parallel to helix axis.
          </text>
        </svg>
      </div>
    `;
  }

  renderBetaSheet(isAntiparallel) {
    const hBondOpacity = this.showHBonds ? 1 : 0;
    const sidechainDisplay = this.showSidechains ? 'inline' : 'none';

    // In antiparallel, Strand 1 goes Left->Right, Strand 2 goes Right->Left. H-bonds are straight (vertical).
    // In parallel, Strand 1 goes Left->Right, Strand 2 goes Left->Right. H-bonds are slanted/angled.
    this.container.innerHTML = `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 760 420" class="sec-svg" aria-label="Simplified Beta Sheet Schematic Diagram">
          <defs>
            <linearGradient id="strandGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3D5A80" />
              <stop offset="100%" stop-color="#457B9D" />
            </linearGradient>
            <linearGradient id="strandGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6A4C93" />
              <stop offset="100%" stop-color="#8338EC" />
            </linearGradient>
          </defs>

          <!-- Sheet Heading -->
          <text x="380" y="35" fill="var(--text-primary, #222)" font-size="16" font-weight="700" text-anchor="middle">
            ${isAntiparallel ? 'Antiparallel β-Pleated Sheet (Opposing Directions)' : 'Parallel β-Pleated Sheet (Same Direction)'}
          </text>

          <!-- Top Strand 1 (N -> C: Left to Right) -->
          <g transform="translate(100, 110)">
            <!-- Pleated ribbon path -->
            <polygon points="0,15 80,-5 160,15 240,-5 320,15 400,-5 480,15 520,15 540,5 520,-5 480,5 400,-15 320,5 240,-15 160,5 80,-15 0,5" 
                     fill="url(#strandGrad1)" opacity="0.9" />
            <!-- Arrow head -->
            <polygon points="520,-20 560,5 520,30 528,5" fill="#3D5A80" />
            <text x="-40" y="10" fill="#3D5A80" font-size="12" font-weight="700">N-term</text>
            <text x="575" y="10" fill="#3D5A80" font-size="12" font-weight="700">C-term</text>
          </g>

          <!-- Bottom Strand 2 -->
          <g transform="translate(100, 260)">
            ${isAntiparallel ? `
              <!-- Antiparallel: C to N (pointing left) -->
              <polygon points="560,15 480,-5 400,15 320,-5 240,15 160,-5 80,15 40,15 20,5 40,-5 80,5 160,-15 240,5 320,-15 400,5 480,-15 560,5" 
                       fill="url(#strandGrad2)" opacity="0.9" />
              <!-- Arrow head pointing left -->
              <polygon points="40,-20 0,5 40,30 32,5" fill="#6A4C93" />
              <text x="-40" y="10" fill="#6A4C93" font-size="12" font-weight="700">C-term</text>
              <text x="575" y="10" fill="#6A4C93" font-size="12" font-weight="700">N-term</text>
            ` : `
              <!-- Parallel: N to C (pointing right) -->
              <polygon points="0,15 80,-5 160,15 240,-5 320,15 400,-5 480,15 520,15 540,5 520,-5 480,5 400,-15 320,5 240,-15 160,5 80,-15 0,5" 
                       fill="url(#strandGrad2)" opacity="0.9" />
              <polygon points="520,-20 560,5 520,30 528,5" fill="#6A4C93" />
              <text x="-40" y="10" fill="#6A4C93" font-size="12" font-weight="700">N-term</text>
              <text x="575" y="10" fill="#6A4C93" font-size="12" font-weight="700">C-term</text>
            `}
          </g>

          <!-- Inter-strand Hydrogen Bonds -->
          <g class="h-bond-layer" opacity="${hBondOpacity}" transition="opacity 0.3s">
            ${isAntiparallel ? `
              <!-- Antiparallel H-bonds: Straight perpendicular pairs -->
              <!-- Pair 1 -->
              <line x1="180" y1="125" x2="180" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <line x1="220" y1="125" x2="220" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <!-- Pair 2 -->
              <line x1="340" y1="125" x2="340" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <line x1="380" y1="125" x2="380" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <!-- Pair 3 -->
              <line x1="500" y1="125" x2="500" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              
              <text x="380" y="190" fill="#D4A373" font-size="12" font-weight="700" text-anchor="middle">
                Direct, Perpendicular H-Bonds (180° collinear - Higher Stability)
              </text>
            ` : `
              <!-- Parallel H-bonds: Angled / Staggered lines -->
              <line x1="160" y1="125" x2="210" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <line x1="240" y1="125" x2="210" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <line x1="320" y1="125" x2="370" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <line x1="400" y1="125" x2="370" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />
              <line x1="480" y1="125" x2="530" y2="245" stroke="#FFB703" stroke-width="3" stroke-dasharray="6,4" />

              <text x="380" y="190" fill="#D4A373" font-size="12" font-weight="700" text-anchor="middle">
                Angled / Staggered H-Bonds (Slightly Lower Thermodynamic Stability)
              </text>
            `}
          </g>

          <!-- Alternating Side Chains (Above and Below sheet plane) -->
          <g display="${sidechainDisplay}">
            <!-- Top strand side chains -->
            <g transform="translate(180, 80)">
              <circle cx="0" cy="0" r="8" fill="#81B29A" />
              <line x1="0" y1="8" x2="0" y2="25" stroke="#81B29A" stroke-width="2" />
              <text x="0" y="4" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">Up</text>
            </g>
            <g transform="translate(260, 150)">
              <circle cx="0" cy="0" r="8" fill="#81B29A" />
              <line x1="0" y1="-8" x2="0" y2="-25" stroke="#81B29A" stroke-width="2" />
              <text x="0" y="3" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">Dn</text>
            </g>
            <g transform="translate(340, 80)">
              <circle cx="0" cy="0" r="8" fill="#81B29A" />
              <line x1="0" y1="8" x2="0" y2="25" stroke="#81B29A" stroke-width="2" />
              <text x="0" y="4" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">Up</text>
            </g>
            <g transform="translate(420, 150)">
              <circle cx="0" cy="0" r="8" fill="#81B29A" />
              <line x1="0" y1="-8" x2="0" y2="-25" stroke="#81B29A" stroke-width="2" />
              <text x="0" y="3" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">Dn</text>
            </g>
          </g>

          <text x="380" y="375" fill="var(--text-muted, #888)" font-size="11" text-anchor="middle" font-style="italic">
            Simplified educational diagram: Beta strands form an extended pleated sheet. Side chains alternate above and below the sheet plane.
          </text>
        </svg>
      </div>
    `;
  }

  updateDetailsPanelHelix() {
    if (!this.detailsPanel) return;
    this.detailsPanel.innerHTML = `
      <div class="sec-card">
        <h4 class="sec-card-title">Alpha-Helix (α-Helix) Architecture</h4>
        <div class="sec-params-grid">
          <div class="param-box">
            <span class="param-num">3.6</span>
            <span class="param-lbl">Residues per turn</span>
          </div>
          <div class="param-box">
            <span class="param-num">5.4 Å</span>
            <span class="param-lbl">Pitch (Rise/turn)</span>
          </div>
          <div class="param-box">
            <span class="param-num">1.5 Å</span>
            <span class="param-lbl">Rise per residue</span>
          </div>
          <div class="param-box">
            <span class="param-num">i ➔ i+4</span>
            <span class="param-lbl">H-Bond pattern</span>
          </div>
        </div>
        <p class="sec-desc">
          First proposed by Linus Pauling, Robert Corey, and Herman Branson in 1951. The polypeptide backbone winds into a tight, right-handed rod. 
          The carbonyl oxygen of residue <em>i</em> accepts a hydrogen bond from the amide nitrogen of residue <em>i+4</em>. 
          All peptide dipoles point in the same direction, generating an overall electric dipole with a partial positive charge at the N-terminus and partial negative charge at the C-terminus.
        </p>
        <div class="propensity-callout">
          <strong>Helix formers:</strong> Alanine, Glutamate, Leucine, Methionine.<br>
          <strong>Helix breakers:</strong> Proline (rigid ring lacks amide H) and Glycine (excessive conformational entropy).
        </div>
      </div>
    `;
  }

  updateDetailsPanelBeta(isAntiparallel) {
    if (!this.detailsPanel) return;
    if (isAntiparallel) {
      this.detailsPanel.innerHTML = `
        <div class="sec-card">
          <h4 class="sec-card-title">Antiparallel Beta-Sheet (β-Sheet)</h4>
          <div class="sec-params-grid">
            <div class="param-box">
              <span class="param-num">3.5 Å</span>
              <span class="param-lbl">Rise per residue</span>
            </div>
            <div class="param-box">
              <span class="param-num">Opposing</span>
              <span class="param-lbl">Strand Directions</span>
            </div>
            <div class="param-box">
              <span class="param-num">180° Linear</span>
              <span class="param-lbl">H-Bond Geometry</span>
            </div>
            <div class="param-box">
              <span class="param-num">High</span>
              <span class="param-lbl">Relative Stability</span>
            </div>
          </div>
          <p class="sec-desc">
            In antiparallel beta-sheets, adjacent polypeptide strands run in opposite chemical directions (one N ➔ C, the next C ➔ N). 
            This allows inter-strand hydrogen bonds to form directly perpendicular (180° collinear) to the strand axis. 
            Because hydrogen bonds are strongest when linear, antiparallel sheets are typically more thermodynamically stable than parallel sheets.
          </p>
          <div class="propensity-callout">
            <strong>Key feature:</strong> Side chains alternate pointing above and below the sheet plane with each successive residue, allowing one face to be hydrophobic and the opposite face polar (amphipathic sheet).
          </div>
        </div>
      `;
    } else {
      this.detailsPanel.innerHTML = `
        <div class="sec-card">
          <h4 class="sec-card-title">Parallel Beta-Sheet (β-Sheet)</h4>
          <div class="sec-params-grid">
            <div class="param-box">
              <span class="param-num">3.25 Å</span>
              <span class="param-lbl">Rise per residue</span>
            </div>
            <div class="param-box">
              <span class="param-num">Matching</span>
              <span class="param-lbl">Strand Directions</span>
            </div>
            <div class="param-box">
              <span class="param-num">Angled</span>
              <span class="param-lbl">H-Bond Geometry</span>
            </div>
            <div class="param-box">
              <span class="param-num">Moderate</span>
              <span class="param-lbl">Relative Stability</span>
            </div>
          </div>
          <p class="sec-desc">
            In parallel beta-sheets, all participating strands run in the identical chemical direction (all N ➔ C). 
            Because the backbone repeating units are offset, the inter-strand hydrogen bonds are angled and staggered rather than collinear. 
            Parallel sheets typically occur in the interior of large globular proteins buried away from solvent.
          </p>
          <div class="propensity-callout">
            <strong>Key residue preferences:</strong> Beta-branched residues like Valine, Isoleucine, and Threonine strongly favor beta-strands because their bulky side chains fit comfortably in the extended sheet without steric clash.
          </div>
        </div>
      `;
    }
  }

  /**
   * Interactive Ramachandran Plot Canvas
   * Shows allowed phi and psi backbone dihedral angle space
   */
  initRamachandranPlot() {
    if (!this.ramaCanvas) return;
    const canvas = this.ramaCanvas;
    const ctx = canvas.getContext('2d');

    let currentPhi = -57;
    let currentPsi = -47;

    const drawPlot = (phi, psi) => {
      const width = canvas.width;
      const height = canvas.height;

      // Coordinate transforms: -180 to +180 map to 0 to width/height
      const toX = deg => ((deg + 180) / 360) * width;
      const toY = deg => ((180 - deg) / 360) * height; // inverted Y

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, width, height);

      // Grid lines every 60 deg
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let d = -180; d <= 180; d += 60) {
        // Vertical
        ctx.beginPath();
        ctx.moveTo(toX(d), 0);
        ctx.lineTo(toX(d), height);
        ctx.stroke();
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(0, toY(d));
        ctx.lineTo(width, toY(d));
        ctx.stroke();
      }

      // Main Axes (0,0)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(toX(0), 0);
      ctx.lineTo(toX(0), height);
      ctx.moveTo(0, toY(0));
      ctx.lineTo(width, toY(0));
      ctx.stroke();

      // --- Allowed Energetic Regions ---

      // 1. Beta-sheet region (top-left)
      ctx.fillStyle = 'rgba(69, 123, 157, 0.35)';
      ctx.beginPath();
      ctx.roundRect(toX(-160), toY(170), toX(-50) - toX(-160), toY(90) - toY(170), 12);
      ctx.fill();
      ctx.strokeStyle = '#457B9D';
      ctx.stroke();

      // 2. Right-handed alpha-helix (middle-left)
      ctx.fillStyle = 'rgba(224, 122, 95, 0.4)';
      ctx.beginPath();
      ctx.ellipse(toX(-65), toY(-45), (width / 360) * 35, (height / 360) * 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#E07A5F';
      ctx.stroke();

      // 3. Left-handed alpha-helix (middle-right, rare)
      ctx.fillStyle = 'rgba(212, 163, 115, 0.35)';
      ctx.beginPath();
      ctx.ellipse(toX(60), toY(45), (width / 360) * 25, (height / 360) * 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D4A373';
      ctx.stroke();

      // Labels on allowed zones
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#1d3557';
      ctx.fillText('β-Sheet Zone', toX(-140), toY(140));

      ctx.fillStyle = '#9c4221';
      ctx.fillText('Right-handed α-Helix', toX(-105), toY(-45));

      ctx.fillStyle = '#8c5826';
      ctx.fillText('Left-handed α (Gly)', toX(45), toY(45));

      // Current interactive point
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(toX(phi), toY(psi), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Update readout
      let regionName = 'Sterically Disallowed / Clashing';
      if (phi >= -160 && phi <= -50 && psi >= 90 && psi <= 170) {
        regionName = 'β-Sheet Conformation (Allowed)';
      } else if (Math.hypot(phi - (-65), psi - (-45)) <= 35) {
        regionName = 'Right-Handed α-Helix Conformation (Allowed)';
      } else if (Math.hypot(phi - 60, psi - 45) <= 25) {
        regionName = 'Left-Handed α-Helix Conformation (Allowed for Gly)';
      }

      if (this.ramaReadout) {
        this.ramaReadout.innerHTML = `
          <div class="rama-stat-line">
            <span><strong>φ (Phi):</strong> ${Math.round(phi)}°</span>
            <span><strong>ψ (Psi):</strong> ${Math.round(psi)}°</span>
          </div>
          <div class="rama-region-badge ${regionName.includes('Allowed') ? 'allowed' : 'disallowed'}">
            ${regionName}
          </div>
        `;
      }
    };

    // Mouse click / drag on canvas
    const updateFromMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const degX = (x / rect.width) * 360 - 180;
      const degY = 180 - (y / rect.height) * 360;
      currentPhi = Math.max(-180, Math.min(180, degX));
      currentPsi = Math.max(-180, Math.min(180, degY));
      drawPlot(currentPhi, currentPsi);
    };

    let isDragging = false;
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateFromMouse(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) updateFromMouse(e);
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Preset buttons for Ramachandran plot
    const presetBtns = document.querySelectorAll('.rama-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const phi = parseFloat(btn.dataset.phi);
        const psi = parseFloat(btn.dataset.psi);
        currentPhi = phi;
        currentPsi = psi;
        drawPlot(currentPhi, currentPsi);
      });
    });

    // Initial draw
    drawPlot(currentPhi, currentPsi);
  }
}
