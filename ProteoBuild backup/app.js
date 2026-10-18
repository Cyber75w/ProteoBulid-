/**
 * ProteoBuild - Master Application Controller
 * Coordinates views, navigation, theme switching, storage, 3D viewer, quizzes, and modals.
 */

import { initStorage, getSavedProteins, deleteProtein, renameProtein, resetToPresets, exportAsJSON, exportAsFASTA, importFromJSON, getProgress, markModuleStarted, markModuleCompleted, areAllQuizzesPassed, getOverallQuizStats } from './storage.js';
import { SequenceBuilder } from './sequenceBuilder.js';
import { SecondaryVisualizer } from './secondaryVisualizer.js';
import { ProteinViewer3D } from './viewer3d.js';
import { StabilityLab } from './stabilityLab.js';
import { renderQuiz } from './quizzes.js';

class ProteoBuildApp {
  constructor() {
    this.currentView = 'overview';
    this.sequenceBuilder = null;
    this.secondaryVisualizer = null;
    this.viewer3D = null;
    this.stabilityLab = null;

    this.init();
  }

  init() {
    // 1. Initialize persistent storage
    initStorage();

    // 2. Initialize Theme
    this.initTheme();

    // 3. Initialize Navigation & Routing
    this.initNavigation();

    // 4. Initialize Modals
    this.initModals();

    // 5. Initialize Sub-modules
    this.initSubmodules();

    // 6. Initialize Module Completion Handlers
    this.initModuleCompletion();

    // 7. Update Library Count & Table
    this.updateLibraryUI();

    // 8. Update Progress Display
    this.updateProgressUI();

    // Handle hash on initial load
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'module1', 'module2', 'module3', 'module4'].includes(hash)) {
      this.switchView(hash);
    }
  }

  /* --- Theme Controller --- */
  initTheme() {
    const savedTheme = localStorage.getItem('proteobuild_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.setTheme(savedTheme);

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
      });
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('proteobuild_theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  /* --- Navigation & View Switching --- */
  initNavigation() {
    // Nav links in header
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const target = link.dataset.target;
        this.switchView(target);
      });
    });

    // Launch module buttons in cards or hero
    document.addEventListener('click', (e) => {
      const launchBtn = e.target.closest('.launch-module-btn');
      if (launchBtn) {
        const target = launchBtn.dataset.target;
        this.switchView(target);
      }
    });

    // Begin learning path button in Hero
    const beginBtn = document.getElementById('btn-begin-learning');
    if (beginBtn) {
      beginBtn.addEventListener('click', () => {
        this.switchView('module1');
      });
    }

    // Hero library button
    const heroLibBtn = document.getElementById('btn-hero-library');
    if (heroLibBtn) {
      heroLibBtn.addEventListener('click', () => {
        this.openModal('modal-library');
      });
    }

    // Hash change listener
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['overview', 'module1', 'module2', 'module3', 'module4'].includes(hash)) {
        this.switchView(hash);
      }
    });
  }

  switchView(viewId) {
    this.currentView = viewId;
    window.location.hash = viewId;

    // Update active view DOM
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => {
      v.classList.toggle('active', v.id === `view-${viewId}`);
    });

    // Update active header nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.target === viewId);
    });

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Mark module as started in progress
    if (viewId.startsWith('module')) {
      markModuleStarted(viewId);
      this.updateProgressUI();
    }

    // Trigger viewer resize or init when opening Module 3
    if (viewId === 'module3') {
      setTimeout(() => {
        if (!this.viewer3D) {
          this.viewer3D = new ProteinViewer3D('three-canvas');
        } else {
          this.viewer3D.onResize();
        }
      }, 50);
    }

    // Trigger canvas redraws when opening Module 4
    if (viewId === 'module4' && this.stabilityLab) {
      setTimeout(() => {
        this.stabilityLab.update();
      }, 50);
    }
  }

  /* --- Submodule Initializations --- */
  initSubmodules() {
    // 1. Sequence Builder (Module 1)
    this.sequenceBuilder = new SequenceBuilder({
      showToast: (msg, type) => this.showToast(msg, type),
      onSendToViewer: (data) => {
        if (!this.viewer3D) {
          this.viewer3D = new ProteinViewer3D('three-canvas');
        }
        this.viewer3D.setCustomSequence(data.sequence, data.name);
        this.switchView('module3');
        this.showToast(`Loaded "${data.name}" into 3D Teaching Viewer!`, 'info');
      }
    });

    // 2. Secondary Visualizer (Module 2)
    this.secondaryVisualizer = new SecondaryVisualizer();

    // 3. Stability Laboratory (Module 4)
    this.stabilityLab = new StabilityLab({
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 4. Knowledge Check Quizzes for Modules 1 - 4
    renderQuiz('module1', 'quiz-container-module1', {
      onScoreUpdate: () => this.updateProgressUI()
    });
    renderQuiz('module2', 'quiz-container-module2', {
      onScoreUpdate: () => this.updateProgressUI()
    });
    renderQuiz('module3', 'quiz-container-module3', {
      onScoreUpdate: () => this.updateProgressUI()
    });
    renderQuiz('module4', 'quiz-container-module4', {
      onScoreUpdate: () => this.updateProgressUI()
    });

    window.addEventListener('proteobuild:quiz-updated', () => {
      this.updateProgressUI();
    });
  }

  /* --- Module Completion Handlers --- */
  initModuleCompletion() {
    document.addEventListener('click', (e) => {
      const completeBtn = e.target.closest('.mark-module-complete-btn');
      if (completeBtn) {
        const modId = completeBtn.dataset.module;
        const nextTarget = completeBtn.dataset.next;

        // Check if module quiz has been passed with >= 80%
        const progress = getProgress();
        const quiz = progress[modId] && progress[modId].quiz;
        const isPassed = quiz && quiz.passed && quiz.percentage >= 80;

        if (!isPassed) {
          const modNum = modId.replace('module', '');
          this.showToast(`⚠️ Please achieve at least 80% on the Module ${modNum} Knowledge Check to complete this module!`, 'warning');
          const quizSec = document.getElementById(`quiz-section-${modId}`);
          if (quizSec) {
            quizSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }

        markModuleCompleted(modId);
        this.updateProgressUI();

        const modNum = modId.replace('module', '');
        this.showToast(`🎉 Module ${modNum} Completed! Knowledge check verified.`, 'success');

        if (nextTarget === 'certificate') {
          setTimeout(() => {
            this.openCertificateModal();
          }, 350);
        } else if (nextTarget) {
          this.switchView(nextTarget);
        }
      }
    });
  }

  /* --- Progress Tracker --- */
  updateProgressUI() {
    const progress = getProgress();
    const modules = ['module1', 'module2', 'module3', 'module4'];
    let completedCount = 0;

    modules.forEach((modId, index) => {
      const p = progress[modId];
      const card = document.getElementById(`step-card-m${index + 1}`);

      if (p && p.completed) {
        completedCount++;
        if (card) {
          card.classList.add('completed');
          card.classList.remove('started');
        }
      } else if (p && p.started) {
        if (card) card.classList.add('started');
      }
    });

    const stats = getOverallQuizStats();
    const percent = Math.round((completedCount / modules.length) * 100);

    // Global progress fill (Fixed duplicate fillEl declaration bug)
    const fillEl = document.getElementById('global-progress-fill');
    if (fillEl) fillEl.style.width = `${percent}%`;

    // Header progress pill text
    const statusTextEl = document.getElementById('progress-status-text');
    if (statusTextEl) {
      statusTextEl.textContent = `${completedCount}/4 Modules • Quizzes: ${stats.passedCount}/4 (${stats.percentage}%)`;
    }

    const pillEl = document.getElementById('header-progress-pill');
    if (pillEl) {
      pillEl.classList.toggle('completed', stats.allPassed && completedCount === 4);
    }

    // Hero certificate button
    const certBtn = document.getElementById('btn-hero-certificate');
    if (certBtn) {
      certBtn.style.display = 'inline-flex';
      if (stats.allPassed) {
        certBtn.innerHTML = `<span>🎓 View Certificate of Mastery (${stats.percentage}%)</span>`;
        certBtn.className = 'btn btn-primary';
      } else {
        certBtn.innerHTML = `<span>🔒 Certificate (${stats.passedCount}/4 Quizzes Passed)</span>`;
        certBtn.className = 'btn btn-outline';
      }
    }
  }

  /* --- Protein Library Modal & Table --- */
  updateLibraryUI() {
    const proteins = getSavedProteins();

    // Badge count in header
    const badge = document.getElementById('library-count-badge');
    if (badge) badge.textContent = proteins.length;

    // Table body
    const tbody = document.getElementById('library-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (proteins.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">No proteins in library. Create a sequence or restore presets.</td></tr>`;
      return;
    }

    proteins.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${p.name}</strong>
          ${p.notes ? `<div style="font-size:0.75rem; color:var(--text-muted);">${p.notes}</div>` : ''}
        </td>
        <td><span class="category-tag" style="background:var(--bg-secondary); color:var(--text-secondary);">${p.category || 'Peptide'}</span></td>
        <td><code>${p.sequence ? p.sequence.length : 0} aa</code></td>
        <td class="library-actions-cell">
          <button type="button" class="btn btn-outline btn-sm action-load-builder" title="Load into Sequence Builder">✏️ Build</button>
          <button type="button" class="btn btn-outline btn-sm action-view-3d" title="Inspect in 3D Viewer">👁️ 3D</button>
          <button type="button" class="btn btn-outline btn-sm action-export-fasta" title="Export FASTA">📄 FASTA</button>
          <button type="button" class="btn btn-outline btn-sm action-rename" title="Rename Protein">✏️</button>
          <button type="button" class="btn btn-outline btn-sm action-delete" style="color:var(--accent-danger);" title="Delete Protein">🗑️</button>
        </td>
      `;

      // Load into Builder
      tr.querySelector('.action-load-builder').addEventListener('click', () => {
        if (this.sequenceBuilder) {
          this.sequenceBuilder.loadSequence(p.sequence, p.name, p.notes);
        }
        this.closeModal('modal-library');
        this.switchView('module1');
        this.showToast(`Loaded "${p.name}" into Sequence Builder!`, 'info');
      });

      // View in 3D
      tr.querySelector('.action-view-3d').addEventListener('click', () => {
        if (!this.viewer3D) {
          this.viewer3D = new ProteinViewer3D('three-canvas');
        }
        this.viewer3D.setCustomSequence(p.sequence, p.name);
        this.closeModal('modal-library');
        this.switchView('module3');
        this.showToast(`Viewing "${p.name}" in 3D Teaching Viewer!`, 'info');
      });

      // Export FASTA
      tr.querySelector('.action-export-fasta').addEventListener('click', () => {
        const res = exportAsFASTA(p);
        this.showToast(res.message, res.success ? 'success' : 'error');
      });

      // Rename
      tr.querySelector('.action-rename').addEventListener('click', () => {
        const newName = prompt('Enter new name for protein:', p.name);
        if (newName && newName.trim()) {
          const res = renameProtein(p.id, newName.trim());
          this.showToast(res.message, res.success ? 'success' : 'error');
          this.updateLibraryUI();
        }
      });

      // Delete
      tr.querySelector('.action-delete').addEventListener('click', () => {
        if (confirm(`Delete "${p.name}" from your local library?`)) {
          const res = deleteProtein(p.id);
          this.showToast(res.message, res.success ? 'success' : 'error');
          this.updateLibraryUI();
        }
      });

      tbody.appendChild(tr);
    });
  }

  /* --- Modals Controller --- */
  initModals() {
    // Open library
    const openLibBtn = document.getElementById('btn-open-library');
    if (openLibBtn) {
      openLibBtn.addEventListener('click', () => {
        this.updateLibraryUI();
        this.openModal('modal-library');
      });
    }

    // Open about
    const openAboutBtn = document.getElementById('btn-open-about');
    if (openAboutBtn) {
      openAboutBtn.addEventListener('click', () => {
        this.openModal('modal-about');
      });
    }

    // Claim certificate
    const claimCertBtn = document.getElementById('btn-claim-certificate');
    if (claimCertBtn) {
      claimCertBtn.addEventListener('click', () => {
        this.openCertificateModal();
      });
    }

    const heroCertBtn = document.getElementById('btn-hero-certificate');
    if (heroCertBtn) {
      heroCertBtn.addEventListener('click', () => {
        this.openCertificateModal();
      });
    }

    // Close buttons
    const closeBtns = document.querySelectorAll('.close-modal-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        this.closeModal(modalId);
      });
    });

    // Close on backdrop click
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => {
      b.addEventListener('click', (e) => {
        if (e.target === b) {
          b.classList.remove('active');
        }
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        backdrops.forEach(b => b.classList.remove('active'));
      }
    });

    // Export all JSON
    const exportJsonBtn = document.getElementById('btn-export-all-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        const proteins = getSavedProteins();
        const res = exportAsJSON(proteins, 'proteobuild-library.json');
        this.showToast(res.message, res.success ? 'success' : 'error');
      });
    }

    // Restore Presets
    const restorePresetsBtn = document.getElementById('btn-reset-presets');
    if (restorePresetsBtn) {
      restorePresetsBtn.addEventListener('click', () => {
        if (confirm('Restore factory educational presets? This will reset your library list.')) {
          const res = resetToPresets();
          this.showToast(res.message, res.success ? 'success' : 'error');
          this.updateLibraryUI();
        }
      });
    }

    // Import JSON File
    const importInput = document.getElementById('input-import-json');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = importFromJSON(event.target.result);
          this.showToast(res.message, res.success ? 'success' : 'error');
          if (res.warnings && res.warnings.length > 0) {
            console.warn('Import warnings:', res.warnings);
          }
          this.updateLibraryUI();
          importInput.value = '';
        };
        reader.onerror = () => {
          this.showToast('Failed to read file from disk.', 'error');
        };
        reader.readAsText(file);
      });
    }

    // Listen to library-updated custom event
    window.addEventListener('proteobuild:library-updated', () => {
      this.updateLibraryUI();
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /* --- Certificate of Mastery Modal Controller --- */
  openCertificateModal() {
    const stats = getOverallQuizStats();
    const container = document.getElementById('cert-modal-body-container');
    const isUnlocked = stats.allPassed; // All 4 module quizzes have >= 80%

    if (container) {
      if (isUnlocked) {
        container.innerHTML = this.renderVerifiedCertificateHTML(stats);
        this.bindCertificateEvents();
      } else {
        container.innerHTML = this.renderLockedCertificateHTML(stats);
        this.bindLockedCertificateEvents();
      }
    }

    this.openModal('modal-certificate');
  }

  renderVerifiedCertificateHTML(stats) {
    const savedName = localStorage.getItem('proteobuild_student_name') || 'Biotechnology Student';
    const completionDate = stats.completedAt ? new Date(stats.completedAt) : new Date();
    const formattedDate = completionDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    return `
      <div class="cert-frame">
        <div class="cert-header-icon">🧬 🎓 🧬</div>
        <h2 class="cert-main-title">ProteoBuild Certificate of Mastery</h2>
        <p class="cert-sub-title">Protein Structure, Folding & Stability • Biotechnology Capstone (BIA01 Unit III)</p>

        <div class="cert-score-pill">
          🏆 Curriculum Mastery: ${stats.percentage}% (${stats.totalScore}/${stats.totalQuestions} Questions Correct)
        </div>

        <p style="font-size:0.95rem; margin-bottom:0.25rem;">This certifies that</p>
        <div class="cert-student-input-wrap">
          <input type="text" id="cert-student-name" class="form-input" value="${savedName}" style="font-size:1.35rem; font-weight:700; text-align:center;" aria-label="Student Full Name" placeholder="Enter Full Name">
        </div>

        <p class="cert-desc-text">
          has successfully completed all four interactive modules and demonstrated curriculum mastery across: 
          Primary Sequence Chemistry, Secondary Hydrogen-Bonding Geometry, 3D Tertiary & Quaternary Architecture, and Thermodynamics of Denaturation.
        </p>

        <!-- 4 Module Badges Grid -->
        <div class="cert-badges-grid">
          <div class="cert-badge-card">
            <span class="badge-icon">🧬</span>
            <span class="badge-title">Module 1: Primary</span>
            <span class="badge-score">${stats.moduleDetails.module1.percentage}% Passed</span>
          </div>
          <div class="cert-badge-card">
            <span class="badge-icon">🌀</span>
            <span class="badge-title">Module 2: Secondary</span>
            <span class="badge-score">${stats.moduleDetails.module2.percentage}% Passed</span>
          </div>
          <div class="cert-badge-card">
            <span class="badge-icon">🌐</span>
            <span class="badge-title">Module 3: 3D Structure</span>
            <span class="badge-score">${stats.moduleDetails.module3.percentage}% Passed</span>
          </div>
          <div class="cert-badge-card">
            <span class="badge-icon">🌡️</span>
            <span class="badge-title">Module 4: Stability</span>
            <span class="badge-score">${stats.moduleDetails.module4.percentage}% Passed</span>
          </div>
        </div>

        <!-- Verification Metadata Row -->
        <div class="cert-meta-row">
          <div>
            <strong>Issued on:</strong> <span>${formattedDate}</span>
          </div>
          <div>
            <strong>Verification Code:</strong> <span class="cert-verify-tag">${stats.certificateCode}</span>
          </div>
          <div>
            <span style="color:#107e50; font-weight:700;">✓ Verified Capstone Mastery</span>
          </div>
        </div>
      </div>
    `;
  }

  renderLockedCertificateHTML(stats) {
    const modules = [
      { id: 'module1', num: 1, name: 'Amino Acids & Primary Structure', icon: '🧬' },
      { id: 'module2', num: 2, name: 'Secondary Structure Patterns', icon: '🌀' },
      { id: 'module3', num: 3, name: '3D Tertiary & Quaternary Structure', icon: '🌐' },
      { id: 'module4', num: 4, name: 'Stability, Denaturation & Renaturation', icon: '🌡️' }
    ];

    let itemsHTML = '';
    modules.forEach(m => {
      const q = stats.moduleDetails[m.id];
      const isPassed = q && q.passed;
      itemsHTML += `
        <div class="cert-status-item ${isPassed ? 'passed' : 'pending'}">
          <div class="cert-status-item-info">
            <span class="cert-status-item-name">${m.icon} Module ${m.num}: ${m.name}</span>
            <span class="cert-status-item-detail">
              ${isPassed ? `Score: ${q.percentage}% (${q.score}/${q.total}) • Requirement Met ✅` : (q.score > 0 ? `Current: ${q.percentage}% (${q.score}/${q.total}) • Needs ≥ 80% to pass` : 'Quiz Not Yet Attempted')}
            </span>
          </div>
          <button type="button" class="btn btn-outline btn-sm cert-jump-btn" data-module="${m.id}">
            ${isPassed ? 'Review' : 'Take Quiz ➔'}
          </button>
        </div>
      `;
    });

    return `
      <div class="cert-locked-box">
        <div class="cert-locked-icon">🔒</div>
        <h3 class="cert-locked-title">Certificate of Mastery Locked</h3>
        <p class="cert-locked-desc">
          To unlock your verified <strong>ProteoBuild Certificate of Mastery</strong>, you must score at least <strong>80%</strong> on all four module knowledge checks.
        </p>

        <div style="font-size:0.95rem; font-weight:700; margin-bottom:1rem; color:var(--accent-lavender);">
          Current Status: ${stats.passedCount} of 4 Modules Mastered (${stats.percentage}% overall quiz score)
        </div>

        <div class="cert-modules-status-list">
          ${itemsHTML}
        </div>
      </div>
    `;
  }

  bindCertificateEvents() {
    const studentInput = document.getElementById('cert-student-name');
    if (studentInput) {
      studentInput.addEventListener('input', (e) => {
        localStorage.setItem('proteobuild_student_name', e.target.value.trim());
      });
    }
  }

  bindLockedCertificateEvents() {
    const jumpBtns = document.querySelectorAll('.cert-jump-btn');
    jumpBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const modId = btn.dataset.module;
        this.closeModal('modal-certificate');
        this.switchView(modId);
        setTimeout(() => {
          const quizSec = document.getElementById(`quiz-section-${modId}`);
          if (quizSec) {
            quizSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      });
    });
  }


  /* --- Toast Notifications --- */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `
      <span style="font-size:1.1rem;">${icon}</span>
      <span style="flex:1;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Bootstrap application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.proteoBuildApp = new ProteoBuildApp();
});
