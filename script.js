const modelData = new Map();
let modelBundles = [];
let currentModelBundle = null;

const ipsaeColumns = [
    { key: "chn1", label: "Chn1", numeric: false },
    { key: "chn2", label: "Chn2", numeric: false },
    { key: "pae", label: "PAE", numeric: true, decimals: 0 },
    { key: "dist", label: "Dist", numeric: true, decimals: 0 },
    { key: "type", label: "Type", numeric: false },
    { key: "ipSAE", label: "ipSAE", numeric: true, decimals: 6 },
    { key: "ipSAE_d0chn", label: "ipSAE d0chn", numeric: true, decimals: 6 },
    { key: "ipSAE_d0dom", label: "ipSAE d0dom", numeric: true, decimals: 6 },
    { key: "ipTM_af", label: "ipTM (AF)", numeric: true, decimals: 3 },
    { key: "ipTM_d0chn", label: "ipTM d0chn", numeric: true, decimals: 6 },
    { key: "pDockQ", label: "pDockQ", numeric: true, decimals: 4 },
    { key: "pDockQ2", label: "pDockQ2", numeric: true, decimals: 4 },
    { key: "LIS", label: "LIS", numeric: true, decimals: 4 },
    { key: "n0res", label: "n0res", numeric: true, decimals: 0 },
    { key: "n0chn", label: "n0chn", numeric: true, decimals: 0 },
    { key: "n0dom", label: "n0dom", numeric: true, decimals: 0 },
    { key: "d0res", label: "d0res", numeric: true, decimals: 2 },
    { key: "d0chn", label: "d0chn", numeric: true, decimals: 2 },
    { key: "d0dom", label: "d0dom", numeric: true, decimals: 2 },
    { key: "nres1", label: "nres (chn1)", numeric: true, decimals: 0 },
    { key: "nres2", label: "nres (chn2)", numeric: true, decimals: 0 },
    { key: "dist1", label: "dist hits (chn1)", numeric: true, decimals: 0 },
    { key: "dist2", label: "dist hits (chn2)", numeric: true, decimals: 0 },
    { key: "model", label: "Model", numeric: false }
];

const ipsaeResidueColumns = [
    { key: "index", label: "i", numeric: true, decimals: 0 },
    { key: "alignChain", label: "AlignChn", numeric: false },
    { key: "scoredChain", label: "ScoredChn", numeric: false },
    { key: "alignResNum", label: "AlignResNum", numeric: true, decimals: 0 },
    { key: "alignResType", label: "AlignResType", numeric: false },
    { key: "alignRespLDDT", label: "AlignRespLDDT", numeric: true, decimals: 2 },
    { key: "n0chn", label: "n0chn", numeric: true, decimals: 0 },
    { key: "n0dom", label: "n0dom", numeric: true, decimals: 0 },
    { key: "n0res", label: "n0res", numeric: true, decimals: 0 },
    { key: "d0chn", label: "d0chn", numeric: true, decimals: 2 },
    { key: "d0dom", label: "d0dom", numeric: true, decimals: 2 },
    { key: "d0res", label: "d0res", numeric: true, decimals: 2 },
    { key: "ipTM", label: "ipTM_pae", numeric: true, decimals: 4 },
    { key: "ipSAE_d0chn", label: "ipSAE d0chn", numeric: true, decimals: 4 },
    { key: "ipSAE_d0dom", label: "ipSAE d0dom", numeric: true, decimals: 4 },
    { key: "ipSAE", label: "ipSAE", numeric: true, decimals: 4 }
];

const ipsaeColumnTooltips = {
    chn1: 'First chain in the pair (alignment provider).',
    chn2: 'Second chain in the pair (scored chain).',
    pae: 'PAE cutoff in Å applied to the pair.',
    dist: 'Cα–Cα distance cutoff in Å applied to the pair.',
    type: 'Row type: asymmetric orientation or the maximum of both orientations.',
    ipSAE: 'ipSAE value using PAE cutoff and d0 from residues in the scored chain below cutoff.',
    ipSAE_d0chn: 'ipSAE with d0 equal to the sum of both chain lengths.',
    ipSAE_d0dom: 'ipSAE with d0 equal to residues from both chains with inter-chain PAE below cutoff.',
    ipTM_af: 'AlphaFold ipTM (overall for AF2, pairwise symmetric for AF3).',
    ipTM_d0chn: 'ipTM recomputed from PAE matrix with d0 equal to chain-length sum.',
    pDockQ: 'pDockQ interface confidence score (Bryant et al.).',
    pDockQ2: 'pDockQ2 score based on PAE (Zhu et al.).',
    LIS: 'Local Interaction Score derived from PAEs (Kim et al.).',
    n0res: 'Residues counted in d0 for ipSAE.',
    n0chn: 'Residues counted in d0 for ipSAE_d0chn.',
    n0dom: 'Residues counted in d0 for ipSAE_d0dom.',
    d0res: 'd0 parameter used for ipSAE.',
    d0chn: 'd0 parameter used for ipSAE_d0chn.',
    d0dom: 'd0 parameter used for ipSAE_d0dom.',
    nres1: 'Residues in chain 1 with PAE below cutoff vs chain 2.',
    nres2: 'Residues in chain 2 with PAE below cutoff vs chain 1.',
    dist1: 'Residues in chain 1 meeting both PAE and distance cutoffs.',
    dist2: 'Residues in chain 2 meeting both PAE and distance cutoffs.',
    model: 'Stem of the AlphaFold/Boltz output file processed.'
};

const ipsaeResidueColumnTooltips = {
    index: 'Residue index within the full model (1-based).',
    alignChain: 'Chain ID supplying the aligned residue.',
    scoredChain: 'Chain ID of the residues being scored.',
    alignResNum: 'Residue number of the aligned residue.',
    alignResType: 'Three-letter residue code for the aligned residue.',
    alignRespLDDT: 'pLDDT of the aligned residue.',
    n0chn: 'Residue count used for d0 in ipSAE_d0chn.',
    n0dom: 'Residue count used for d0 in ipSAE_d0dom.',
    n0res: 'Residue count used for d0 in ipSAE.',
    d0chn: 'd0 parameter for ipSAE_d0chn at this residue.',
    d0dom: 'd0 parameter for ipSAE_d0dom at this residue.',
    d0res: 'd0 parameter for ipSAE at this residue.',
    ipTM: 'Residue-level ipTM computed from PAE matrix.',
    ipSAE_d0chn: 'Residue-level ipSAE with d0 equal to chain-length sum.',
    ipSAE_d0dom: 'Residue-level ipSAE with d0 from residues meeting inter-chain PAE cutoff.',
    ipSAE: 'Residue-level ipSAE with d0 from scored-chain residues below PAE cutoff.'
};

const ipsaeMetricTooltips = {
    chainPair: 'Displays orientation (Chn1 → Chn2) and row type (asym or max).',
    ipSAE: ipsaeColumnTooltips.ipSAE,
    ipSAE_d0chn: ipsaeColumnTooltips.ipSAE_d0chn,
    ipSAE_d0dom: ipsaeColumnTooltips.ipSAE_d0dom,
    ipTM_af: ipsaeColumnTooltips.ipTM_af,
    ipTM_d0chn: ipsaeColumnTooltips.ipTM_d0chn,
    pDockQ: ipsaeColumnTooltips.pDockQ,
    pDockQ2: ipsaeColumnTooltips.pDockQ2,
    LIS: ipsaeColumnTooltips.LIS,
    n0res: ipsaeColumnTooltips.n0res,
    n0chn: ipsaeColumnTooltips.n0chn,
    n0dom: ipsaeColumnTooltips.n0dom,
    d0res: ipsaeColumnTooltips.d0res,
    d0chn: ipsaeColumnTooltips.d0chn,
    d0dom: ipsaeColumnTooltips.d0dom,
    nres1: ipsaeColumnTooltips.nres1,
    nres2: ipsaeColumnTooltips.nres2,
    dist1: ipsaeColumnTooltips.dist1,
    dist2: ipsaeColumnTooltips.dist2,
    model: ipsaeColumnTooltips.model
};

const ipsaeElements = {};

const ipsaeState = {
    summaryRows: [],
    residueRows: [],
    viewIndices: [],
    filterValue: '',
    sort: { key: 'ipSAE', direction: 'desc' },
    selectedIndex: null
};

let pendingAutoIpsaeRun = null;
let ipsaeRunInFlight = false;

function baseFilename(path = "") {
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1] || path;
}

function extractModelNumber(filename, patterns) {
    for (const pattern of patterns) {
        const match = filename.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function getOrCreateBundle(bundleLookup, modelNum) {
    const key = modelNum ?? `model-${bundleLookup.size}`;
    if (!bundleLookup.has(key)) {
        bundleLookup.set(key, { modelNum: key });
    }
    return bundleLookup.get(key);
}

async function collectEntriesFromZip(file) {
    const zip = await JSZip.loadAsync(file);
    const entries = [];
    for (const [filename, fileEntry] of Object.entries(zip.files)) {
        if (fileEntry.dir) continue;
        entries.push({
            path: filename.replace(/\\/g, '/'),
            readText: () => fileEntry.async('string')
        });
    }
    return entries;
}

function collectEntriesFromFileList(fileList) {
    return Array.from(fileList)
        .filter((f) => f && f.name)
        .map((f) => ({
            path: (f.webkitRelativePath || f.name).replace(/\\/g, '/'),
            readText: () => f.text()
        }));
}

async function processUploadedEntries(entries) {
    // Clear previous data
    modelData.clear();
    modelBundles = [];
    currentModelBundle = null;
    resetIpsaeUI();

    const dataFiles = [];
    const summaryFiles = [];
    let fallbackSummary = null;
    const bundleLookup = new Map();

    // Match subdirectories like "seed-1_sample-0/..."
    const seedSamplePattern = /(?:^|\/)(seed-\d+_sample-\d+)(?:\/|$)/i;

    for (const { path, readText } of entries) {
        const normalizedPath = path.replace(/\\/g, '/');
        const filename = baseFilename(normalizedPath);

        // Skip MSA/template directories and template_hit CIFs if present
        if (/(?:^|\/)(msas|templates)\//i.test(normalizedPath)) {
            continue;
        }
        if (filename.toLowerCase().endsWith('.cif') && filename.toLowerCase().includes('template_hit')) {
            console.log('Skipping template_hit CIF file:', normalizedPath);
            continue;
        }

        const seedSampleMatch = normalizedPath.match(seedSamplePattern);

        // 1. Local AF3 .sif layout: seed-X_sample-Y/ folders
        if (seedSampleMatch) {
            const sampleKey = seedSampleMatch[1]; // e.g., "seed-1_sample-0"
            const bundle = getOrCreateBundle(bundleLookup, sampleKey);
            bundle.displayName = `${sampleKey} (${filename})`;

            if (filename.toLowerCase().endsWith('.cif')) {
                bundle.cif = { name: filename, readText };
                console.log('Found sample CIF file:', normalizedPath);
            } else if (filename.endsWith('summary_confidences.json')) {
                bundle.summary = { name: filename, readText };
            } else if (filename.endsWith('_confidences.json')) {
                dataFiles.push({ filename: normalizedPath, readText, modelNum: sampleKey });
            }
            continue;
        }

        // 2. Top-level local AF3 .sif files (e.g., HMD-MetY2_model.cif, HMD-MetY2_confidences.json)
        if (filename.toLowerCase().endsWith('.cif') && !/_model_\d+\.cif$/i.test(filename)) {
            const bundle = getOrCreateBundle(bundleLookup, 'top-level');
            bundle.cif = { name: filename, readText };
            bundle.displayName = `${filename} (top-level)`;
            console.log('Found top-level CIF file:', normalizedPath);
        } else if (filename.endsWith('_confidences.json') && !filename.includes('summary_confidences')) {
            dataFiles.push({ filename: normalizedPath, readText, modelNum: 'top-level' });
        } else if (filename.endsWith('summary_confidences.json') && !/_summary_confidences_\d+\.json$/i.test(filename)) {
            summaryFiles.push({ filename: normalizedPath, readText, modelNum: 'top-level' });
        }

        // 3. Legacy web-server / numbered layout
        if (filename.toLowerCase().endsWith('.cif') && /_model_\d+/i.test(filename)) {
            const modelNum = extractModelNumber(filename, [/_model_(\d+)/i]);
            const bundle = getOrCreateBundle(bundleLookup, modelNum);
            bundle.cif = { name: filename, readText };
            bundle.displayName = filename;
            console.log('Found CIF file:', normalizedPath);
        } else if (filename.includes('_full_data_')) {
            console.log('Found data file:', normalizedPath);
            const modelNum = extractModelNumber(filename, [/_full_data_(\d+)/i]);
            dataFiles.push({ filename: normalizedPath, readText, modelNum });
        } else if (filename.includes('summary_confidences')) {
            const modelNum = extractModelNumber(filename, [/_summary_confidences_(\d+)/i, /summary_confidences_(\d+)/i]);
            if (modelNum !== null) {
                summaryFiles.push({ filename: normalizedPath, readText, modelNum });
            } else {
                fallbackSummary = { filename: normalizedPath, readText };
            }
        }
    }

    if (dataFiles.length === 0) {
        throw new Error('No confidence/data files found in upload');
    }

    // Parse confidence/data files and populate modelData + bundle.fullData
    for (const fileInfo of dataFiles) {
        try {
            console.log('Processing data file:', fileInfo.filename);
            const content = await fileInfo.readText();
            const data = JSON.parse(content);
            console.log(
                `For ${fileInfo.filename}: chainIds=${data.atom_chain_ids?.length}, plddts=${data.atom_plddts?.length}, pae=${data.pae?.length}`
            );

            if (!data.atom_chain_ids || !data.atom_plddts || !data.pae) {
                console.error('Missing expected keys (atom_chain_ids, atom_plddts, pae) in file:', fileInfo.filename);
                continue;
            }

            const modelNum = fileInfo.modelNum;
            if (!modelNum) {
                console.error('Could not determine model key for file:', fileInfo.filename);
                continue;
            }

            modelData.set(modelNum, {
                chainIds: data.atom_chain_ids,
                plddts: data.atom_plddts,
                pae: data.pae
            });

            const bundle = getOrCreateBundle(bundleLookup, modelNum);
            if (!bundle.displayName) {
                bundle.displayName = `${modelNum} (${baseFilename(fileInfo.filename)})`;
            }
            bundle.fullData = { name: baseFilename(fileInfo.filename), readText: fileInfo.readText, text: content };
            console.log(`Successfully loaded model ${modelNum}`);
        } catch (err) {
            console.error('Error processing file:', fileInfo.filename, err);
        }
    }

    // Attach summary files to bundles
    summaryFiles.forEach(({ filename, readText, modelNum }) => {
        const bundle = bundleLookup.get(modelNum);
        if (bundle) {
            bundle.summary = { name: baseFilename(filename), readText };
        }
    });

    if (fallbackSummary) {
        for (const bundle of bundleLookup.values()) {
            if (!bundle.summary) {
                bundle.summary = { name: baseFilename(fallbackSummary.filename), readText: fallbackSummary.readText };
            }
        }
    }

    // Keep bundles that have a CIF and confidence/data JSON; sort numeric IDs numerically and seed-sample keys naturally
    modelBundles = Array.from(bundleLookup.values())
        .filter((bundle) => bundle.cif && bundle.fullData)
        .sort((a, b) => {
            const numA = Number(a.modelNum);
            const numB = Number(b.modelNum);
            if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                return numA - numB;
            }
            return String(a.modelNum).localeCompare(String(b.modelNum), undefined, { numeric: true });
        });

    populateModelSelector();

    // Load the first model's CIF structure
    if (modelBundles.length > 0) {
        console.log("Loading structure from first model's CIF data...");
        try {
            const firstBundle = modelBundles[0];
            const cifContent = await getBundleText(firstBundle, 'cif');
            await window.Viewer.loadStructureFromData(cifContent, 'mmcif');
            console.log(`Structure loaded from data for model file: ${firstBundle.cif.name}`);
            document.getElementById('modelSelector').value = '0';
            currentModelBundle = firstBundle;
            updateIpsaeControls(firstBundle);
            scheduleAutomaticIpsaeRun();
        } catch (e) {
            console.error('Error loading structure from data:', e);
        }
    }

    // Draw plots if we have data
    if (modelData.size > 0) {
        console.log('Drawing plots with', modelData.size, 'models');
        window.Plots.drawPAEMatrices(modelData);
        window.Plots.drawPLDDTPlot(modelData);
    } else {
        throw new Error('No valid model data could be loaded');
    }
}

async function handleFileUpload(event) {
    event?.preventDefault?.();
    const files = Array.from(event?.dataTransfer?.files || event?.target?.files || []);
    if (!files.length) return;

    try {
        document.body.style.cursor = "wait";
        if (files.length === 1 && files[0].name.toLowerCase().endsWith(".zip")) {
            const entries = await collectEntriesFromZip(files[0]);
            await processUploadedEntries(entries);
            return;
        }

        const entries = event?.dataTransfer
            ? await collectEntriesFromDataTransfer(event.dataTransfer)
            : collectEntriesFromFileList(files);

        if (!entries.length) {
            throw new Error("No files found in dropped item");
        }

        await processUploadedEntries(entries);
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        document.body.style.cursor = "default";
    }
}

async function handleFolderUpload(event) {
    event.preventDefault();
    console.log('Folder upload triggered');
    const files = event.type === 'drop' ? event.dataTransfer?.files : event.target?.files;

    if (!files || files.length === 0) {
        alert('Please select a folder');
        return;
    }

    try {
        document.body.style.cursor = 'wait';
        console.log('Loading folder with', files.length, 'files');
        const entries = collectEntriesFromFileList(files);
        await processUploadedEntries(entries);
    } catch (error) {
        console.error('Error processing folder:', error);
        alert('Error processing folder: ' + error.message);
    } finally {
        document.body.style.cursor = 'default';
    }
}

function populateModelSelector() {
    const modelSelector = document.getElementById('modelSelector');
    if (!modelSelector) return;
    modelSelector.innerHTML = '<option value="">Select a model</option>';
    modelBundles.forEach((bundle, index) => {
        const option = document.createElement('option');
        option.value = index;
        const label = String(bundle.modelNum ?? bundle.displayName ?? `Model ${index}`);
        option.textContent = label;
        option.title = bundle.displayName || label;
        modelSelector.appendChild(option);
    });
}

async function handleModelChange(event) {
    const selectedIndex = event.target.value;
    if (selectedIndex === "") {
        currentModelBundle = null;
        updateIpsaeControls(null);
        return;
    }

    const bundle = modelBundles[selectedIndex];
    if (!bundle) {
        console.warn('No bundle found for model index', selectedIndex);
        updateIpsaeControls(null);
        return;
    }

    try {
        const cifContent = await getBundleText(bundle, 'cif');
        await window.Viewer.loadStructureFromData(cifContent, 'mmcif');
        console.log(`Structure loaded from data for model file: ${bundle.cif?.name || bundle.displayName}`);
        currentModelBundle = bundle;
        updateIpsaeControls(bundle);
        scheduleAutomaticIpsaeRun();
    } catch (e) {
        console.error("Error loading structure from data:", e);
        setIpsaeStatus('Failed to load model structure.', 'error');
    }
}

async function handleLoadAllModels() {
    if (modelBundles.length === 0) return;

    try {
        // Clear previous models
        window.Viewer.getInstance().plugin.clear();

        for (const bundle of modelBundles) {
            const cifContent = await getBundleText(bundle, 'cif');
            await window.Viewer.loadStructureFromData(cifContent, 'mmcif', false);
            console.log(`Structure loaded from data for model file: ${bundle.cif?.name || bundle.displayName}`);
        }
    } catch (e) {
        console.error("Error loading all models:", e);
    }
}

async function getBundleText(bundle, key) {
    const target = bundle?.[key];
    if (!target) {
        throw new Error(`Missing ${key} for selected model.`);
    }
    if (typeof target.text === 'string') return target.text;
    if (typeof target.readText === 'function') {
        target.text = await target.readText();
        return target.text;
    }
    if (target.entry) {
        target.text = await target.entry.async('string');
        return target.text;
    }
    throw new Error(`File source for ${key} is not available.`);
}

function formatNumber(value, decimals = 4) {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const factor = Math.pow(10, decimals);
    return (Math.round(Number(value) * factor) / factor).toFixed(decimals);
}

function formatIpsaeValue(row, column) {
    const value = row[column.key];
    if (column.numeric) {
        return formatNumber(value, column.decimals ?? 4);
    }
    return value ?? '—';
}

function buildIpsaeHeader(thead, columns, descriptions = {}) {
    if (!thead) return;
    const row = document.createElement('tr');
    columns.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col.label;
        th.dataset.key = col.key;
        if (col.numeric) {
            th.dataset.numeric = 'true';
        }
        if (descriptions[col.key]) {
            th.title = descriptions[col.key];
        }
        row.appendChild(th);
    });
    thead.innerHTML = '';
    thead.appendChild(row);
}

function setIpsaeStatus(message, type = 'info') {
    if (!ipsaeElements.status) return;
    ipsaeElements.status.textContent = message || '';
    ipsaeElements.status.classList.remove('info', 'success', 'error');
    ipsaeElements.status.classList.add(type);
}

function resetIpsaeUI() {
    if (ipsaeElements.button) {
        ipsaeElements.button.disabled = true;
    }
    if (ipsaeElements.summaryBody) {
        ipsaeElements.summaryBody.innerHTML = '';
    }
    if (ipsaeElements.residueBody) {
        ipsaeElements.residueBody.innerHTML = '';
    }
    if (ipsaeElements.summaryFilter) {
        ipsaeElements.summaryFilter.value = '';
    }
    ipsaeState.summaryRows = [];
    ipsaeState.residueRows = [];
    ipsaeState.viewIndices = [];
    ipsaeState.filterValue = '';
    ipsaeState.selectedIndex = null;
    ipsaeState.sort = { key: 'ipSAE', direction: 'desc' };
    renderIpsaeMetricsPlaceholder();
    if (ipsaeElements.results) {
        ipsaeElements.results.classList.add('hidden');
    }
    setIpsaeStatus('Upload a ZIP file to enable ipSAE.', 'info');
}

function setIpsaeResults(result) {
    const summaryRows = (result?.summaryRows || []).map((row) => ({
        ...row,
        searchText: ipsaeColumns.map((col) => String(row[col.key] ?? '')).join(' ').toLowerCase()
    }));
    ipsaeState.summaryRows = summaryRows;
    ipsaeState.residueRows = result?.residueRows || [];
    ipsaeState.viewIndices = summaryRows.map((_, index) => index);
    ipsaeState.selectedIndex = ipsaeState.viewIndices[0] ?? null;

    const filterValue = ipsaeElements.summaryFilter?.value?.trim() ?? '';
    if (filterValue) {
        applyIpsaeFilter(filterValue);
    }
    applyIpsaeSort();
    renderIpsaeSummaryTable();
    if (ipsaeElements.results) {
        ipsaeElements.results.classList.remove('hidden');
    }
}

function applyIpsaeFilter(value) {
    const tokens = (value || '')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
    ipsaeState.filterValue = value || '';
    if (!tokens.length) {
        ipsaeState.viewIndices = ipsaeState.summaryRows.map((_, index) => index);
        ipsaeState.selectedIndex = ipsaeState.viewIndices[0] ?? null;
        return;
    }

    ipsaeState.viewIndices = ipsaeState.summaryRows.reduce((acc, row, index) => {
        const haystack = row.searchText || '';
        if (tokens.every((token) => haystack.includes(token))) {
            acc.push(index);
        }
        return acc;
    }, []);

    if (!ipsaeState.viewIndices.includes(ipsaeState.selectedIndex)) {
        ipsaeState.selectedIndex = ipsaeState.viewIndices[0] ?? null;
    }
}

function applyIpsaeSort() {
    const { key, direction } = ipsaeState.sort;
    const column = ipsaeColumns.find((col) => col.key === key);
    if (!column) return;
    const multiplier = direction === 'asc' ? 1 : -1;

    ipsaeState.viewIndices.sort((a, b) => {
        const rowA = ipsaeState.summaryRows[a];
        const rowB = ipsaeState.summaryRows[b];
        const valueA = rowA?.[key];
        const valueB = rowB?.[key];

        if (column.numeric) {
            const numA = Number(valueA);
            const numB = Number(valueB);
            if (Number.isNaN(numA) && Number.isNaN(numB)) return 0;
            if (Number.isNaN(numA)) return 1;
            if (Number.isNaN(numB)) return -1;
            if (numA === numB) return 0;
            return numA < numB ? -1 * multiplier : 1 * multiplier;
        }

        const strA = String(valueA ?? '');
        const strB = String(valueB ?? '');
        return strA.localeCompare(strB) * multiplier;
    });

    updateIpsaeSortIndicators();
}

function updateIpsaeSortIndicators() {
    if (!ipsaeElements.summaryHead) return;
    const { key, direction } = ipsaeState.sort;
    ipsaeElements.summaryHead.querySelectorAll('th').forEach((th) => {
        if (th.dataset.key === key) {
            th.dataset.sort = direction;
            th.dataset.sortSymbol = direction === 'asc' ? '▲' : '▼';
        } else {
            th.dataset.sort = '';
            th.dataset.sortSymbol = '';
        }
    });
}

function renderIpsaeSummaryTable() {
    if (!ipsaeElements.summaryBody) return;
    ipsaeElements.summaryBody.innerHTML = '';

    if (!ipsaeState.viewIndices.length) {
        const emptyRow = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = ipsaeColumns.length;
        cell.textContent = 'No chain-pair rows were produced for these thresholds.';
        emptyRow.appendChild(cell);
        ipsaeElements.summaryBody.appendChild(emptyRow);
        renderIpsaeMetricsPlaceholder();
        renderIpsaeResidueTable([]);
        return;
    }

    ipsaeState.viewIndices.forEach((index) => {
        const row = ipsaeState.summaryRows[index];
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        if (ipsaeState.selectedIndex === index) {
            tr.classList.add('is-selected');
        }

        ipsaeColumns.forEach((col) => {
            const td = document.createElement('td');
            td.textContent = formatIpsaeValue(row, col);
            tr.appendChild(td);
        });

        ipsaeElements.summaryBody.appendChild(tr);
    });

    updateIpsaeDetailPanel();
}

function updateIpsaeControls(bundle) {
    if (!ipsaeElements.button) return;
    const ready = Boolean(bundle && bundle.cif && bundle.fullData);
    ipsaeElements.button.disabled = !ready;
    if (!ready) {
        if (modelBundles.length === 0) {
            setIpsaeStatus('Upload a ZIP file to enable ipSAE.', 'info');
        } else {
            setIpsaeStatus('Select a model that includes CIF and full_data files.', 'info');
        }
        if (ipsaeElements.results) {
            ipsaeElements.results.classList.add('hidden');
        }
    } else {
        setIpsaeStatus(`Ready to compute ipSAE for ${bundle.cif?.name || bundle.displayName}.`, 'info');
    }
}

function updateIpsaeDetailPanel() {
    if (!ipsaeElements.metrics) {
        return;
    }
    const index = ipsaeState.selectedIndex;
    if (index === null || index === undefined || !ipsaeState.summaryRows[index]) {
        renderIpsaeMetricsPlaceholder();
        renderIpsaeResidueTable([]);
        return;
    }

    const row = ipsaeState.summaryRows[index];
    renderIpsaeMetrics(row);
    const residues = ipsaeState.residueRows.filter(
        (residue) => residue.alignChain === row.chn1 && residue.scoredChain === row.chn2
    );
    renderIpsaeResidueTable(residues);
}

function renderIpsaeMetrics(row) {
    if (!ipsaeElements.metrics) return;
    const metrics = [
        { key: 'chainPair', label: 'Chain pair', value: `${row.chn1} → ${row.chn2} (${row.type})` },
        { key: 'ipSAE', label: 'ipSAE', value: formatNumber(row.ipSAE, 6) },
        { key: 'ipSAE_d0chn', label: 'ipSAE d0chn', value: formatNumber(row.ipSAE_d0chn, 6) },
        { key: 'ipSAE_d0dom', label: 'ipSAE d0dom', value: formatNumber(row.ipSAE_d0dom, 6) },
        { key: 'ipTM_af', label: 'ipTM (AF)', value: formatNumber(row.ipTM_af, 3) },
        { key: 'ipTM_d0chn', label: 'ipTM d0chn', value: formatNumber(row.ipTM_d0chn, 6) },
        { key: 'pDockQ', label: 'pDockQ', value: formatNumber(row.pDockQ, 4) },
        { key: 'pDockQ2', label: 'pDockQ2', value: formatNumber(row.pDockQ2, 4) },
        { key: 'LIS', label: 'LIS', value: formatNumber(row.LIS, 4) },
        { key: 'n0res', label: 'n0res', value: formatNumber(row.n0res, 0) },
        { key: 'n0chn', label: 'n0chn', value: formatNumber(row.n0chn, 0) },
        { key: 'n0dom', label: 'n0dom', value: formatNumber(row.n0dom, 0) },
        { key: 'd0res', label: 'd0res', value: formatNumber(row.d0res, 2) },
        { key: 'd0chn', label: 'd0chn', value: formatNumber(row.d0chn, 2) },
        { key: 'd0dom', label: 'd0dom', value: formatNumber(row.d0dom, 2) },
        { key: 'nres1', label: 'nres (chn1)', value: formatNumber(row.nres1, 0) },
        { key: 'nres2', label: 'nres (chn2)', value: formatNumber(row.nres2, 0) },
        { key: 'dist1', label: 'dist hits (chn1)', value: formatNumber(row.dist1, 0) },
        { key: 'dist2', label: 'dist hits (chn2)', value: formatNumber(row.dist2, 0) },
        { key: 'model', label: 'Model', value: row.model }
    ];

    ipsaeElements.metrics.innerHTML = '';
    metrics.forEach((metric) => {
        const dt = document.createElement('dt');
        dt.textContent = metric.label;
        if (ipsaeMetricTooltips[metric.key]) {
            dt.title = ipsaeMetricTooltips[metric.key];
        }
        const dd = document.createElement('dd');
        dd.textContent = metric.value;
        ipsaeElements.metrics.appendChild(dt);
        ipsaeElements.metrics.appendChild(dd);
    });
}

function renderIpsaeMetricsPlaceholder() {
    if (!ipsaeElements.metrics) return;
    ipsaeElements.metrics.innerHTML = '';
    const dt = document.createElement('dt');
    dt.textContent = 'No selection';
    const dd = document.createElement('dd');
    dd.textContent = 'Select a chain pair to inspect detailed metrics.';
    ipsaeElements.metrics.appendChild(dt);
    ipsaeElements.metrics.appendChild(dd);
}

function renderIpsaeResidueTable(rows) {
    if (!ipsaeElements.residueBody) return;
    ipsaeElements.residueBody.innerHTML = '';
    if (!rows.length) {
        const emptyRow = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = ipsaeResidueColumns.length;
        cell.textContent = 'No residue-level contacts for this orientation.';
        emptyRow.appendChild(cell);
        ipsaeElements.residueBody.appendChild(emptyRow);
        return;
    }

    rows.forEach((row) => {
        const tr = document.createElement('tr');
        ipsaeResidueColumns.forEach((col) => {
            const td = document.createElement('td');
            td.textContent = formatIpsaeValue(row, col);
            tr.appendChild(td);
        });
        ipsaeElements.residueBody.appendChild(tr);
    });
}

function handleIpsaeSummaryFilter(event) {
    applyIpsaeFilter(event.target.value || '');
    applyIpsaeSort();
    renderIpsaeSummaryTable();
}

function handleIpsaeSummarySort(event) {
    const th = event.target.closest('th');
    if (!th || !th.dataset.key) return;
    const key = th.dataset.key;
    const column = ipsaeColumns.find((col) => col.key === key);
    if (!column) return;

    const direction = ipsaeState.sort.key === key && ipsaeState.sort.direction === 'asc' ? 'desc' : 'asc';
    ipsaeState.sort = { key, direction };
    applyIpsaeSort();
    renderIpsaeSummaryTable();
}

function handleIpsaeSummaryClick(event) {
    const tr = event.target.closest('tr');
    if (!tr || typeof tr.dataset.index === 'undefined') return;
    const index = Number(tr.dataset.index);
    if (Number.isNaN(index)) return;
    ipsaeState.selectedIndex = index;
    renderIpsaeSummaryTable();
}

function handleIpsaeTabClick(event) {
    const button = event.currentTarget;
    const target = button.dataset.tab;
    if (!target) return;

    ipsaeElements.tabs?.forEach((tab) => {
        const isActive = tab === button;
        tab.classList.toggle('ipsae-tab--active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    ipsaeElements.tabPanels?.forEach((panel) => {
        const isTarget = panel.id === `ipsaeTab-${target}`;
        panel.classList.toggle('ipsae-tab-panel--active', isTarget);
        panel.hidden = !isTarget;
    });
}

function scheduleAutomaticIpsaeRun() {
    if (!currentModelBundle || !currentModelBundle.cif || !currentModelBundle.fullData) return;
    if (pendingAutoIpsaeRun) {
        clearTimeout(pendingAutoIpsaeRun);
    }
    pendingAutoIpsaeRun = setTimeout(() => {
        pendingAutoIpsaeRun = null;
        runIpsaeForCurrentModel({ autoTriggered: true });
    }, 250);
}

async function runIpsaeForCurrentModel(options = {}) {
    const { autoTriggered = false } = options;
    if (pendingAutoIpsaeRun) {
        clearTimeout(pendingAutoIpsaeRun);
        pendingAutoIpsaeRun = null;
    }

    if (!currentModelBundle || !currentModelBundle.cif || !currentModelBundle.fullData) {
        setIpsaeStatus('Select a model to run ipSAE.', 'error');
        return;
    }
    if (!window.IpsaeRunner || typeof window.IpsaeRunner.run !== 'function') {
        setIpsaeStatus('ipSAE runtime is not available.', 'error');
        return;
    }
    if (ipsaeRunInFlight) {
        if (autoTriggered) {
            scheduleAutomaticIpsaeRun();
        }
        return;
    }

    const paeCutoff = Number(ipsaeElements.paeInput?.value) || 10;
    const distCutoff = Number(ipsaeElements.distInput?.value) || 10;

    const actionLabel = autoTriggered ? 'Auto-running ipSAE for selected model…' : 'Loading ipSAE runtime…';
    setIpsaeStatus(actionLabel, 'info');
    if (ipsaeElements.button) {
        ipsaeElements.button.disabled = true;
    }
    ipsaeRunInFlight = true;

    try {
        const [structureText, paeText, summaryText] = await Promise.all([
            getBundleText(currentModelBundle, 'cif'),
            getBundleText(currentModelBundle, 'fullData'),
            currentModelBundle.summary ? getBundleText(currentModelBundle, 'summary') : Promise.resolve(null)
        ]);

        const result = await window.IpsaeRunner.run({
            structure: { name: currentModelBundle.cif.name, text: structureText },
            pae: { name: currentModelBundle.fullData.name, text: paeText },
            summary: summaryText ? { name: currentModelBundle.summary.name, text: summaryText } : null,
            paeCutoff,
            distCutoff
        });

        setIpsaeResults(result);
        setIpsaeStatus('ipSAE calculation complete.', 'success');
    } catch (error) {
        console.error('ipSAE run failed:', error);
        setIpsaeStatus(`ipSAE failed: ${error.message || error}`, 'error');
    } finally {
        ipsaeRunInFlight = false;
        if (ipsaeElements.button) {
            ipsaeElements.button.disabled = !(currentModelBundle && currentModelBundle.cif && currentModelBundle.fullData);
        }
    }
}

function initIpsaeUI() {
    ipsaeElements.section = document.querySelector('.ipsae-section');
    ipsaeElements.paeInput = document.getElementById('ipsaePaeCutoff');
    ipsaeElements.distInput = document.getElementById('ipsaeDistCutoff');
    ipsaeElements.button = document.getElementById('runIpsaeButton');
    ipsaeElements.status = document.getElementById('ipsaeStatus');
    ipsaeElements.results = document.getElementById('ipsaeResults');
    ipsaeElements.summaryTable = document.getElementById('ipsaeSummaryTable');
    ipsaeElements.summaryHead = ipsaeElements.summaryTable ? ipsaeElements.summaryTable.querySelector('thead') : null;
    ipsaeElements.summaryBody = ipsaeElements.summaryTable ? ipsaeElements.summaryTable.querySelector('tbody') : null;
    ipsaeElements.summaryFilter = document.getElementById('ipsaeSummaryFilter');
    ipsaeElements.residueTable = document.getElementById('ipsaeResidueTable');
    ipsaeElements.residueHead = ipsaeElements.residueTable ? ipsaeElements.residueTable.querySelector('thead') : null;
    ipsaeElements.residueBody = ipsaeElements.residueTable ? ipsaeElements.residueTable.querySelector('tbody') : null;
    ipsaeElements.metrics = document.getElementById('ipsaeMetrics');
    ipsaeElements.tabs = Array.from(document.querySelectorAll('.ipsae-tab'));
    ipsaeElements.tabPanels = Array.from(document.querySelectorAll('.ipsae-tab-panel'));

    if (ipsaeElements.summaryHead) {
        buildIpsaeHeader(ipsaeElements.summaryHead, ipsaeColumns, ipsaeColumnTooltips);
    }
    if (ipsaeElements.residueHead) {
        buildIpsaeHeader(ipsaeElements.residueHead, ipsaeResidueColumns, ipsaeResidueColumnTooltips);
    }

    ipsaeElements.summaryFilter?.addEventListener('input', handleIpsaeSummaryFilter);
    ipsaeElements.summaryHead?.addEventListener('click', handleIpsaeSummarySort);
    ipsaeElements.summaryBody?.addEventListener('click', handleIpsaeSummaryClick);
    ipsaeElements.tabs?.forEach((tab) => tab.addEventListener('click', handleIpsaeTabClick));

    if (ipsaeElements.button) {
        ipsaeElements.button.addEventListener('click', () => runIpsaeForCurrentModel({ autoTriggered: false }));
    }

    resetIpsaeUI();
}

// async function handleSuperposeAllModels() {
//     if (modelFiles.length === 0) return;

//     try {
//         // Clear previous models
//         window.Viewer.getInstance().plugin.clear();

//         const urls = await Promise.all(modelFiles.map(async ([filename, fileEntry]) => URL.createObjectURL(new Blob([await fileEntry.async('blob')]))));

//         await window.Viewer.superposeModels(urls, 'mmcif');
//         console.log('All models superposed successfully');
//     } catch (e) {
//         console.error("Error superposing all models:", e);
//     }
// }

async function walkDirectoryEntry(dirEntry, prefix = "") {
    const entries = [];
    const reader = dirEntry.createReader();

    const readAllEntries = () =>
        new Promise((resolve, reject) => {
            const batch = [];
            const readBatch = () => {
                reader.readEntries((results) => {
                    if (!results.length) {
                        resolve(batch);
                    } else {
                        batch.push(...results);
                        readBatch();
                    }
                }, reject);
            };
            readBatch();
        });

    const children = await readAllEntries();
    for (const child of children) {
        const childPath = prefix ? `${prefix}/${child.name}` : child.name;
        if (child.isFile) {
            entries.push({
                path: childPath.replace(/\\/g, "/"),
                readText: () =>
                    new Promise((resolve, reject) => {
                        child.file(
                            (file) => file.text().then(resolve, reject),
                            reject
                        );
                    })
            });
        } else if (child.isDirectory) {
            const nested = await walkDirectoryEntry(child, childPath);
            entries.push(...nested);
        }
    }
    return entries;
}

async function collectEntriesFromDataTransfer(dataTransfer) {
    const items = Array.from(dataTransfer?.items || []);
    const hasEntryApi = items.some((item) => typeof item.webkitGetAsEntry === "function");

    if (hasEntryApi) {
        const allEntries = [];
        for (const item of items) {
            if (item.kind !== "file") continue;
            let entry = null;
            try {
                entry = item.webkitGetAsEntry();
            } catch {
                continue;
            }
            if (!entry) continue;

            if (entry.isFile) {
                allEntries.push({
                    path: entry.name.replace(/\\/g, "/"),
                    readText: () =>
                        new Promise((resolve, reject) => {
                            entry.file(
                                (file) => file.text().then(resolve, reject),
                                reject
                            );
                        })
                });
            } else if (entry.isDirectory) {
                const dirEntries = await walkDirectoryEntry(entry, entry.name);
                allEntries.push(...dirEntries);
            }
        }
        if (allEntries.length > 0) return allEntries;
    }

    return collectEntriesFromFileList(dataTransfer?.files || []);
}

function setupDragAndDrop() {
    const dropZone = document.getElementById("dropZone") || document.querySelector(".upload-section");
    const zipInput = document.getElementById("zipUpload");

    if (!dropZone) return;

    dropZone.addEventListener("click", (event) => {
        if (event.target === zipInput) return;
        if (zipInput) {
            zipInput.value = "";
            zipInput.click();
        }
    });

    ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropZone.classList.add("drag-over");
        });
    });

    ["dragleave", "dragend"].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            event.stopPropagation();
            dropZone.classList.remove("drag-over");
        });
    });

    dropZone.addEventListener("drop", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        dropZone.classList.remove("drag-over");
        await handleFileUpload(event);
    });
}

// Simplified initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initIpsaeUI();

        const zipInput = document.getElementById('zipUpload');
        if (zipInput) {
            zipInput.addEventListener('change', handleFileUpload);
        }
        setupDragAndDrop();
        console.log('File and folder upload initialized');

        // Initialize Molstar viewer
        console.log('Initializing Molstar after DOMContentLoaded...');
        const containerId = 'visualisationContent';
        await window.Viewer.init(containerId);

        // Add event listener for model selector
        const modelSelector = document.getElementById('modelSelector');
        modelSelector.addEventListener('change', handleModelChange);

        // Add event listener for load all models button
        const loadAllModelsButton = document.getElementById('loadAllModelsButton');
        loadAllModelsButton.addEventListener('click', handleLoadAllModels);

        // Add event listeners for color buttons
        const colorByChainButton = document.getElementById('colorByChainButton');
        colorByChainButton.addEventListener('click', () => {
            console.log('Color by Chain button clicked');
            window.Viewer.updateColorTheme('chain-id');
        });

        const colorByPLDDTButton = document.getElementById('colorByPLDDTButton');
        colorByPLDDTButton.addEventListener('click', () => {
            console.log('Color by pLDDT button clicked');
            window.Viewer.updateColorTheme('plddt-confidence');
        });

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize: ' + error.message);
    }
});
