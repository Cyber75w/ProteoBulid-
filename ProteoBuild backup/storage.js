/**
 * ProteoBuild - Local Storage & Data Management
 * Handles persistent storage of saved proteins, progress, and settings in browser LocalStorage.
 * Includes JSON import/export, FASTA/plain text export, and input validation.
 */

import { PRESET_PROTEINS, AA_BY_CODE1 } from './aminoData.js';

const STORAGE_KEYS = {
  PROTEINS: 'proteobuild_saved_proteins_v1',
  PROGRESS: 'proteobuild_learning_progress_v1',
  SETTINGS: 'proteobuild_user_settings_v1'
};

/**
 * Initialize default stored proteins if empty
 */
export function initStorage() {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.PROTEINS);
    if (!existing) {
      // Preload with curated presets
      localStorage.setItem(STORAGE_KEYS.PROTEINS, JSON.stringify(PRESET_PROTEINS));
    }
  } catch (err) {
    console.warn('ProteoBuild: LocalStorage is unavailable or restricted:', err);
  }
}

/**
 * Get all saved proteins from LocalStorage
 * @returns {Array} List of protein objects
 */
export function getSavedProteins() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROTEINS);
    if (!raw) return [...PRESET_PROTEINS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...PRESET_PROTEINS];
  } catch (err) {
    console.error('Failed to read saved proteins:', err);
    return [...PRESET_PROTEINS];
  }
}

/**
 * Save a new protein or update an existing one
 * @param {Object} protein { id, name, sequence, category, notes, structureType }
 * @returns {Object} result { success: boolean, message: string, protein: Object }
 */
export function saveProtein(protein) {
  try {
    if (!protein.name || !protein.name.trim()) {
      return { success: false, message: 'Please provide a name for this protein.' };
    }
    if (!protein.sequence || !protein.sequence.trim()) {
      return { success: false, message: 'Cannot save an empty sequence. Add at least one residue.' };
    }

    const cleanSeq = protein.sequence.toUpperCase().replace(/[^A-Z]/g, '');
    const validation = validateSequence(cleanSeq);
    if (!validation.isValid) {
      return { success: false, message: `Invalid amino acid sequence: ${validation.invalidChars.join(', ')}` };
    }

    const proteins = getSavedProteins();
    const id = protein.id || `user-prot-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const existingIndex = proteins.findIndex(p => p.id === id);
    const newEntry = {
      id,
      name: protein.name.trim(),
      sequence: cleanSeq,
      category: protein.category || 'User-Defined Peptide',
      structureType: protein.structureType || 'monomer',
      notes: protein.notes ? protein.notes.trim() : '',
      createdAt: existingIndex >= 0 ? (proteins[existingIndex].createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
      isPreset: false
    };

    if (existingIndex >= 0) {
      proteins[existingIndex] = newEntry;
    } else {
      proteins.unshift(newEntry);
    }

    localStorage.setItem(STORAGE_KEYS.PROTEINS, JSON.stringify(proteins));
    return { success: true, message: `Protein "${newEntry.name}" saved to your browser library!`, protein: newEntry };
  } catch (err) {
    console.error('Save error:', err);
    return { success: false, message: 'Unable to save to LocalStorage (quota exceeded or browser privacy block).' };
  }
}

/**
 * Delete a saved protein by ID
 * @param {string} id
 * @returns {Object}
 */
export function deleteProtein(id) {
  try {
    let proteins = getSavedProteins();
    const target = proteins.find(p => p.id === id);
    if (!target) {
      return { success: false, message: 'Protein not found.' };
    }
    proteins = proteins.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROTEINS, JSON.stringify(proteins));
    return { success: true, message: `Deleted "${target.name}".` };
  } catch (err) {
    console.error('Delete error:', err);
    return { success: false, message: 'Failed to delete protein.' };
  }
}

/**
 * Rename a saved protein
 */
export function renameProtein(id, newName) {
  try {
    if (!newName || !newName.trim()) {
      return { success: false, message: 'Name cannot be empty.' };
    }
    const proteins = getSavedProteins();
    const target = proteins.find(p => p.id === id);
    if (!target) {
      return { success: false, message: 'Protein not found.' };
    }
    target.name = newName.trim();
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PROTEINS, JSON.stringify(proteins));
    return { success: true, message: `Renamed to "${target.name}".` };
  } catch (err) {
    return { success: false, message: 'Failed to rename protein.' };
  }
}

/**
 * Reset library back to original factory presets
 */
export function resetToPresets() {
  try {
    localStorage.setItem(STORAGE_KEYS.PROTEINS, JSON.stringify(PRESET_PROTEINS));
    return { success: true, message: 'Library restored to factory educational presets.' };
  } catch (err) {
    return { success: false, message: 'Failed to reset library.' };
  }
}

/**
 * Validate a sequence contains only standard 20 amino acid 1-letter codes
 */
export function validateSequence(seq) {
  const invalidChars = [];
  const clean = seq.toUpperCase().replace(/\s+/g, '');
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (!AA_BY_CODE1.has(char)) {
      if (!invalidChars.includes(char)) {
        invalidChars.push(char);
      }
    }
  }
  return {
    isValid: invalidChars.length === 0,
    cleanSequence: clean,
    invalidChars
  };
}

/**
 * Export a single protein or all proteins as a downloadable JSON file
 */
export function exportAsJSON(data, filename = 'proteobuild-library.json') {
  try {
    const payload = {
      app: 'ProteoBuild',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      disclaimer: 'ProteoBuild educational simulator data file. Illustrative models only.',
      data: data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    triggerDownload(blob, filename);
    return { success: true, message: `Exported ${filename} successfully!` };
  } catch (err) {
    return { success: false, message: 'JSON export failed: ' + err.message };
  }
}

/**
 * Export sequence in FASTA or plain text format
 */
export function exportAsFASTA(protein, filename) {
  try {
    const fasta = `>ProteoBuild|${protein.id || 'custom'}|${protein.name.replace(/\s+/g, '_')}\n${formatFastaLines(protein.sequence, 60)}\n`;
    const blob = new Blob([fasta], { type: 'text/plain' });
    triggerDownload(blob, filename || `${protein.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.fasta`);
    return { success: true, message: 'FASTA file downloaded!' };
  } catch (err) {
    return { success: false, message: 'FASTA export failed: ' + err.message };
  }
}

/**
 * Format string with fixed line width (default 60 chars standard FASTA)
 */
function formatFastaLines(seq, lineWidth = 60) {
  const chunks = [];
  for (let i = 0; i < seq.length; i += lineWidth) {
    chunks.push(seq.substring(i, i + lineWidth));
  }
  return chunks.join('\n');
}

/**
 * Import proteins from a parsed JSON string or object
 */
export function importFromJSON(jsonString) {
  try {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      return { success: false, message: 'Invalid JSON file format. Could not parse content.' };
    }

    // Support both single protein or array, or ProteoBuild export payload
    let itemsToImport = [];
    if (parsed && parsed.app === 'ProteoBuild' && parsed.data) {
      itemsToImport = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    } else if (Array.isArray(parsed)) {
      itemsToImport = parsed;
    } else if (parsed && typeof parsed === 'object') {
      itemsToImport = [parsed];
    } else {
      return { success: false, message: 'Unrecognized JSON structure.' };
    }

    if (itemsToImport.length === 0) {
      return { success: false, message: 'The imported file contains no protein entries.' };
    }

    const currentProteins = getSavedProteins();
    let importedCount = 0;
    const errors = [];

    itemsToImport.forEach((item, idx) => {
      if (!item.name || !item.sequence) {
        errors.push(`Entry #${idx + 1} is missing a name or sequence.`);
        return;
      }
      const val = validateSequence(item.sequence);
      if (!val.isValid) {
        errors.push(`Entry "${item.name}" has invalid amino acid codes (${val.invalidChars.join(',')}).`);
        return;
      }

      // Check if duplicate ID exists, generate new ID if needed to prevent silent overwrite
      let newId = item.id;
      if (!newId || currentProteins.some(p => p.id === newId)) {
        newId = `imported-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }

      const importedEntry = {
        id: newId,
        name: (item.name + (currentProteins.some(p => p.id === item.id) ? ' (Imported)' : '')).trim(),
        sequence: val.cleanSequence,
        category: item.category || 'Imported Sequence',
        structureType: item.structureType || 'monomer',
        notes: item.notes || 'Imported from external file',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPreset: false
      };

      currentProteins.unshift(importedEntry);
      importedCount++;
    });

    if (importedCount === 0) {
      return { success: false, message: 'Failed to import any valid proteins: ' + errors.join(' ') };
    }

    localStorage.setItem(STORAGE_KEYS.PROTEINS, JSON.stringify(currentProteins));
    return {
      success: true,
      message: `Successfully imported ${importedCount} protein${importedCount > 1 ? 's' : ''}!`,
      count: importedCount,
      warnings: errors
    };
  } catch (err) {
    return { success: false, message: 'Import error: ' + err.message };
  }
}

/**
 * Trigger browser file download
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// --- Learning Progress Persistence ---

export function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) {
      return {
        module1: { started: false, completed: false },
        module2: { started: false, completed: false },
        module3: { started: false, completed: false },
        module4: { started: false, completed: false }
      };
    }
    return JSON.parse(raw);
  } catch (err) {
    return {
      module1: { started: false, completed: false },
      module2: { started: false, completed: false },
      module3: { started: false, completed: false },
      module4: { started: false, completed: false }
    };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.warn('Could not persist progress to LocalStorage:', err);
  }
}

export function markModuleStarted(moduleId) {
  const p = getProgress();
  if (p[moduleId] && !p[moduleId].started) {
    p[moduleId].started = true;
    saveProgress(p);
  }
}

export function markModuleCompleted(moduleId) {
  const p = getProgress();
  if (p[moduleId]) {
    p[moduleId].started = true;
    p[moduleId].completed = true;
    saveProgress(p);
  }
}

/**
 * Persist module quiz score and answers
 * @param {string} moduleId e.g. 'module1'
 * @param {Object} quizData { score, total, percentage, answers }
 */
export function saveQuizResult(moduleId, quizData) {
  const p = getProgress();
  if (!p[moduleId]) {
    p[moduleId] = { started: true, completed: false };
  }
  
  const passed = quizData.percentage >= 80;
  p[moduleId].quiz = {
    score: quizData.score,
    total: quizData.total,
    percentage: quizData.percentage,
    passed: passed,
    answers: quizData.answers || {},
    updatedAt: new Date().toISOString()
  };

  p[moduleId].quizPassed = passed;

  // Check if all 4 modules are passed
  const mods = ['module1', 'module2', 'module3', 'module4'];
  const allPassed = mods.every(m => p[m] && p[m].quiz && p[m].quiz.passed);
  if (allPassed) {
    if (!p.certificateCode) {
      p.certificateCode = generateCertCode();
    }
    if (!p.completedAt) {
      p.completedAt = new Date().toISOString();
    }
  }

  saveProgress(p);
  return p;
}

export function getQuizResult(moduleId) {
  const p = getProgress();
  return (p[moduleId] && p[moduleId].quiz) ? p[moduleId].quiz : null;
}

export function generateCertCode() {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PB-BIA01-${rand.substring(0, 4)}-${rand.substring(4)}`;
}

export function areAllQuizzesPassed() {
  const p = getProgress();
  const mods = ['module1', 'module2', 'module3', 'module4'];
  return mods.every(m => p[m] && p[m].quiz && p[m].quiz.passed);
}

export function getOverallQuizStats() {
  const p = getProgress();
  const mods = ['module1', 'module2', 'module3', 'module4'];
  let totalScore = 0;
  let totalQuestions = 0;
  let passedCount = 0;
  const moduleDetails = {};

  mods.forEach(m => {
    const q = p[m] && p[m].quiz;
    if (q) {
      totalScore += q.score || 0;
      totalQuestions += q.total || 3;
      if (q.passed) passedCount++;
      moduleDetails[m] = {
        score: q.score || 0,
        total: q.total || 3,
        percentage: q.percentage || 0,
        passed: q.passed || false
      };
    } else {
      totalQuestions += 3;
      moduleDetails[m] = {
        score: 0,
        total: 3,
        percentage: 0,
        passed: false
      };
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  return {
    totalScore,
    totalQuestions,
    percentage,
    passedCount,
    allPassed: passedCount === 4,
    certificateCode: p.certificateCode || (passedCount === 4 ? generateCertCode() : null),
    completedAt: p.completedAt || null,
    moduleDetails
  };
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    return { success: true, message: 'All learning progress has been reset.' };
  } catch (err) {
    return { success: false, message: 'Failed to reset progress.' };
  }
}

