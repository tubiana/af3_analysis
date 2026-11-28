// Plotly makeSubplots polyfill
if (typeof Plotly.makeSubplots !== 'function') {
    Plotly.makeSubplots = function(options) {
        const rows = options.rows, cols = options.cols;
        const hSpacing = options.horizontal_spacing || 0;
        const vSpacing = options.vertical_spacing || 0;
        let layout = {};

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c + 1;
                const x0 = c / cols + hSpacing / 2;
                const x1 = (c + 1) / cols - hSpacing / 2;
                const y0 = 1 - (r + 1) / rows + vSpacing / 2;
                const y1 = 1 - r / rows - vSpacing / 2;
                const xKey = i === 1 ? 'xaxis' : 'xaxis' + i;
                const yKey = i === 1 ? 'yaxis' : 'yaxis' + i;
                layout[xKey] = { domain: [x0, x1], anchor: yKey };
                layout[yKey] = { domain: [y0, y1], anchor: xKey };
            }
        }

        if (options.subplot_titles) {
            layout.annotations = options.subplot_titles.map((title, index) => ({
                text: title,
                x: (index % cols) / cols + 0.5 / cols,
                y: 1 - Math.floor(index / cols) / rows,
                xref: 'paper',
                yref: 'paper',
                showarrow: false,
                font: { size: 14 }
            }));
        }

        return { data: [], layout: layout };
    };
}

const PAE_PAGE_SIZE = 5;
let paeState = {
    entries: [],
    page: 0
};

function comparePaeKeys(aKey, bKey) {
    const aIsTop = String(aKey).toLowerCase() === 'top-level';
    const bIsTop = String(bKey).toLowerCase() === 'top-level';
    if (aIsTop && !bIsTop) return 1;
    if (!aIsTop && bIsTop) return -1;
    if (aIsTop && bIsTop) return 0;

    const re = /^seed-(\d+)_sample-(\d+)$/i;
    const ma = String(aKey).match(re);
    const mb = String(bKey).match(re);
    if (ma && mb) {
        const seedDiff = Number(ma[1]) - Number(mb[1]);
        if (seedDiff !== 0) return seedDiff;
        return Number(ma[2]) - Number(mb[2]);
    }

    const numA = Number(aKey);
    const numB = Number(bKey);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        return numA - numB;
    }

    return String(aKey).localeCompare(String(bKey), undefined, { numeric: true });
}

function ensureCleanPAEStyles() {
    if (document.getElementById('pae-clean-styles')) return;
    const style = document.createElement('style');
    style.id = 'pae-clean-styles';
    style.textContent = `
        #paeMatrices,
        #paeMatrices > div,
        #paeMatrices .pae-grid > div,
        #paeMatrices .js-plotly-plot,
        #paeMatrices .plot-container,
        #paeMatrices .svg-container {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            border-radius: 0 !important;
        }
    `;
    document.head.appendChild(style);
}

function drawPanelColorbar(barEl, paeMatrix, panelHeight) {
    const barHeight = Math.max(240, Math.round(panelHeight * 0.92));
    const trace = {
        z: paeMatrix,
        type: 'heatmap',
        opacity: 0,
        colorscale: [
            [0, 'rgb(0,0,255)'],
            [0.5, 'rgb(255,255,255)'],
            [1, 'rgb(255,0,0)']
        ],
        zauto: false,
        zmin: 0,
        zmax: 30,
        showscale: true,
        colorbar: {
            x: 0.05,
            xanchor: 'left',
            y: 0.5,
            yanchor: 'middle',
            len: barHeight,
            lenmode: 'pixels',
            thickness: 24,
            outlinewidth: 1,
            outlinecolor: 'rgba(0,0,0,0.45)',
            borderwidth: 0,
            tickmode: 'linear',
            tick0: 0,
            dtick: 5,
            tickfont: { size: 11 }
        },
        hoverinfo: 'none'
    };

    const layout = {
        width: 100,
        height: panelHeight,
        margin: { t: 8, b: 8, l: 0, r: 45 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { visible: false, showgrid: false, zeroline: false },
        yaxis: { visible: false, showgrid: false, zeroline: false }
    };

    Plotly.newPlot(barEl, [trace], layout, { responsive: false, displayModeBar: false });
}

function renderPAEPage() {
    const paeDiv = document.getElementById('paeMatrices');
    if (!paeDiv) return;

    ensureCleanPAEStyles();

    const { entries, page } = paeState;
    const total = entries.length;
    if (total === 0) {
        paeDiv.innerHTML = '';
        return;
    }

    const totalPages = Math.max(1, Math.ceil(total / PAE_PAGE_SIZE));
    const safePage = Math.max(0, Math.min(page, totalPages - 1));
    paeState.page = safePage;

    const start = safePage * PAE_PAGE_SIZE;
    const slice = entries.slice(start, start + PAE_PAGE_SIZE);

    paeDiv.innerHTML = '';

    const navBar = document.createElement('div');
    navBar.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = 'Prev 5';
    prevBtn.disabled = safePage === 0;
    prevBtn.addEventListener('click', () => {
        paeState.page = Math.max(0, paeState.page - 1);
        renderPAEPage();
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Next 5';
    nextBtn.disabled = safePage >= totalPages - 1;
    nextBtn.addEventListener('click', () => {
        paeState.page = Math.min(totalPages - 1, paeState.page + 1);
        renderPAEPage();
    });

    const statusSpan = document.createElement('span');
    statusSpan.textContent = `Showing ${start + 1}–${Math.min(start + PAE_PAGE_SIZE, total)} of ${total} (Page ${safePage + 1}/${totalPages})`;

    navBar.append(prevBtn, nextBtn, statusSpan);
    paeDiv.appendChild(navBar);

    const panelRow = document.createElement('div');
    panelRow.style.cssText = 'display:flex;align-items:center;gap:14px;width:100%;';
    paeDiv.appendChild(panelRow);

    const grid = document.createElement('div');
    grid.className = 'pae-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:start;flex:1 1 auto;min-width:0;';
    panelRow.appendChild(grid);

    const barWidth = 100;
    const rowGap = 14;
    const availableGridWidth = Math.max(360, (paeDiv.clientWidth || window.innerWidth - 60) - barWidth - rowGap);
    const colWidth = Math.floor((availableGridWidth - 32) / 3);
    const size = Math.max(260, colWidth - 12);

    const chainBoundaries = findChainBoundariesForPAE(entries[0][1]);

    slice.forEach(([modelNum, data]) => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;';

        const titleEl = document.createElement('div');
        titleEl.textContent = `Model ${modelNum}`;
        titleEl.style.cssText = 'font-weight:500;font-size:14px;margin-bottom:4px;text-align:center;';

        const plotEl = document.createElement('div');
        plotEl.style.cssText = `width:${size}px;height:${size}px;`;

        item.append(titleEl, plotEl);
        grid.appendChild(item);

        const matrixSize = data.pae.length;

        const trace = {
            z: data.pae,
            type: 'heatmap',
            colorscale: [
                [0, 'rgb(0,0,255)'],
                [0.5, 'rgb(255,255,255)'],
                [1, 'rgb(255,0,0)']
            ],
            zauto: false,
            zmin: 0,
            zmax: 30,
            showscale: false,
            hoverongaps: false
        };

        const shapes = chainBoundaries.flatMap((boundary) => [
            {
                type: 'line',
                x0: boundary,
                x1: boundary,
                y0: 0,
                y1: matrixSize,
                line: { color: 'rgba(0,0,0,0.85)', width: 2 }
            },
            {
                type: 'line',
                x0: 0,
                x1: matrixSize,
                y0: boundary,
                y1: boundary,
                line: { color: 'rgba(0,0,0,0.85)', width: 2 }
            }
        ]);

        const layout = {
            width: size,
            height: size,
            margin: { t: 4, b: 28, l: 38, r: 10 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            xaxis: {
                showline: false,
                showgrid: false,
                zeroline: false,
                tickfont: { size: 10 }
            },
            yaxis: {
                showline: false,
                showgrid: false,
                zeroline: false,
                tickfont: { size: 10 }
            },
            shapes
        };

        Plotly.newPlot(plotEl, [trace], layout, { responsive: false, displayModeBar: false });
    });

    const rowsCount = Math.ceil(slice.length / 3);
    const itemHeight = size + 26;
    const panelHeight = rowsCount * itemHeight + (rowsCount - 1) * 16;
    const barEl = document.createElement('div');
    barEl.style.cssText = `width:${barWidth}px;height:${panelHeight}px;flex-shrink:0;`;
    panelRow.appendChild(barEl);
    drawPanelColorbar(barEl, slice[0][1].pae, panelHeight);
}

function drawPAEMatrices(modelData) {
    paeState.entries = Array.from(modelData.entries()).sort(([a], [b]) => comparePaeKeys(a, b));
    paeState.page = 0;
    renderPAEPage();
}

// Helper function to find chain boundaries in PAE data
function findChainBoundariesForPAE(data) {
    const chainChanges = [];
    let currentChain = data.chainIds[0];
    let atomsPerResidue = 0;

    let atomsFound = 0;
    for (let i = 0; i < Math.min(100, data.chainIds.length); i++) {
        atomsFound++;
        if (i > 5 && i % atomsFound === 0) {
            atomsPerResidue = atomsFound;
            break;
        }
    }

    if (atomsPerResidue === 0 || atomsPerResidue > 15) atomsPerResidue = 10;

    for (let i = 0; i < data.chainIds.length; i++) {
        if (data.chainIds[i] !== currentChain) {
            const residuePosition = Math.floor(i / atomsPerResidue);
            chainChanges.push(residuePosition);
            currentChain = data.chainIds[i];
        }
    }

    const estimatedTotalResidues = Math.ceil(data.chainIds.length / atomsPerResidue);
    const paeMatrixSize = data.pae.length;
    const scaleFactor = paeMatrixSize / estimatedTotalResidues;

    return chainChanges.map((pos) => Math.round(pos * scaleFactor));
}

// New function to process pLDDT data for proteins/nucleic acids vs other molecules
function processPLDDTData(modelData) {
    const processedData = new Map();

    for (const [modelNum, data] of modelData.entries()) {
        const processed = {
            residueIndices: [],
            residuePLDDTs: [],
            atomIndices: [],
            atomPLDDTs: []
        };

        const residueGroups = new Map();
        const otherAtoms = {
            indices: [],
            plddts: []
        };

        for (let i = 0; i < data.plddts.length; i++) {
            const chainId = data.chainIds[i];
            const plddt = data.plddts[i];

            if (isProteinOrNucleicAcid(chainId)) {
                const residueId = extractResidueId(i, chainId);
                if (!residueGroups.has(residueId)) {
                    residueGroups.set(residueId, []);
                }
                residueGroups.get(residueId).push(plddt);
            } else {
                otherAtoms.indices.push(i);
                otherAtoms.plddts.push(plddt);
            }
        }

        let currentResidueIndex = 0;
        for (const [, plddts] of residueGroups.entries()) {
            const avgPLDDT = plddts.reduce((sum, val) => sum + val, 0) / plddts.length;
            processed.residueIndices.push(currentResidueIndex++);
            processed.residuePLDDTs.push(avgPLDDT);
        }

        processed.atomIndices = otherAtoms.indices;
        processed.atomPLDDTs = otherAtoms.plddts;
        processedData.set(modelNum, processed);
    }

    return processedData;
}

function isProteinOrNucleicAcid(chainId) {
    return true;
}

function extractResidueId(atomIndex, chainId) {
    return Math.floor(atomIndex / 10);
}

// Enhanced pLDDT plotting function with chain boundaries
function drawPLDDTPlot(modelData) {
    console.log('Drawing pLDDT plot with data:', modelData);

    try {
        const plotEl = document.getElementById('pLDDTPlot');
        if (!plotEl) return;

        // Sort models consistently
        const sortedEntries = Array.from(modelData.entries()).sort(([a], [b]) => comparePaeKeys(a, b));
        const sortedModelData = new Map(sortedEntries);

        // Group pLDDT values by residue for each model
        const residueData = processResidueData(sortedModelData);

        // Create traces for plotting
        const traces = [];
        for (const [modelNum, data] of residueData.entries()) {
            traces.push({
                x: data.residueIndices,
                y: data.residuePLDDTs,
                name: `Model ${modelNum}`,
                type: 'scatter',
                mode: 'lines',
                hoverinfo: 'y+text',
                text: data.residueLabels,
                line: {
                    width: 2
                }
            });
        }

        // Find chain boundaries for the first model
        const firstModelData = residueData.get(Array.from(residueData.keys())[0]);
        const chainBoundaries = findChainBoundariesForPLDDT(firstModelData);
        console.log('Chain boundaries for pLDDT:', chainBoundaries);

        // Create vertical line shapes for chain boundaries
        const shapes = chainBoundaries.map((position) => ({
            type: 'line',
            x0: position,
            x1: position,
            y0: 0,
            y1: 100,
            line: {
                color: 'black',
                width: 2
            }
        }));

        // Estimate legend height dynamically while letting Plotly control width
        const containerWidth = plotEl.clientWidth || plotEl.parentElement?.clientWidth || window.innerWidth - 80;
        const maxLabelChars = traces.reduce((max, t) => Math.max(max, (t.name || '').length), 10);
        const estimatedItemWidth = Math.max(150, maxLabelChars * 7.8 + 42);
        const colsPerRow = Math.max(1, Math.floor((containerWidth - 60) / estimatedItemWidth));
        const legendRows = Math.max(1, Math.ceil(traces.length / colsPerRow));

        const plotHeight = 315;
        const xAxisBlockPx = 54; // ticks + "Residue Number" title
        const legendGapPx = 8;
        const legendHeight = legendRows * 18 + 12;
        const bottomMargin = xAxisBlockPx + legendGapPx + legendHeight;
        const totalHeight = plotHeight + bottomMargin;
        const legendY = -((xAxisBlockPx + legendGapPx) / plotHeight);

        Plotly.newPlot(
            plotEl,
            traces,
            {
                title: {
                    text: 'pLDDT Scores by Residue',
                    font: { size: 15 }
                },
                height: totalHeight,
                margin: { t: 42, b: bottomMargin, l: 55, r: 25 },
                yaxis: {
                    title: { text: 'pLDDT', standoff: 6 },
                    range: [0, 100]
                },
                xaxis: {
                    title: { text: 'Residue Number', standoff: 6 }
                },
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: legendY,
                    yanchor: 'top',
                    font: { size: 11 }
                },
                shapes: shapes
            },
            { responsive: true }
        );
    } catch (error) {
        console.error('Error processing pLDDT data:', error);
    }
}

function processResidueData(modelData) {
    const residueData = new Map();

    for (const [modelNum, data] of modelData.entries()) {
        const processedData = {
            residueIndices: [],
            residuePLDDTs: [],
            residueLabels: []
        };

        const residueGroups = new Map();
        const residueBoundaries = findResidueBoundaries(data.chainIds);

        let currentResidueNum = 1;
        let currentChain = data.chainIds[0];

        for (let i = 0; i < data.plddts.length; i++) {
            const chainId = data.chainIds[i];
            const plddt = data.plddts[i];

            if (i > 0 && residueBoundaries.includes(i)) {
                currentResidueNum++;
                if (chainId !== currentChain) {
                    currentResidueNum = 1;
                    currentChain = chainId;
                }
            }

            const residueKey = `${chainId}_${currentResidueNum}`;
            if (!residueGroups.has(residueKey)) {
                residueGroups.set(residueKey, {
                    sum: 0,
                    count: 0,
                    chain: chainId,
                    resNum: currentResidueNum
                });
            }

            const entry = residueGroups.get(residueKey);
            entry.sum += plddt;
            entry.count += 1;
        }

        const sortedResidues = Array.from(residueGroups.values()).sort((a, b) => {
            if (a.chain !== b.chain) return a.chain.localeCompare(b.chain);
            return a.resNum - b.resNum;
        });

        for (let i = 0; i < sortedResidues.length; i++) {
            const residue = sortedResidues[i];
            const avgPLDDT = residue.sum / residue.count;

            processedData.residueIndices.push(i + 1);
            processedData.residuePLDDTs.push(avgPLDDT);
            processedData.residueLabels.push(`Chain ${residue.chain}, Residue ${residue.resNum}`);
        }

        residueData.set(modelNum, processedData);
    }

    return residueData;
}

function findResidueBoundaries(chainIds) {
    const boundaries = [];
    let currentChain = chainIds[0];

    for (let i = 1; i < chainIds.length; i++) {
        if (chainIds[i] !== currentChain) {
            boundaries.push(i);
            currentChain = chainIds[i];
            continue;
        }

        if (i < chainIds.length - 1 && chainIds[i] !== chainIds[i + 1]) {
            boundaries.push(i + 1);
        }

        if (i % 8 === 0) {
            boundaries.push(i);
        }
    }

    return Array.from(new Set(boundaries)).sort((a, b) => a - b);
}

function findChainBoundariesForPLDDT(data) {
    const boundaries = [];
    let currentChain = null;

    data.residueLabels.forEach((label, index) => {
        const chain = label.split(',')[0].split(' ')[1];
        if (chain !== currentChain) {
            boundaries.push(index);
            currentChain = chain;
        }
    });

    return boundaries;
}

function findChainBoundaries(chainIds) {
    const boundaries = [];
    let currentChain = chainIds[0];
    chainIds.forEach((chain, index) => {
        if (chain !== currentChain) {
            boundaries.push(index);
            currentChain = chain;
        }
    });
    return boundaries;
}

window.Plots = {
    drawPAEMatrices,
    drawPLDDTPlot
};