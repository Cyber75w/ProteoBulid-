/**
 * ProteoBuild - Knowledge Checks & Reflection Quizzes
 * Aligned with BIA01 Unit III Syllabus requirements.
 * Provides immediate pedagogical feedback for each option.
 */

import { saveQuizResult, getQuizResult, getProgress } from './storage.js';

export const MODULE_QUIZZES = {
  module1: {
    title: 'Module 1 Knowledge Check: Amino Acids & Primary Structure',
    description: 'Test your understanding of amino acid backbone anatomy, side chain properties, and sequence directionality.',
    questions: [
      {
        id: 'm1_q1',
        prompt: 'Which chemical component is uniquely variable among the 20 standard amino acids and governs their diverse physicochemical behaviors?',
        options: [
          { text: 'The alpha-amino group (-NH2)', isCorrect: false, explanation: 'Incorrect. The alpha-amino group is an invariant part of the common peptide backbone.' },
          { text: 'The alpha-carboxyl group (-COOH)', isCorrect: false, explanation: 'Incorrect. The alpha-carboxyl group is identical across standard amino acids and forms the backbone.' },
          { text: 'The variable side chain (R-group)', isCorrect: true, explanation: 'Correct! The R-group varies from a single hydrogen atom (in Glycine) to bulky aromatic or charged rings, determining polarity, charge, and folding propensities.' },
          { text: 'The central alpha-carbon atom', isCorrect: false, explanation: 'Incorrect. The alpha-carbon is the central chiral anchor present in all 20 amino acids (achiral in Glycine).' }
        ]
      },
      {
        id: 'm1_q2',
        prompt: 'When two amino acids undergo a condensation reaction to form a peptide bond, which molecule is eliminated?',
        options: [
          { text: 'Carbon dioxide (CO2)', isCorrect: false, explanation: 'Incorrect. CO2 is lost during decarboxylation, not during peptide bond formation.' },
          { text: 'A water molecule (H2O)', isCorrect: true, explanation: 'Correct! The hydroxyl (-OH) from the carboxyl group of one residue combines with a hydrogen (-H) from the amino group of the next residue, releasing one H2O molecule (dehydration synthesis).' },
          { text: 'Ammonia (NH3)', isCorrect: false, explanation: 'Incorrect. Nitrogen is preserved in the resulting -CO-NH- amide linkage.' },
          { text: 'A methane molecule (CH4)', isCorrect: false, explanation: 'Incorrect. Hydrocarbon groups are not eliminated in this reaction.' }
        ]
      },
      {
        id: 'm1_q3',
        prompt: 'If you reverse the amino-acid sequence from N-terminus-to-C-terminus to C-terminus-to-N-terminus, has the primary structure changed?',
        options: [
          { text: 'No, because the same amino acid residues are present in the polypeptide.', isCorrect: false, explanation: 'Incorrect. Polypeptides have intrinsic chemical polarity (N-terminus to C-terminus). Directionality is fundamental to primary structure.' },
          { text: 'Yes, because the chemical directionality and local neighbor interactions are completely altered.', isCorrect: true, explanation: 'Correct! Polypeptides have defined chemical polarity (N -> C). An Ala-Gly-Val peptide has a free amino group on Alanine and free carboxyl on Valine, which is chemically distinct from Val-Gly-Ala.' },
          { text: 'Only if the sequence contains charged amino acids like Lysine or Aspartate.', isCorrect: false, explanation: 'Incorrect. All peptide sequences have N-to-C polarity regardless of their residue charges.' },
          { text: 'No, secondary structures fold identically regardless of sequence direction.', isCorrect: false, explanation: 'Incorrect. Reverse sequences have different backbone dipole orientations and steric relationships.' }
        ]
      }
    ]
  },

  module2: {
    title: 'Module 2 Knowledge Check: Secondary Structure Patterns',
    description: 'Verify your grasp of alpha-helices, beta-sheets, and the stabilizing role of backbone hydrogen bonds.',
    questions: [
      {
        id: 'm2_q1',
        prompt: 'What primary non-covalent force directly stabilizes the repetitive geometry of both alpha-helices and beta-sheets?',
        options: [
          { text: 'Hydrogen bonds between backbone carbonyl oxygens (C=O) and amide nitrogens (N-H)', isCorrect: true, explanation: 'Correct! Secondary structure is defined by regular, repeating hydrogen bonds between the polypeptide backbone amide groups, independent of side-chain specifics.' },
          { text: 'Hydrophobic forces clustering aromatic side chains in the core', isCorrect: false, explanation: 'Incorrect. Hydrophobic collapse drives tertiary folding, but regular secondary patterns are stabilized primarily by backbone H-bonds.' },
          { text: 'Covalent disulfide bonds between cysteine residues', isCorrect: false, explanation: 'Incorrect. Disulfide bonds crosslink distant portions of tertiary and quaternary structures, not standard secondary backbone repeats.' },
          { text: 'Ionic salt bridges between opposing surface charges', isCorrect: false, explanation: 'Incorrect. Salt bridges can stabilize or destabilize specific helices, but backbone H-bonds are the defining structural glue.' }
        ]
      },
      {
        id: 'm2_q2',
        prompt: 'In a standard right-handed alpha-helix, each peptide carbonyl group (C=O) at residue i forms a hydrogen bond with the amide N-H group of which residue?',
        options: [
          { text: 'Residue i + 1 (adjacent residue)', isCorrect: false, explanation: 'Incorrect. Residues i and i+1 cannot form an intra-chain H-bond due to backbone steric constraints.' },
          { text: 'Residue i + 2', isCorrect: false, explanation: 'Incorrect. i+2 H-bonding would create an overly tight, strained 2.2_7 helix, not an alpha-helix.' },
          { text: 'Residue i + 4', isCorrect: true, explanation: 'Correct! Standard alpha-helices follow the classic i -> i+4 backbone hydrogen bonding rule (3.6 residues per turn, 5.4 Å pitch).' },
          { text: 'An adjacent strand on a neighboring subunit', isCorrect: false, explanation: 'Incorrect. Alpha-helices are formed by localized intra-chain hydrogen bonds along a single continuous segment.' }
        ]
      },
      {
        id: 'm2_q3',
        prompt: 'Why are Proline and Glycine commonly referred to as "alpha-helix breakers"?',
        options: [
          { text: 'They carry extreme electric charges that repel the helical dipole.', isCorrect: false, explanation: 'Incorrect. Both Glycine and Proline have uncharged, nonpolar side chains.' },
          { text: 'Proline lacks a backbone amide hydrogen and has a rigid ring, while Glycine has excessive conformational flexibility.', isCorrect: true, explanation: 'Correct! Proline’s cyclic ring locks phi near -65° and lacks an amide H to donate; Glycine lacks a side chain, causing entropic cost and flexibility that destabilizes the tight helix.' },
          { text: 'They form covalent disulfide bonds that rupture the helix axis.', isCorrect: false, explanation: 'Incorrect. Only Cysteine forms disulfide bonds.' },
          { text: 'They can only exist in beta-sheet configurations.', isCorrect: false, explanation: 'Incorrect. Proline and Glycine are frequently found in reverse turns, loops, and collagen, not broad sheets.' }
        ]
      }
    ]
  },

  module3: {
    title: 'Module 3 Knowledge Check: Tertiary & Quaternary Structure',
    description: 'Assess your understanding of 3D single-chain folding versus multi-subunit quaternary architecture.',
    questions: [
      {
        id: 'm3_q1',
        prompt: 'What is the defining distinction between protein tertiary structure and quaternary structure?',
        options: [
          { text: 'Tertiary structure involves covalent bonds, while quaternary structure never uses covalent bonds.', isCorrect: false, explanation: 'Incorrect. Both tertiary and quaternary structures can be stabilized by non-covalent forces and occasionally disulfide bridges.' },
          { text: 'Tertiary structure is the 3D folding of a single polypeptide chain, whereas quaternary structure is the spatial arrangement of multiple separate polypeptide subunits.', isCorrect: true, explanation: 'Correct! Tertiary structure describes the complete 3D conformation of one polypeptide chain; quaternary structure refers to the assembly of two or more distinct chains (subunits).' },
          { text: 'Tertiary structure only has alpha-helices, while quaternary structure contains only beta-sheets.', isCorrect: false, explanation: 'Incorrect. Secondary structure composition varies widely across all levels of structural complexity.' },
          { text: 'Quaternary structure only exists in denatured or unfolded proteins.', isCorrect: false, explanation: 'Incorrect. Quaternary structure is a feature of mature, active native complexes such as hemoglobin and ATP synthase.' }
        ]
      },
      {
        id: 'm3_q2',
        prompt: 'Which thermodynamic driving force is widely considered the primary factor in compacting a globular protein into its native tertiary fold in an aqueous environment?',
        options: [
          { text: 'The hydrophobic effect (burying nonpolar residues to maximize water solvent entropy)', isCorrect: true, explanation: 'Correct! Folding buries nonpolar side chains in the interior core, releasing structured hydration shells of water molecules and yielding a favorable increase in solvent entropy.' },
          { text: 'Gravitational attraction between high-molecular-weight amino acids', isCorrect: false, explanation: 'Incorrect. Gravitational forces are negligible at the molecular and atomic scales.' },
          { text: 'Continuous covalent peptide bond polymerization', isCorrect: false, explanation: 'Incorrect. Covalent polymerization creates the primary sequence; it does not drive 3D thermodynamic collapse.' },
          { text: 'Magnetic repulsion between alpha carbons', isCorrect: false, explanation: 'Incorrect. Magnetic forces play no role in standard biochemical protein folding.' }
        ]
      },
      {
        id: 'm3_q3',
        prompt: 'Regarding the 3D model in ProteoBuild: what is the scientific relationship between a custom sequence you type and the rendered 3D visual geometry?',
        options: [
          { text: 'ProteoBuild runs an ab-initio molecular dynamics simulation to compute the exact atomic coordinates.', isCorrect: false, explanation: 'Incorrect. ProteoBuild is explicitly a simplified educational tool, not an ab-initio folding simulator or molecular dynamics package.' },
          { text: 'The visual is an illustrative educational model meant to teach structural concepts, not a scientifically predictive folding calculation.', isCorrect: true, explanation: 'Correct! ProteoBuild provides clear educational representations of ribbons, subunits, and forces, but does not calculate physical conformational folding from sequence.' },
          { text: 'ProteoBuild queries an online PDB database server to obtain crystallographic coordinates.', isCorrect: false, explanation: 'Incorrect. The app runs client-side as a static learning simulator without backend database dependencies.' },
          { text: 'The sequence mathematically dictates the exact angstrom coordinates via quantum mechanics.', isCorrect: false, explanation: 'Incorrect. Real structure prediction requires complex algorithms (e.g. AlphaFold) or physical biophysical experiments (X-ray, Cryo-EM, NMR).' }
        ]
      }
    ]
  },

  module4: {
    title: 'Module 4 Knowledge Check: Stability, Denaturation & Renaturation',
    description: 'Test your grasp of environmental denaturation factors and the thermodynamic principles of folding reversibility.',
    questions: [
      {
        id: 'm4_q1',
        prompt: 'What occurs biochemically when a protein undergoes denaturation?',
        options: [
          { text: 'The covalent peptide bonds in the primary sequence are completely hydrolyzed into free amino acids.', isCorrect: false, explanation: 'Incorrect. Denaturation disrupts higher-order secondary, tertiary, and quaternary structures; the primary covalent peptide backbone remains intact.' },
          { text: 'Non-covalent bonds (H-bonds, salt bridges, hydrophobic packing) are disrupted, causing loss of the functional native 3D shape.', isCorrect: true, explanation: 'Correct! Denaturation disrupts the secondary and tertiary structural architecture without breaking the primary covalent backbone bonds.' },
          { text: 'All amino acids convert into their mirror-image D-stereoisomers.', isCorrect: false, explanation: 'Incorrect. Racemization does not occur during standard physical denaturation.' },
          { text: 'The protein immediately doubles its molecular weight through nuclear fusion.', isCorrect: false, explanation: 'Incorrect. Mass is conserved; no nuclear processes occur.' }
        ]
      },
      {
        id: 'm4_q2',
        prompt: 'Why does an extreme shift in environmental pH (e.g., pH 2 or pH 12) frequently destabilize a protein\'s native tertiary structure?',
        options: [
          { text: 'It breaks all covalent carbon-carbon bonds in the side chains.', isCorrect: false, explanation: 'Incorrect. Standard covalent C-C bonds are stable across normal pH ranges.' },
          { text: 'It alters the protonation states of ionizable side chains (Asp, Glu, Lys, Arg, His), disrupting vital stabilizing salt bridges and electrostatic interactions.', isCorrect: true, explanation: 'Correct! At extreme pH, carboxylates (-COO-) become protonated neutral (-COOH) or amines (-NH3+) become deprotonated neutral (-NH2), abolishing key electrostatic salt bridges and introducing repulsive like-charges.' },
          { text: 'It eliminates water molecules completely from the solvent.', isCorrect: false, explanation: 'Incorrect. Water remains the solvent regardless of acid/base concentration.' },
          { text: 'It causes all aromatic residues to evaporate.', isCorrect: false, explanation: 'Incorrect. Aromatic side chains remain in the polypeptide.' }
        ]
      },
      {
        id: 'm4_q3',
        prompt: 'What did Christian Anfinsen’s classic ribonuclease A experiment famously demonstrate regarding protein renaturation?',
        options: [
          { text: 'All proteins in nature renature spontaneously under all conditions without exception.', isCorrect: false, explanation: 'Incorrect. Many proteins aggregate irreversibly upon denaturation or require molecular chaperones (Hsp70, GroEL) to fold properly in vivo.' },
          { text: 'The primary amino-acid sequence contains the necessary thermodynamic information to direct 3D folding into the native state under appropriate conditions.', isCorrect: true, explanation: 'Correct! Anfinsen showed that when urea and beta-mercaptoethanol were dialyzed away under gentle conditions, denatured ribonuclease regained its active native structure, proving sequence dictates fold.' },
          { text: 'Denaturation is strictly irreversible for every biological macromolecule.', isCorrect: false, explanation: 'Incorrect. Anfinsen proved that renaturation is possible in suitable conditions for specific proteins.' },
          { text: 'Renaturation requires external ATP hydrolysis even for small single-domain proteins.', isCorrect: false, explanation: 'Incorrect. Purified ribonuclease renatures spontaneously in vitro without ATP.' }
        ]
      }
    ]
  }
};

/**
 * Render an interactive quiz for a specific module inside a DOM container
 * @param {string} moduleId - 'module1' | 'module2' | 'module3' | 'module4'
 * @param {string|HTMLElement} containerId - Container element or ID
 * @param {Object} options - Callback options { onScoreUpdate, showToast }
 */
export function renderQuiz(moduleId, containerId, options = {}) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const quizData = MODULE_QUIZZES[moduleId];
  if (!quizData) return;

  // Retrieve saved quiz state from storage
  const saved = getQuizResult(moduleId);
  const answers = saved && saved.answers ? { ...saved.answers } : {};

  // Build Quiz DOM
  container.innerHTML = '';

  // 1. Header Banner
  const headerBanner = document.createElement('div');
  headerBanner.className = 'quiz-status-header';
  updateHeaderBanner(headerBanner, quizData, answers);
  container.appendChild(headerBanner);

  // 2. Questions Container
  const questionsList = document.createElement('div');
  questionsList.className = 'quiz-container';

  quizData.questions.forEach((q, qIndex) => {
    const qCard = document.createElement('div');
    qCard.className = 'question-card';
    qCard.id = `qcard-${q.id}`;

    const selectedOptionIdx = answers[q.id] !== undefined ? answers[q.id] : null;
    const isAnswered = selectedOptionIdx !== null;
    const selectedOpt = isAnswered ? q.options[selectedOptionIdx] : null;
    const isCorrect = selectedOpt ? selectedOpt.isCorrect : false;

    // Question Meta
    const metaRow = document.createElement('div');
    metaRow.className = 'question-meta';
    metaRow.innerHTML = `
      <span>Question ${qIndex + 1} of ${quizData.questions.length}</span>
      <span class="question-status-pill ${isAnswered ? (isCorrect ? 'answered-correct' : 'answered-incorrect') : ''}">
        ${isAnswered ? (isCorrect ? '✅ Correct' : '❌ Needs Review') : '⚪ Unanswered'}
      </span>
    `;
    qCard.appendChild(metaRow);

    // Prompt
    const promptEl = document.createElement('div');
    promptEl.className = 'question-prompt';
    promptEl.textContent = q.prompt;
    qCard.appendChild(promptEl);

    // Options
    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'options-list';

    const bullets = ['A', 'B', 'C', 'D'];

    q.options.forEach((opt, optIndex) => {
      const optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = 'option-btn';
      optBtn.dataset.optIndex = optIndex;
      optBtn.setAttribute('aria-label', `Option ${bullets[optIndex]}: ${opt.text}`);

      if (selectedOptionIdx === optIndex) {
        optBtn.classList.add(opt.isCorrect ? 'selected-correct' : 'selected-incorrect');
      }

      optBtn.innerHTML = `
        <span class="option-bullet">${bullets[optIndex]}.</span>
        <span class="option-text" style="flex:1;">${opt.text}</span>
        <span class="option-icon">${selectedOptionIdx === optIndex ? (opt.isCorrect ? '✅' : '❌') : ''}</span>
      `;

      optBtn.addEventListener('click', () => {
        handleOptionSelect(moduleId, containerId, q, optIndex, options);
      });

      optionsWrap.appendChild(optBtn);
    });
    qCard.appendChild(optionsWrap);

    // Feedback Box
    const feedbackBox = document.createElement('div');
    feedbackBox.className = `feedback-box ${isAnswered ? 'active ' + (isCorrect ? 'feedback-correct' : 'feedback-incorrect') : ''}`;
    if (isAnswered && selectedOpt) {
      feedbackBox.innerHTML = `
        <div style="font-weight:700; margin-bottom:0.25rem;">
          ${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}
        </div>
        <div>${selectedOpt.explanation}</div>
        ${!isCorrect ? '<div style="font-size:0.8rem; margin-top:0.4rem; color:var(--text-muted); font-style:italic;">You may click another option above to learn and adjust your answer.</div>' : ''}
      `;
    }
    qCard.appendChild(feedbackBox);

    questionsList.appendChild(qCard);
  });

  container.appendChild(questionsList);

  // 3. Quiz Summary & Completion Alert
  const summaryBox = document.createElement('div');
  summaryBox.className = 'quiz-summary-alert';
  updateSummaryAlert(summaryBox, moduleId, containerId, quizData, answers, options);
  container.appendChild(summaryBox);
}

function handleOptionSelect(moduleId, containerId, question, optionIdx, options) {
  const quizData = MODULE_QUIZZES[moduleId];
  if (!quizData) return;

  const saved = getQuizResult(moduleId);
  const answers = saved && saved.answers ? { ...saved.answers } : {};
  answers[question.id] = optionIdx;

  // Compute score
  let correctCount = 0;
  quizData.questions.forEach(q => {
    const ansIdx = answers[q.id];
    if (ansIdx !== undefined && q.options[ansIdx] && q.options[ansIdx].isCorrect) {
      correctCount++;
    }
  });

  const total = quizData.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  // Save progress
  saveQuizResult(moduleId, {
    score: correctCount,
    total: total,
    percentage: percentage,
    answers: answers
  });

  // Re-render UI
  renderQuiz(moduleId, containerId, options);

  // Call score update callback
  if (options.onScoreUpdate) {
    options.onScoreUpdate({
      moduleId,
      score: correctCount,
      total,
      percentage,
      passed: percentage >= 80
    });
  }

  // Dispatch global custom event
  window.dispatchEvent(new CustomEvent('proteobuild:quiz-updated', {
    detail: { moduleId, score: correctCount, total, percentage, passed: percentage >= 80 }
  }));
}

function updateHeaderBanner(bannerEl, quizData, answers) {
  const total = quizData.questions.length;
  let answeredCount = 0;
  let correctCount = 0;

  quizData.questions.forEach(q => {
    const ansIdx = answers[q.id];
    if (ansIdx !== undefined) {
      answeredCount++;
      if (q.options[ansIdx] && q.options[ansIdx].isCorrect) {
        correctCount++;
      }
    }
  });

  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const isAllAnswered = answeredCount === total;
  const isPassed = isAllAnswered && percentage >= 80;

  let badgeHTML = '';
  if (!isAllAnswered) {
    badgeHTML = `<span class="quiz-score-badge in-progress">⏳ ${answeredCount} / ${total} Answered</span>`;
  } else if (isPassed) {
    badgeHTML = `<span class="quiz-score-badge passed">✅ Passed: ${percentage}% (${correctCount}/${total})</span>`;
  } else {
    badgeHTML = `<span class="quiz-score-badge failed">⚠️ Score: ${percentage}% (${correctCount}/${total})</span>`;
  }

  bannerEl.innerHTML = `
    <div class="quiz-status-title">
      <strong>${quizData.title}</strong>
      <div style="font-size:0.82rem; color:var(--text-muted); font-weight:normal; margin-top:0.2rem;">
        Mastery Passing Requirement: ≥ 80% score (3 of 3 correct)
      </div>
    </div>
    ${badgeHTML}
  `;
}

function updateSummaryAlert(alertEl, moduleId, containerId, quizData, answers, options) {
  const total = quizData.questions.length;
  let answeredCount = 0;
  let correctCount = 0;

  quizData.questions.forEach(q => {
    const ansIdx = answers[q.id];
    if (ansIdx !== undefined) {
      answeredCount++;
      if (q.options[ansIdx] && q.options[ansIdx].isCorrect) {
        correctCount++;
      }
    }
  });

  const isAllAnswered = answeredCount === total;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const isPassed = isAllAnswered && percentage >= 80;

  if (!isAllAnswered) {
    alertEl.className = 'quiz-summary-alert alert-info';
    alertEl.innerHTML = `
      <div>
        <strong>Knowledge Check In Progress:</strong> Please select an answer for all ${total} questions above. Instant biochemical explanations will appear with every selection.
      </div>
    `;
  } else if (isPassed) {
    alertEl.className = 'quiz-summary-alert alert-success';
    alertEl.innerHTML = `
      <div>
        <strong>🎉 Module Mastery Achieved!</strong> You scored <strong>${percentage}% (${correctCount}/${total})</strong>. You have satisfied the knowledge check requirement for this module and unlocked advancement!
      </div>
      <button type="button" class="btn btn-outline btn-sm reset-quiz-btn" style="background:var(--bg-surface);">
        🔄 Reattempt Quiz
      </button>
    `;
    const resetBtn = alertEl.querySelector('.reset-quiz-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetModuleQuiz(moduleId, containerId, options);
      });
    }
  } else {
    alertEl.className = 'quiz-summary-alert alert-warning';
    alertEl.innerHTML = `
      <div>
        <strong>⚠️ Passing Score Not Yet Met:</strong> Your score is <strong>${percentage}% (${correctCount}/${total})</strong>. You need at least <strong>80%</strong> to complete this module and unlock the Certificate of Mastery. Review the pedagogical explanations above or try again.
      </div>
      <button type="button" class="btn btn-coral btn-sm reset-quiz-btn">
        🔄 Reset Quiz & Try Again
      </button>
    `;
    const resetBtn = alertEl.querySelector('.reset-quiz-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetModuleQuiz(moduleId, containerId, options);
      });
    }
  }
}

/**
 * Reset module quiz answers and state
 */
export function resetModuleQuiz(moduleId, containerId, options = {}) {
  const quizData = MODULE_QUIZZES[moduleId];
  if (!quizData) return;

  saveQuizResult(moduleId, {
    score: 0,
    total: quizData.questions.length,
    percentage: 0,
    answers: {}
  });

  renderQuiz(moduleId, containerId, options);

  if (options.onScoreUpdate) {
    options.onScoreUpdate({
      moduleId,
      score: 0,
      total: quizData.questions.length,
      percentage: 0,
      passed: false
    });
  }

  window.dispatchEvent(new CustomEvent('proteobuild:quiz-updated', {
    detail: { moduleId, score: 0, total: quizData.questions.length, percentage: 0, passed: false }
  }));
}

