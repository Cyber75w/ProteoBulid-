/**
 * ProteoBuild - Module 4: Stability, Denaturation & Renaturation Laboratory
 * Simulates environmental effects (Temperature, pH, Chemical Denaturants) on protein folding.
 * Features a dynamic Thermal Melting Curve (Canvas) and animated conformational state transitions.
 *
 * NOTE: Model outputs are conceptual educational simulations, not physical predictions.
 */

export class StabilityLab {
  constructor(options = {}) {
    this.showToast = options.showToast || null;

    // Current environmental conditions
    this.temp = 37.0; // °C
    this.pH = 7.4;
    this.denaturant = 0.0; // M Urea/GdnHCl

    // Intrinsic simulated protein parameters (illustrative model)
    this.baselineTm = 62.0; // °C (melting temperature at physiological pH & 0 M urea)
    this.optimalPH = 7.4;
    this.isAggregated = false;

    // DOM Elements
    this.tempSlider = document.getElementById('slider-temperature');
    this.tempDisplay = document.getElementById('val-temperature');
    this.phSlider = document.getElementById('slider-ph');
    this.phDisplay = document.getElementById('val-ph');
    this.denatSlider = document.getElementById('slider-denaturant');
    this.denatDisplay = document.getElementById('val-denaturant');

    this.meterScore = document.getElementById('stability-meter-score');
    this.meterStatus = document.getElementById('stability-meter-status');
    this.conformationCanvas = document.getElementById('conformation-canvas');
    this.curveCanvas = document.getElementById('melting-curve-canvas');
    this.explanationEl = document.getElementById('stability-explanation-text');

    this.init();
  }

  init() {
    this.bindEvents();
    this.bindPresets();
    this.update();
  }

  bindPresets() {
    const presetBtns = document.querySelectorAll('.env-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.temp !== undefined) {
          this.temp = parseFloat(btn.dataset.temp);
          if (this.tempSlider) this.tempSlider.value = this.temp;
          if (this.tempDisplay) this.tempDisplay.textContent = `${this.temp.toFixed(1)} °C`;
        }
        if (btn.dataset.ph !== undefined) {
          this.pH = parseFloat(btn.dataset.ph);
          if (this.phSlider) this.phSlider.value = this.pH;
          if (this.phDisplay) this.phDisplay.textContent = this.pH.toFixed(1);
        }
        if (btn.dataset.denat !== undefined) {
          this.denaturant = parseFloat(btn.dataset.denat);
          if (this.denatSlider) this.denatSlider.value = this.denaturant;
          if (this.denatDisplay) this.denatDisplay.textContent = `${this.denaturant.toFixed(1)} M`;
        }
        this.update();
        if (this.showToast) {
          this.showToast(`Applied preset: ${btn.textContent.trim()}`, 'info');
        }
      });
    });
  }

  bindEvents() {
    if (this.tempSlider) {
      this.tempSlider.addEventListener('input', (e) => {
        this.temp = parseFloat(e.target.value);
        if (this.tempDisplay) this.tempDisplay.textContent = `${this.temp.toFixed(1)} °C`;
        this.update();
      });
    }

    if (this.phSlider) {
      this.phSlider.addEventListener('input', (e) => {
        this.pH = parseFloat(e.target.value);
        if (this.phDisplay) this.phDisplay.textContent = this.pH.toFixed(1);
        this.update();
      });
    }

    if (this.denatSlider) {
      this.denatSlider.addEventListener('input', (e) => {
        this.denaturant = parseFloat(e.target.value);
        if (this.denatDisplay) this.denatDisplay.textContent = `${this.denaturant.toFixed(1)} M`;
        this.update();
      });
    }

    // Reset conditions button
    const resetBtn = document.getElementById('btn-reset-stability');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetConditions();
      });
    }

    // Attempt Renaturation button
    const renatBtn = document.getElementById('btn-attempt-renaturation');
    if (renatBtn) {
      renatBtn.addEventListener('click', () => {
        this.attemptRenaturation();
      });
    }

    // Responsive redraw
    window.addEventListener('resize', () => {
      this.drawMeltingCurve();
      this.drawConformationState();
    });
  }

  resetConditions() {
    this.temp = 37.0;
    this.pH = 7.4;
    this.denaturant = 0.0;
    this.isAggregated = false;

    if (this.tempSlider) this.tempSlider.value = 37;
    if (this.tempDisplay) this.tempDisplay.textContent = '37.0 °C';

    if (this.phSlider) this.phSlider.value = 7.4;
    if (this.phDisplay) this.phDisplay.textContent = '7.4';

    if (this.denatSlider) this.denatSlider.value = 0;
    if (this.denatDisplay) this.denatDisplay.textContent = '0.0 M';

    this.update();
  }

  /**
   * Conceptual thermodynamic stability calculation
   * Calculates Fraction Folded (theta: 0.0 to 1.0)
   */
  calculateStability() {
    if (this.isAggregated) {
      return { fractionFolded: 0.0, score: 0, effectiveTm: this.baselineTm, state: 'aggregated' };
    }

    // 1. pH penalty: deviation from optimal pH alters sidechain ionization and destabilizes salt bridges
    const phDeviation = Math.abs(this.pH - this.optimalPH);
    const phDestabilization = Math.pow(phDeviation / 3.2, 2.2) * 18.0; // shifts apparent Tm downward

    // 2. Denaturant penalty: Urea/GdnHCl lowers folding free energy linearly (m-value)
    const ureaDestabilization = this.denaturant * 5.8; // °C shift per Molar urea

    // Effective apparent Melting Temperature (Tm) under current pH and urea
    const effectiveTm = Math.max(10, this.baselineTm - phDestabilization - ureaDestabilization);

    // Two-state sigmoidal folding transition: fraction folded theta
    // Steep cooperativity slope factor k
    const k = 0.18;
    const fractionFolded = 1 / (1 + Math.exp(k * (this.temp - effectiveTm)));

    const score = Math.round(fractionFolded * 100);

    let state = 'native';
    if (fractionFolded < 0.25) {
      state = 'denatured';
    } else if (fractionFolded < 0.75) {
      state = 'molten-globule';
    }

    return { fractionFolded, score, effectiveTm, state };
  }

  update() {
    const { fractionFolded, score, effectiveTm, state } = this.calculateStability();

    // Check if heat was so high that aggregation occurred
    if (this.temp >= 85 && fractionFolded < 0.15) {
      this.isAggregated = true;
    }

    // Update Meter
    if (this.meterScore) {
      this.meterScore.textContent = `${score}%`;
      // Update circular conic gradient or meter background
      const meterParent = this.meterScore.closest('.stability-meter-ring');
      if (meterParent) {
        meterParent.style.background = `conic-gradient(var(--accent-teal, #81b29a) ${score * 3.6}deg, var(--border-color, #e2e8f0) ${score * 3.6}deg)`;
      }
    }

    if (this.meterStatus) {
      if (this.isAggregated) {
        this.meterStatus.textContent = 'Irreversibly Aggregated / Coagulated';
        this.meterStatus.className = 'meter-status-tag status-danger';
      } else if (state === 'native') {
        this.meterStatus.textContent = 'Native Folded Conformation';
        this.meterStatus.className = 'meter-status-tag status-success';
      } else if (state === 'molten-globule') {
        this.meterStatus.textContent = 'Partially Unfolded (Molten Globule)';
        this.meterStatus.className = 'meter-status-tag status-warning';
      } else {
        this.meterStatus.textContent = 'Denatured / Unfolded State';
        this.meterStatus.className = 'meter-status-tag status-danger';
      }
    }

    // Update Explanatory Text
    this.updateExplanation(fractionFolded, effectiveTm, state);

    // Draw Dynamic Graphs
    this.drawMeltingCurve(effectiveTm, fractionFolded);
    this.drawConformationState(fractionFolded);
  }

  updateExplanation(fractionFolded, effectiveTm, state) {
    if (!this.explanationEl) return;

    const notes = [];

    // Temperature note
    if (this.temp > effectiveTm + 5) {
      notes.push(`High thermal energy (${this.temp}°C) provides sufficient kinetic vibration to overcome non-covalent hydrogen bonds and hydrophobic packing, driving the equilibrium toward unfolded random coils.`);
    } else if (this.temp < 10) {
      notes.push(`Low temperatures slow molecular motion. In some specific proteins, cold denaturation can conceptually occur as the entropic benefit of water ordering diminishes.`);
    } else {
      notes.push(`Temperature (${this.temp}°C) remains within the favorable folding window below the effective melting temperature (Tm ≈ ${effectiveTm.toFixed(1)}°C).`);
    }

    // pH note
    if (this.pH < 4.0) {
      notes.push(`Acidic conditions (pH ${this.pH}) protonate carboxylate groups (Asp, Glu into -COOH), abolishing key salt bridges and creating electrostatic repulsion among unshielded positive charges.`);
    } else if (this.pH > 9.5) {
      notes.push(`Alkaline conditions (pH ${this.pH}) deprotonate ammonium groups (Lys, Arg into -NH2), disrupting stabilizing ionic contacts with acidic residues.`);
    } else {
      notes.push(`pH ${this.pH} preserves physiological ionization of catalytic and structural residues.`);
    }

    // Denaturant note
    if (this.denaturant > 0.5) {
      notes.push(`Chemical denaturant (${this.denaturant} M Urea) directly solvates the peptide backbone and nonpolar side chains, diminishing the hydrophobic effect that stabilizes the core.`);
    }

    if (this.isAggregated) {
      notes.push(`<strong>Aggregation Event:</strong> Severe thermal denaturation has exposed extensive hydrophobic patches, causing neighboring polypeptides to entangle into insoluble amorphous aggregates.`);
    }

    this.explanationEl.innerHTML = notes.map(n => `<p>${n}</p>`).join('');
  }

  attemptRenaturation() {
    const preScore = this.calculateStability().score;
    const feedbackBox = document.getElementById('renaturation-result-box');

    if (this.isAggregated) {
      const msg = 'Renaturation Failed: Severe thermal denaturation exposed extensive hydrophobic patches, triggering irreversible aggregation and tangle formation. Spontaneous refolding is blocked.';
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.className = 'renat-card renat-failed';
        feedbackBox.innerHTML = `<strong>❌ Renaturation Blocked:</strong> ${msg}`;
      }
      if (this.showToast) this.showToast(msg, 'error');
      return;
    }

    // Restore conditions to physiological
    this.resetConditions();
    const postScore = this.calculateStability().score;

    let msg = '';
    if (preScore < 25) {
      msg = `Renaturation Successful! After restoring physiological conditions (37.0°C, pH 7.4, 0 M Urea), non-covalent interactions reformed and the protein regained its native fold (${postScore}% folded), illustrating Anfinsen's classic principle.`;
    } else {
      msg = `Conditions restored to physiological baseline (37.0°C, pH 7.4, 0 M Urea). Protein conformation is 100% native folded state.`;
    }

    if (feedbackBox) {
      feedbackBox.style.display = 'block';
      feedbackBox.className = 'renat-card renat-success';
      feedbackBox.innerHTML = `<strong>✅ Renaturation Outcome:</strong> ${msg}`;
    }
    if (this.showToast) this.showToast(msg, 'success');
  }

  /**
   * Canvas Drawing: Dynamic Thermal Melting Curve
   * Plots Fraction Folded (theta) vs Temperature (°C)
   */
  drawMeltingCurve(effectiveTm = 62, currentFraction = 0.95) {
    if (!this.curveCanvas) return;
    const canvas = this.curveCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Padding
    const padL = 50;
    const padR = 25;
    const padT = 30;
    const padB = 40;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    const toX = temp => padL + ((temp - 10) / 90) * plotW;
    const toY = theta => padT + (1 - theta) * plotH;

    // Background
    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    // Y-grid (0.0, 0.5, 1.0)
    [0.0, 0.5, 1.0].forEach(val => {
      ctx.beginPath();
      ctx.moveTo(padL, toY(val));
      ctx.lineTo(width - padR, toY(val));
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(1), padL - 8, toY(val) + 3);
    });

    // X-grid (20, 40, 60, 80, 100 °C)
    [20, 40, 60, 80, 100].forEach(t => {
      ctx.beginPath();
      ctx.moveTo(toX(t), padT);
      ctx.lineTo(toX(t), height - padB);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${t}°C`, toX(t), height - padB + 16);
    });

    // Axis Labels
    ctx.fillStyle = '#334155';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Environmental Temperature (°C)', padL + plotW / 2, height - 8);

    ctx.save();
    ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Fraction Folded (θ)', 0, 0);
    ctx.restore();

    // Plot Melting Sigmoidal Curve under CURRENT environmental pH and denaturant
    const k = 0.18;
    ctx.beginPath();
    for (let t = 10; t <= 100; t += 0.5) {
      const theta = 1 / (1 + Math.exp(k * (t - effectiveTm)));
      const x = toX(t);
      const y = toY(theta);
      if (t === 10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#e07a5f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(toX(100), toY(0));
    ctx.lineTo(toX(10), toY(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(224, 122, 95, 0.1)';
    ctx.fill();

    // Tm (Melting Temperature) line where theta = 0.5
    const tmX = toX(effectiveTm);
    if (tmX >= padL && tmX <= width - padR) {
      ctx.strokeStyle = '#6a4c93';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tmX, padT);
      ctx.lineTo(tmX, height - padB);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#6a4c93';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Apparent Tm = ${effectiveTm.toFixed(1)}°C`, tmX, padT - 8);
    }

    // Current Operating Marker (Temperature vs Fraction Folded)
    const curX = toX(this.temp);
    const curY = toY(currentFraction);

    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label on marker
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Current: ${Math.round(currentFraction * 100)}% Folded`, Math.min(curX + 8, width - 110), Math.max(curY - 8, padT + 12));
  }

  /**
   * Dynamic visual representation of conformational morphing:
   * Native compact folded globule -> Molten globule -> Unfolded random coil
   */
  drawConformationState(fractionFolded = 0.95) {
    if (!this.conformationCanvas) return;
    const canvas = this.conformationCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // Disruption factor: 0.0 (Native) to 1.0 (Fully Denatured)
    const d = 1.0 - fractionFolded;

    // If aggregated, draw tangled clump
    if (this.isAggregated) {
      ctx.fillStyle = 'rgba(230, 57, 70, 0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const ang = i * 0.4;
        const rad = 20 + (i % 7) * 7;
        const x = cx + Math.cos(ang) * rad + Math.sin(i * 3) * 15;
        const y = cy + Math.sin(ang) * rad + Math.cos(i * 3) * 15;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Irreversible Aggregated Complex', cx, h - 20);
      return;
    }

    // 1. Hydrophobic Core (fades away as denaturation occurs)
    if (fractionFolded > 0.2) {
      const coreRadius = Math.max(0, (fractionFolded - 0.2) * 45);
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, coreRadius);
      grad.addColorStop(0, 'rgba(244, 162, 97, 0.7)');
      grad.addColorStop(1, 'rgba(244, 162, 97, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c57832';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      if (coreRadius > 20) {
        ctx.fillText('Buried Hydrophobic Core', cx, cy + 3);
      }
    }

    // 2. Polypeptide Backbone Chain
    // Native has tightly coiled regular loops; denatured expands into wide random coils
    const numNodes = 28;
    const nodes = [];
    const baseRadius = 55 + d * 65; // swells outward

    for (let i = 0; i < numNodes; i++) {
      const angle = (i / numNodes) * Math.PI * 2;
      // High d adds noise and expands radius
      const perturbation = Math.sin(i * 3 + d * 5) * (15 + d * 45);
      const r = baseRadius + perturbation;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      nodes.push({ x, y });
    }

    // Draw connecting backbone ribbon
    ctx.strokeStyle = fractionFolded > 0.7 ? '#81b29a' : (fractionFolded > 0.3 ? '#f4a261' : '#e07a5f');
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      const xc = (nodes[i].x + nodes[i - 1].x) / 2;
      const yc = (nodes[i].y + nodes[i - 1].y) / 2;
      ctx.quadraticCurveTo(nodes[i - 1].x, nodes[i - 1].y, xc, yc);
    }
    ctx.stroke();

    // Draw residue nodes
    nodes.forEach((n, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#3d5a80' : '#6a4c93';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Caption
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    const stateLabel = fractionFolded > 0.75 
      ? 'Native Conformation: Compact fold, buried hydrophobic core, intact H-bonds'
      : (fractionFolded > 0.35 
        ? 'Molten Globule Intermediate: Loosened packing, exposed core residues'
        : 'Denatured Conformation: Random coil polymer, destroyed tertiary fold');
    ctx.fillText(stateLabel, cx, h - 15);
  }
}
