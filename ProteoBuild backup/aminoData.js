/**
 * ProteoBuild - Amino Acid Biochemical Reference Data
 * Contains comprehensive educational data for the 20 standard amino acids.
 * Grouped into broad introductory categories:
 * - Nonpolar, Aliphatic
 * - Aromatic
 * - Polar, Uncharged
 * - Positively Charged (Basic)
 * - Negatively Charged (Acidic)
 */

export const AMINO_ACID_CATEGORIES = {
  'nonpolar-aliphatic': {
    name: 'Nonpolar, Aliphatic',
    color: '#E07A5F', // Muted Coral
    description: 'Hydrophobic hydrocarbon side chains. Tend to cluster in the interior core of soluble globular proteins away from water.'
  },
  'aromatic': {
    name: 'Aromatic',
    color: '#D4A373', // Warm Amber/Sand
    description: 'Relatively nonpolar ring structures capable of hydrophobic interactions and pi-stacking. Absorb ultraviolet light (notably Trp & Tyr at 280 nm).'
  },
  'polar-uncharged': {
    name: 'Polar, Uncharged',
    color: '#81B29A', // Soft Sage Green
    description: 'Hydrophilic side chains containing hydroxyl, sulfhydryl, or carboxamide groups capable of forming hydrogen bonds with water and other residues.'
  },
  'positive-charge': {
    name: 'Positively Charged (Basic)',
    color: '#6A4C93', // Royal Lavender/Purple
    description: 'Side chains carry a net positive charge at physiological pH (~7.4). Can form electrostatic ionic bonds (salt bridges) with acidic residues.'
  },
  'negative-charge': {
    name: 'Negatively Charged (Acidic)',
    color: '#3D5A80', // Slate Blue
    description: 'Side chains carry carboxylate groups with net negative charge at physiological pH (~7.4). Essential for electrostatic salt bridges and metal binding.'
  }
};

export const AMINO_ACIDS = [
  // --- Nonpolar, Aliphatic ---
  {
    code1: 'G',
    code3: 'Gly',
    name: 'Glycine',
    category: 'nonpolar-aliphatic',
    mw: 75.07,
    hydropathy: -0.4,
    pKa1: 2.34, // -COOH
    pKa2: 9.60, // -NH3+
    pKaR: null,
    pI: 5.97,
    sideChain: '-H (Hydrogen atom)',
    formula: 'C2H5NO2',
    description: 'The simplest and smallest amino acid. Achiral (no asymmetric carbon). High conformational flexibility makes it a common helix breaker and key residue in tight turns and collagen triple helices.',
    helixPropensity: 'Breaker (too flexible)',
    sheetPropensity: 'Low'
  },
  {
    code1: 'A',
    code3: 'Ala',
    name: 'Alanine',
    category: 'nonpolar-aliphatic',
    mw: 89.09,
    hydropathy: 1.8,
    pKa1: 2.34,
    pKa2: 9.69,
    pKaR: null,
    pI: 6.01,
    sideChain: '-CH3 (Methyl group)',
    formula: 'C3H7NO2',
    description: 'Small, nonpolar residue. Has the highest propensity of all residues to form stable alpha-helices due to its compact, unbranched methyl side chain.',
    helixPropensity: 'Very High (Ideal former)',
    sheetPropensity: 'Moderate'
  },
  {
    code1: 'V',
    code3: 'Val',
    name: 'Valine',
    category: 'nonpolar-aliphatic',
    mw: 117.15,
    hydropathy: 4.2,
    pKa1: 2.32,
    pKa2: 9.62,
    pKaR: null,
    pI: 5.97,
    sideChain: '-CH(CH3)2 (Isopropyl group)',
    formula: 'C5H11NO2',
    description: 'Branched-chain amino acid (beta-branched). Strongly hydrophobic; steric bulk near the backbone favors beta-sheet formation over alpha-helices.',
    helixPropensity: 'Low',
    sheetPropensity: 'Very High'
  },
  {
    code1: 'L',
    code3: 'Leu',
    name: 'Leucine',
    category: 'nonpolar-aliphatic',
    mw: 131.18,
    hydropathy: 3.8,
    pKa1: 2.36,
    pKa2: 9.60,
    pKaR: null,
    pI: 5.98,
    sideChain: '-CH2CH(CH3)2 (Isobutyl group)',
    formula: 'C6H13NO2',
    description: 'Common hydrophobic residue found inside protein cores. Crucial in quaternary structural motifs such as "leucine zippers" in transcription factors.',
    helixPropensity: 'High',
    sheetPropensity: 'Moderate'
  },
  {
    code1: 'I',
    code3: 'Ile',
    name: 'Isoleucine',
    category: 'nonpolar-aliphatic',
    mw: 131.18,
    hydropathy: 4.5,
    pKa1: 2.36,
    pKa2: 9.68,
    pKaR: null,
    pI: 6.02,
    sideChain: '-CH(CH3)CH2CH3 (sec-Butyl group)',
    formula: 'C6H13NO2',
    description: 'Beta-branched aliphatic residue with two chiral centers. Strongly hydrophobic; commonly found buried in beta-sheets.',
    helixPropensity: 'Moderate',
    sheetPropensity: 'Very High'
  },
  {
    code1: 'P',
    code3: 'Pro',
    name: 'Proline',
    category: 'nonpolar-aliphatic',
    mw: 115.13,
    hydropathy: -1.6,
    pKa1: 1.99,
    pKa2: 10.96,
    pKaR: null,
    pI: 6.48,
    sideChain: 'Cyclic pyrrolidine ring bonded to alpha-amino group',
    formula: 'C5H9NO2',
    description: 'Unique cyclic imino acid. Rigid ring constrains the backbone phi angle (~ -65°), disrupting alpha-helices ("helix breaker") and introducing sharp turns or beta-hairpins.',
    helixPropensity: 'Breaker (Rigid ring)',
    sheetPropensity: 'Low (Favors turns)'
  },
  {
    code1: 'M',
    code3: 'Met',
    name: 'Methionine',
    category: 'nonpolar-aliphatic',
    mw: 149.21,
    hydropathy: 1.9,
    pKa1: 2.28,
    pKa2: 9.21,
    pKaR: null,
    pI: 5.74,
    sideChain: '-CH2CH2SCH3 (Thioether group)',
    formula: 'C5H11NO2S',
    description: 'Sulfur-containing nonpolar residue. Usually the initiating residue in eukaryotic protein translation (encoded by AUG). Flexible nonpolar side chain packs tightly into hydrophobic cores.',
    helixPropensity: 'High',
    sheetPropensity: 'Moderate'
  },

  // --- Aromatic ---
  {
    code1: 'F',
    code3: 'Phe',
    name: 'Phenylalanine',
    category: 'aromatic',
    mw: 165.19,
    hydropathy: 2.8,
    pKa1: 1.83,
    pKa2: 9.13,
    pKaR: null,
    pI: 5.48,
    sideChain: '-CH2-C6H5 (Benzyl phenyl ring)',
    formula: 'C9H11NO2',
    description: 'Bulky, purely hydrophobic aromatic ring. Almost completely buried inside hydrophobic cores. Participates in pi-pi stacking interactions.',
    helixPropensity: 'Moderate',
    sheetPropensity: 'High'
  },
  {
    code1: 'Y',
    code3: 'Tyr',
    name: 'Tyrosine',
    category: 'aromatic',
    mw: 181.19,
    hydropathy: -1.3,
    pKa1: 2.20,
    pKa2: 9.11,
    pKaR: 10.07, // Phenolic OH
    pI: 5.66,
    sideChain: '-CH2-C6H4-OH (Phenolic ring)',
    formula: 'C9H11NO3',
    description: 'Amphipathic aromatic residue: hydrophobic aromatic ring capped by a polar, weakly ionizable hydroxyl group capable of hydrogen bonding and phosphorylation.',
    helixPropensity: 'Moderate',
    sheetPropensity: 'High'
  },
  {
    code1: 'W',
    code3: 'Trp',
    name: 'Tryptophan',
    category: 'aromatic',
    mw: 204.23,
    hydropathy: -0.9,
    pKa1: 2.38,
    pKa2: 9.39,
    pKaR: null,
    pI: 5.89,
    sideChain: '-CH2-Indole bicyclic ring',
    formula: 'C11H12N2O2',
    description: 'Largest amino acid residue with an indole ring. Hydrophobic with an indole NH group capable of hydrogen bonding. Primary contributor to protein intrinsic fluorescence at 280 nm.',
    helixPropensity: 'Moderate',
    sheetPropensity: 'High'
  },

  // --- Polar, Uncharged ---
  {
    code1: 'S',
    code3: 'Ser',
    name: 'Serine',
    category: 'polar-uncharged',
    mw: 105.09,
    hydropathy: -0.8,
    pKa1: 2.21,
    pKa2: 9.15,
    pKaR: null,
    pI: 5.68,
    sideChain: '-CH2OH (Primary alcohol)',
    formula: 'C3H7NO3',
    description: 'Small polar residue with a hydroxyl group. Often found on protein surfaces hydrogen bonding with solvent water, in enzyme catalytic triads (e.g. serine proteases), and subject to phosphorylation.',
    helixPropensity: 'Moderate (Can bend helix)',
    sheetPropensity: 'Moderate'
  },
  {
    code1: 'T',
    code3: 'Thr',
    name: 'Threonine',
    category: 'polar-uncharged',
    mw: 119.12,
    hydropathy: -0.7,
    pKa1: 2.09,
    pKa2: 9.10,
    pKaR: null,
    pI: 5.60,
    sideChain: '-CH(OH)CH3 (Secondary alcohol)',
    formula: 'C4H9NO3',
    description: 'Polar beta-branched residue with two chiral centers. Can donate and accept hydrogen bonds. Beta-branching gives it high propensity for beta-sheets.',
    helixPropensity: 'Low',
    sheetPropensity: 'High'
  },
  {
    code1: 'C',
    code3: 'Cys',
    name: 'Cysteine',
    category: 'polar-uncharged',
    mw: 121.16,
    hydropathy: 2.5,
    pKa1: 1.71,
    pKa2: 10.28,
    pKaR: 8.33, // Thiol -SH
    pI: 5.07,
    sideChain: '-CH2SH (Thiol/Sulfhydryl)',
    formula: 'C3H7NO2S',
    description: 'Possesses a reactive thiol group. Two adjacent cysteines can undergo oxidation to form a covalent disulfide bridge (-S-S-, cystine), greatly stabilizing tertiary and quaternary structures.',
    helixPropensity: 'Moderate',
    sheetPropensity: 'Moderate'
  },
  {
    code1: 'N',
    code3: 'Asn',
    name: 'Asparagine',
    category: 'polar-uncharged',
    mw: 132.12,
    hydropathy: -3.5,
    pKa1: 2.02,
    pKa2: 8.80,
    pKaR: null,
    pI: 5.41,
    sideChain: '-CH2CONH2 (Carboxamide)',
    formula: 'C4H8N2O3',
    description: 'Amide derivative of aspartate. Highly polar and frequently exposed to solvent. Often found at turns or ends of secondary structures (helix N-capping). Site of N-linked glycosylation.',
    helixPropensity: 'Low (Favors turns/caps)',
    sheetPropensity: 'Low'
  },
  {
    code1: 'Q',
    code3: 'Gln',
    name: 'Glutamine',
    category: 'polar-uncharged',
    mw: 146.15,
    hydropathy: -3.5,
    pKa1: 2.17,
    pKa2: 9.13,
    pKaR: null,
    pI: 5.65,
    sideChain: '-CH2CH2CONH2 (Carboxamide)',
    formula: 'C5H10N2O3',
    description: 'Amide derivative of glutamate with one additional methylene group compared to asparagine. Highly polar, hydrophilic, and common in alpha-helices and surface hydrogen-bond networks.',
    helixPropensity: 'High',
    sheetPropensity: 'Moderate'
  },

  // --- Positively Charged (Basic) ---
  {
    code1: 'K',
    code3: 'Lys',
    name: 'Lysine',
    category: 'positive-charge',
    mw: 146.19,
    hydropathy: -3.9,
    pKa1: 2.18,
    pKa2: 8.95,
    pKaR: 10.53, // Primary amine
    pI: 9.74,
    sideChain: '-(CH2)4NH3+ (epsilon-Amino group)',
    formula: 'C6H14N2O2',
    description: 'Long flexible aliphatic chain terminated with a protonated amino group at pH 7.4. Forms electrostatic salt bridges with acidic residues (Asp, Glu) and binds nucleic acid phosphate backbones.',
    helixPropensity: 'High',
    sheetPropensity: 'Moderate'
  },
  {
    code1: 'R',
    code3: 'Arg',
    name: 'Arginine',
    category: 'positive-charge',
    mw: 174.20,
    hydropathy: -4.5,
    pKa1: 2.17,
    pKa2: 9.04,
    pKaR: 12.48, // Guanidinium
    pI: 10.76,
    sideChain: '-(CH2)3-NH-C(=NH2+)NH2 (Guanidinium group)',
    formula: 'C6H14N4O2',
    description: 'Most basic standard amino acid. The planar guanidinium group remains fully protonated across physiological and alkaline conditions, forming bidentate salt bridges and multiple hydrogen bonds.',
    helixPropensity: 'High',
    sheetPropensity: 'Moderate'
  },
  {
    code1: 'H',
    code3: 'His',
    name: 'Histidine',
    category: 'positive-charge',
    mw: 155.16,
    hydropathy: -3.2,
    pKa1: 1.82,
    pKa2: 9.17,
    pKaR: 6.00, // Imidazole ring
    pI: 7.59,
    sideChain: '-CH2-Imidazole ring',
    formula: 'C6H9N3O2',
    description: 'Has an ionizable imidazole ring with a pKa near physiological pH (~6.0). Can readily shift between protonated and neutral forms, making it an indispensable general acid-base catalyst in enzyme active sites.',
    helixPropensity: 'Moderate',
    sheetPropensity: 'Moderate'
  },

  // --- Negatively Charged (Acidic) ---
  {
    code1: 'D',
    code3: 'Asp',
    name: 'Aspartate',
    category: 'negative-charge',
    mw: 133.10,
    hydropathy: -3.5,
    pKa1: 1.88,
    pKa2: 9.60,
    pKaR: 3.65, // beta-COOH
    pI: 2.77,
    sideChain: '-CH2COO- (beta-Carboxylate)',
    formula: 'C4H7NO4',
    description: 'Carries a negative charge at pH 7.4. Readily forms salt bridges with Lys and Arg, coordinates divalent metal cations (e.g. Mg2+, Ca2+), and caps the positive N-terminus of alpha-helices.',
    helixPropensity: 'Moderate (Helix N-cap)',
    sheetPropensity: 'Low'
  },
  {
    code1: 'E',
    code3: 'Glu',
    name: 'Glutamate',
    category: 'negative-charge',
    mw: 147.13,
    hydropathy: -3.5,
    pKa1: 2.19,
    pKa2: 9.67,
    pKaR: 4.25, // gamma-COOH
    pI: 3.22,
    sideChain: '-CH2CH2COO- (gamma-Carboxylate)',
    formula: 'C5H9NO4',
    description: 'Carries a negative charge at physiological pH. One methylene longer than Asp, granting it extra conformational flexibility. Exceptionally common in alpha-helices on protein surfaces.',
    helixPropensity: 'Very High',
    sheetPropensity: 'Low'
  }
];

// Quick lookup maps
export const AA_BY_CODE1 = new Map(AMINO_ACIDS.map(aa => [aa.code1, aa]));
export const AA_BY_CODE3 = new Map(AMINO_ACIDS.map(aa => [aa.code3.toUpperCase(), aa]));

/**
 * Pre-loaded reference educational protein presets.
 * Scientifically curated to showcase specific structural motifs in BIA01 Unit III syllabus.
 */
export const PRESET_PROTEINS = [
  {
    id: 'preset-myoglobin',
    name: 'Myoglobin (Sperm Whale, Segment)',
    category: 'Globular Monomer (All-Alpha)',
    structureType: 'monomer',
    description: 'Classic monomeric hemeprotein composed of 8 compact alpha-helices (A through H) surrounding a hydrophobic heme pocket. Milestone in structural biology solved by John Kendrew (1958).',
    sequence: 'VLSEGEWQLVLHVWAKVEADVAGHGQDILIRLFKSHPETLEKFDRFKHLKTEAEMKASEDLKKHGVTVLTALGAILKKKGHHEAELKPLAQSHATKHKIPIKYLEFISEAIIHVLHSRHPGDFGADAQGAMNKALELFRKDIAAKYKELGYQG',
    source: 'Illustrative educational segment based on PDB 1MBO',
    notes: 'High alpha-helical content (~75%), compact hydrophobic core with buried Phe, Leu, Val residues.'
  },
  {
    id: 'preset-hemoglobin',
    name: 'Hemoglobin (Alpha-Beta Dimer/Tetramer)',
    category: 'Quaternary Oligomer (Allosteric)',
    structureType: 'tetramer',
    description: 'Classic quaternary assembly consisting of two alpha and two beta globin subunits (alpha2-beta2). Exhibits cooperative oxygen binding regulated by quaternary conformational shifts (T-to-R transition).',
    sequence: 'VHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH',
    source: 'Illustrative human beta-globin segment based on PDB 2HHB',
    notes: 'Quaternary interface stabilized by inter-subunit salt bridges, hydrogen bonds, and hydrophobic contacts.'
  },
  {
    id: 'preset-insulin',
    name: 'Insulin (A-Chain & B-Chain Segment)',
    category: 'Hormone with Disulfide Bonds',
    structureType: 'dimer',
    description: 'Peptide hormone stabilized by three critical covalent disulfide bonds (two inter-chain links between A and B chains, and one intra-chain link within the A chain). Solved by Dorothy Hodgkin.',
    sequence: 'GIVEQCCTSICSLYQLENYCNFVNQHLCGSHLVEALYLVCGERGFFYTPKT',
    source: 'Combined illustrative sequence segment based on PDB 4INS',
    notes: 'Demonstrates tertiary/quaternary stability provided by covalent cystine disulfide bridges.'
  },
  {
    id: 'preset-lysozyme',
    name: 'Lysozyme (Hen Egg White, Active Site)',
    category: 'Enzyme (Mixed Alpha/Beta)',
    structureType: 'monomer',
    description: 'Compact antibacterial enzyme that hydrolyzes bacterial peptidoglycan walls. Contains both alpha-helices and a beta-sheet domain, stabilized by 4 internal disulfide bonds.',
    sequence: 'KVFGRCELAAAMKRHGLDNYRGYSLGNWVCAAKFESNFNTQATNRNTDGSTDYGILQINSRWWCNDGRTPGSRNLCNIPCSALLSSDITASVNCAKKIVSDGNGMNAWVAWRNRCKGTDVQAWIRGCRL',
    source: 'Educational segment based on PDB 1LYZ',
    notes: 'Active site catalytic residues Glu35 (proton donor) and Asp52 (nucleophile) depend strictly on folded geometry.'
  },
  {
    id: 'preset-hairpin',
    name: 'Beta-Hairpin Motif (Synthetic Mini-protein)',
    category: 'Secondary Structure Motif',
    structureType: 'monomer',
    description: 'A model 16-residue beta-hairpin showing two antiparallel beta-strands connected by a tight type-I beta-turn with inter-strand hydrogen bonding and hydrophobic cross-strand packing.',
    sequence: 'RGKWTYNGITYEGR',
    source: 'Designed model peptide (Trp-cage/hairpin family)',
    notes: 'Antiparallel hydrogen bonds between backbone C=O and N-H groups face each other directly.'
  }
];
