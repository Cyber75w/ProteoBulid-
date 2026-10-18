/**
 * ProteoBuild - Module 1: Amino Acids & Sequence Builder
 * Handles interactive sequence composition, physicochemical property calculations,
 * and the peptide bond condensation reaction visualizer.
 */

import { AMINO_ACIDS, AA_BY_CODE1, AMINO_ACID_CATEGORIES } from './aminoData.js';
import { saveProtein, validateSequence } from './storage.js';

export class SequenceBuilder {
  constructor(options = {}) {
    this.sequence = []; // Array of 1-letter codes e.g. ['M', 'K', 'V']
    this.nameInput = document.getElementById('seq-name-input');
    this.notesInput = document.getElementById('seq-notes-input');
    this.sequenceDisplay = document.getElementById('sequence-tokens-container');
    this.rawSeqDisplay = document.getElementById('raw-sequence-text');
    this.lengthStat = document.getElementById('stat-length');
    this.mwStat = document.getElementById('stat-mw');
    this.piStat = document.getElementById('stat-pi');
    this.chargeStat = document.getElementById('stat-charge');
    this.gravyStat = document.getElementById('stat-gravy');
    this.compositionBar = document.getElementById('composition-bar-container');
    this.compositionLegend = document.getElementById('composition-legend');
    this.aaGrid = document.getElementById('aa-picker-grid');
    this.onSendToViewer = options.onSendToViewer || null;
    this.showToast = options.showToast || console.log;

    this.init();
  }

  init() {
    this.renderAminoAcidGrid();
    this.bindEvents();
    this.initCondensationViewer();
    // Default starter peptide (Myoglobin N-terminal motif)
    this.loadSequence('VLSEGEWQLVLHVWAKVEADVAG', 'Myoglobin N-Terminal Motif', 'Illustrative 23-residue amphipathic alpha-helical segment.');
  }

  renderAminoAcidGrid(activeFilter = 'all') {
    if (!this.aaGrid) return;
    this.aaGrid.innerHTML = '';

    const filtered = activeFilter === 'all' 
      ? AMINO_ACIDS 
      : AMINO_ACIDS.filter(aa => aa.category === activeFilter);

    filtered.forEach(aa => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `aa-btn cat-${aa.category}`;
      btn.dataset.code = aa.code1;
      btn.setAttribute('aria-label', `Add ${aa.name} (${aa.code3}, ${aa.code1}) to sequence`);
      
      const catInfo = AMINO_ACID_CATEGORIES[aa.category];
      btn.innerHTML = `
        <span class="aa-btn-top">
          <span class="aa-code1">${aa.code1}</span>
          <span class="aa-code3">${aa.code3}</span>
        </span>
        <span class="aa-name">${aa.name}</span>
        <span class="aa-mw">${aa.mw.toFixed(0)} Da</span>
      `;

      btn.addEventListener('click', () => {
        this.addResidue(aa.code1);
        this.inspectResidue(aa);
      });

      btn.addEventListener('mouseenter', () => {
        this.inspectResidue(aa, false);
      });

      this.aaGrid.appendChild(btn);
    });
  }

  inspectResidue(aa, pinDetails = true) {
    const detailPanel = document.getElementById('aa-inspect-detail');
    if (!detailPanel) return;

    const catInfo = AMINO_ACID_CATEGORIES[aa.category];
    detailPanel.innerHTML = `
      <div class="inspect-header" style="border-left: 4px solid ${catInfo.color}">
        <div class="inspect-title-group">
          <h4 class="inspect-title">${aa.name} <span class="inspect-badge">(${aa.code3} / ${aa.code1})</span></h4>
          <span class="category-tag" style="background:${catInfo.color}22; color:${catInfo.color}">
            ${catInfo.name}
          </span>
        </div>
        <div class="inspect-metrics">
          <span class="metric-pill" title="Molecular Weight"><strong>MW:</strong> ${aa.mw} g/mol</span>
          <span class="metric-pill" title="Isoelectric Point"><strong>pI:</strong> ${aa.pI.toFixed(2)}</span>
          <span class="metric-pill" title="Kyte-Doolittle Hydropathy Index"><strong>Hydropathy:</strong> ${aa.hydropathy > 0 ? '+' : ''}${aa.hydropathy}</span>
        </div>
      </div>
      <p class="inspect-desc">${aa.description}</p>
      <div class="inspect-properties-grid">
        <div class="prop-item">
          <span class="prop-label">Side Chain:</span>
          <span class="prop-value"><code>${aa.sideChain}</code></span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Formula:</span>
          <span class="prop-value">${aa.formula}</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Alpha-Helix Propensity:</span>
          <span class="prop-value">${aa.helixPropensity}</span>
        </div>
        <div class="prop-item">
          <span class="prop-label">Beta-Sheet Propensity:</span>
          <span class="prop-value">${aa.sheetPropensity}</span>
        </div>
        ${aa.pKaR ? `
        <div class="prop-item">
          <span class="prop-label">Sidechain pKa:</span>
          <span class="prop-value"><strong>${aa.pKaR}</strong></span>
        </div>` : ''}
      </div>
    `;
  }

  addResidue(code1) {
    if (this.sequence.length >= 250) {
      this.showToast('Sequence length capped at 250 residues for optimal interactive performance.', 'warning');
      return;
    }
    this.sequence.push(code1);
    this.updateUI();
  }

  removeResidueAt(index) {
    if (index >= 0 && index < this.sequence.length) {
      this.sequence.splice(index, 1);
      this.updateUI();
    }
  }

  clearSequence() {
    this.sequence = [];
    this.updateUI();
  }

  loadSequence(seqString, name = '', notes = '') {
    const val = validateSequence(seqString);
    if (!val.isValid) {
      this.showToast(`Invalid residues ignored: ${val.invalidChars.join(', ')}`, 'error');
    }
    this.sequence = val.cleanSequence.split('');
    if (name && this.nameInput) this.nameInput.value = name;
    if (notes && this.notesInput) this.notesInput.value = notes;
    this.updateUI();
  }

  bindEvents() {
    // Category filter tabs
    const filterTabs = document.querySelectorAll('.aa-filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderAminoAcidGrid(tab.dataset.category);
      });
    });

    // Clear button
    const clearBtn = document.getElementById('seq-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.sequence.length === 0) return;
        this.clearSequence();
        this.showToast('Sequence cleared.', 'info');
      });
    }

    // Undo / Backspace button
    const undoBtn = document.getElementById('seq-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (this.sequence.length > 0) {
          const removed = this.sequence.pop();
          this.updateUI();
          this.showToast(`Removed residue #${this.sequence.length + 1} (${removed})`, 'info');
        }
      });
    }

    // Random Motif button
    const randomBtn = document.getElementById('seq-random-btn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        const pool = ['A', 'L', 'V', 'I', 'F', 'S', 'T', 'K', 'E', 'D', 'G', 'P', 'R', 'N', 'Q', 'Y'];
        const randomLength = 12;
        const randomSeq = Array.from({ length: randomLength }, () => pool[Math.floor(Math.random() * pool.length)]).join('');
        this.loadSequence(randomSeq, 'Randomized Peptide Motif', 'Generated 12-residue sample motif for testing.');
        this.showToast('Generated random 12-residue peptide motif!', 'success');
      });
    }

    // Amino acid search input
    const searchInput = document.getElementById('aa-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const buttons = this.aaGrid.querySelectorAll('.aa-btn');
        buttons.forEach(btn => {
          const text = btn.textContent.toLowerCase();
          btn.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }

    // Save button
    const saveBtn = document.getElementById('seq-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = this.nameInput ? this.nameInput.value.trim() : 'My Custom Peptide';
        const notes = this.notesInput ? this.notesInput.value.trim() : '';
        const res = saveProtein({
          name: name || 'Custom Protein',
          sequence: this.sequence.join(''),
          notes: notes,
          category: 'User Created'
        });
        this.showToast(res.message, res.success ? 'success' : 'error');
        // Dispatch event for library update
        window.dispatchEvent(new CustomEvent('proteobuild:library-updated'));
      });
    }

    // Send to 3D Viewer button
    const sendBtn = document.getElementById('seq-send-viewer-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        if (this.sequence.length === 0) {
          this.showToast('Please add residues before viewing in 3D.', 'warning');
          return;
        }
        if (this.onSendToViewer) {
          this.onSendToViewer({
            sequence: this.sequence.join(''),
            name: this.nameInput ? this.nameInput.value : 'Custom Sequence'
          });
        }
      });
    }

    // Quick preset buttons
    const sampleBtns = document.querySelectorAll('.load-sample-seq-btn');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const seq = btn.dataset.seq;
        const name = btn.dataset.name;
        const notes = btn.dataset.notes || '';
        this.loadSequence(seq, name, notes);
        this.showToast(`Loaded sample: ${name}`, 'info');
      });
    });

    // Manual sequence text paste input
    const pasteInput = document.getElementById('manual-seq-paste-input');
    const pasteApplyBtn = document.getElementById('manual-seq-apply-btn');
    if (pasteApplyBtn && pasteInput) {
      pasteApplyBtn.addEventListener('click', () => {
        const raw = pasteInput.value.trim();
        if (!raw) return;
        this.loadSequence(raw, this.nameInput ? this.nameInput.value : 'Pasted Sequence');
        pasteInput.value = '';
        this.showToast('Sequence updated from input!', 'success');
      });
    }
  }

  updateUI() {
    this.renderSequenceTokens();
    this.calculatePhysicochemicalProperties();
  }

  renderSequenceTokens() {
    if (!this.sequenceDisplay) return;
    this.sequenceDisplay.innerHTML = '';

    if (this.sequence.length === 0) {
      this.sequenceDisplay.innerHTML = `
        <div class="empty-sequence-prompt">
          <p>No amino acids added yet. Click residues above or select a preset to begin assembling your primary structure.</p>
        </div>
      `;
      if (this.rawSeqDisplay) this.rawSeqDisplay.textContent = 'Empty sequence';
      return;
    }

    const rawStr = this.sequence.join('');
    if (this.rawSeqDisplay) {
      this.rawSeqDisplay.textContent = `${rawStr} (N -> C)`;
    }

    // N-terminus badge
    const nTerm = document.createElement('span');
    nTerm.className = 'terminus-badge n-terminus';
    nTerm.textContent = 'N-term (H2N-)';
    this.sequenceDisplay.appendChild(nTerm);

    this.sequence.forEach((code, index) => {
      const aa = AA_BY_CODE1.get(code);
      const token = document.createElement('div');
      token.className = `seq-token cat-${aa ? aa.category : 'unknown'}`;
      token.dataset.index = index;
      token.title = `${aa ? aa.name : code} (Position ${index + 1}) - Click to remove`;

      token.innerHTML = `
        <span class="token-pos">${index + 1}</span>
        <span class="token-code">${code}</span>
        <span class="token-remove" aria-label="Remove residue">&times;</span>
      `;

      token.addEventListener('click', () => {
        this.removeResidueAt(index);
      });

      this.sequenceDisplay.appendChild(token);
    });

    // C-terminus badge
    const cTerm = document.createElement('span');
    cTerm.className = 'terminus-badge c-terminus';
    cTerm.textContent = '(-COOH) C-term';
    this.sequenceDisplay.appendChild(cTerm);
  }

  /**
   * Biochemical calculation of Molecular Weight, Estimated pI, Net Charge at pH 7.4, and Hydropathy
   */
  calculatePhysicochemicalProperties() {
    const len = this.sequence.length;
    if (this.lengthStat) this.lengthStat.textContent = len;

    if (len === 0) {
      if (this.mwStat) this.mwStat.textContent = '0.0 Da';
      if (this.piStat) this.piStat.textContent = '—';
      if (this.chargeStat) this.chargeStat.textContent = '0.0';
      if (this.gravyStat) this.gravyStat.textContent = '0.00';
      this.renderCompositionBar({});
      return;
    }

    // 1. Molecular Weight: Sum of individual residue masses minus (N - 1) * 18.015 (H2O loss in condensation)
    let rawMassSum = 0;
    const counts = {};
    const categoryCounts = {
      'nonpolar-aliphatic': 0,
      'aromatic': 0,
      'polar-uncharged': 0,
      'positive-charge': 0,
      'negative-charge': 0
    };
    let totalHydropathy = 0;

    this.sequence.forEach(code => {
      const aa = AA_BY_CODE1.get(code);
      if (aa) {
        rawMassSum += aa.mw;
        totalHydropathy += aa.hydropathy;
        counts[code] = (counts[code] || 0) + 1;
        categoryCounts[aa.category] = (categoryCounts[aa.category] || 0) + 1;
      }
    });

    const waterLoss = (len - 1) * 18.015;
    const finalMW = Math.max(0, rawMassSum - waterLoss);
    if (this.mwStat) {
      this.mwStat.textContent = finalMW >= 1000 
        ? `${(finalMW / 1000).toFixed(2)} kDa (${finalMW.toFixed(1)} Da)`
        : `${finalMW.toFixed(1)} Da`;
    }

    // 2. Grand Average of Hydropathicity (GRAVY)
    const gravy = totalHydropathy / len;
    if (this.gravyStat) {
      this.gravyStat.textContent = (gravy > 0 ? '+' : '') + gravy.toFixed(2);
      this.gravyStat.className = gravy > 0 ? 'stat-value hydro-pos' : 'stat-value hydro-neg';
    }

    // 3. Net charge at physiological pH 7.4
    const netCharge74 = this.estimateNetChargeAtPH(7.4);
    if (this.chargeStat) {
      this.chargeStat.textContent = (netCharge74 > 0 ? '+' : '') + netCharge74.toFixed(2);
      this.chargeStat.className = netCharge74 > 0 ? 'stat-value charge-pos' : (netCharge74 < 0 ? 'stat-value charge-neg' : 'stat-value');
    }

    // 4. Isoelectric Point (pI) estimation via bisection method
    const estimatedPI = this.calculateIsoelectricPoint();
    if (this.piStat) {
      this.piStat.textContent = estimatedPI.toFixed(2);
    }

    // 5. Category composition bar
    this.renderCompositionBar(categoryCounts, len);
  }

  /**
   * Henderson-Hasselbalch charge calculation at given pH
   */
  estimateNetChargeAtPH(pH) {
    if (this.sequence.length === 0) return 0;

    // Terminal groups
    const nTermResidue = AA_BY_CODE1.get(this.sequence[0]);
    const cTermResidue = AA_BY_CODE1.get(this.sequence[this.sequence.length - 1]);

    const pKa_NTerm = nTermResidue ? nTermResidue.pKa2 : 9.60;
    const pKa_CTerm = cTermResidue ? cTermResidue.pKa1 : 2.34;

    // Positive charges: N-terminus + basic residues (Lys, Arg, His)
    let pos = 1 / (1 + Math.pow(10, pH - pKa_NTerm));

    // Negative charges: C-terminus + acidic residues (Asp, Glu, Cys, Tyr)
    let neg = 1 / (1 + Math.pow(10, pKa_CTerm - pH));

    this.sequence.forEach(code => {
      const aa = AA_BY_CODE1.get(code);
      if (!aa || !aa.pKaR) return;

      if (code === 'K' || code === 'R' || code === 'H') {
        // Base: BH+ <=> B + H+
        pos += 1 / (1 + Math.pow(10, pH - aa.pKaR));
      } else if (code === 'D' || code === 'E' || code === 'C' || code === 'Y') {
        // Acid: HA <=> A- + H+
        neg += 1 / (1 + Math.pow(10, aa.pKaR - pH));
      }
    });

    return pos - neg;
  }

  /**
   * Bisection numerical solver for pI where net charge = 0
   */
  calculateIsoelectricPoint() {
    let low = 0.0;
    let high = 14.0;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      const charge = this.estimateNetChargeAtPH(mid);
      if (Math.abs(charge) < 0.001) return mid;
      if (charge > 0) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return (low + high) / 2;
  }

  renderCompositionBar(catCounts, totalLen) {
    if (!this.compositionBar || !this.compositionLegend) return;
    this.compositionBar.innerHTML = '';
    this.compositionLegend.innerHTML = '';

    if (!totalLen || totalLen === 0) return;

    Object.keys(AMINO_ACID_CATEGORIES).forEach(catKey => {
      const count = catCounts[catKey] || 0;
      if (count === 0) return;
      const pct = ((count / totalLen) * 100).toFixed(1);
      const catInfo = AMINO_ACID_CATEGORIES[catKey];

      // Segment in bar
      const seg = document.createElement('div');
      seg.className = 'comp-segment';
      seg.style.width = `${pct}%`;
      seg.style.backgroundColor = catInfo.color;
      seg.title = `${catInfo.name}: ${count} (${pct}%)`;
      this.compositionBar.appendChild(seg);

      // Legend item
      const leg = document.createElement('div');
      leg.className = 'comp-legend-item';
      leg.innerHTML = `
        <span class="legend-swatch" style="background:${catInfo.color}"></span>
        <span class="legend-text">${catInfo.name}: <strong>${count}</strong> (${pct}%)</span>
      `;
      this.compositionLegend.appendChild(leg);
    });
  }

  /**
   * Peptide bond dehydration reaction interactive visualizer
   */
  initCondensationViewer() {
    const stepBtns = document.querySelectorAll('.condense-step-btn');
    const stepCards = document.querySelectorAll('.condense-step-card');
    if (!stepBtns.length) return;

    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = btn.dataset.step;
        stepBtns.forEach(b => b.classList.remove('active'));
        stepCards.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const activeCard = document.getElementById(`condense-step-${stepNum}`);
        if (activeCard) activeCard.classList.add('active');
      });
    });
  }
}
