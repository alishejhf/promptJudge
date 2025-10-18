const evaluateBtn = document.getElementById('evaluateBtn');
const compareBtn = document.getElementById('compareBtn');
const historyBtn = document.getElementById('historyBtn');

const evaluateMode = document.getElementById('evaluateMode');
const compareMode = document.getElementById('compareMode');
const historyMode = document.getElementById('historyMode');

const promptInput = document.getElementById('promptInput');
const promptA = document.getElementById('promptA');
const promptB = document.getElementById('promptB');

const submitEvaluate = document.getElementById('submitEvaluate');
const submitCompare = document.getElementById('submitCompare');
const refreshHistory = document.getElementById('refreshHistory');
const clearResults = document.getElementById('clearResults');

const resultsContainer = document.getElementById('resultsContainer');
const resultsContent = document.getElementById('resultsContent');
const historyContainer = document.getElementById('historyContainer');

let currentMode = 'evaluate';

function switchMode(mode) {
    currentMode = mode;
    
    [evaluateBtn, compareBtn, historyBtn].forEach(btn => btn.classList.remove('active'));
    
    [evaluateMode, compareMode, historyMode].forEach(section => section.classList.remove('active'));
    
    if (mode === 'evaluate') {
        evaluateBtn.classList.add('active');
        evaluateMode.classList.add('active');
    } else if (mode === 'compare') {
        compareBtn.classList.add('active');
        compareMode.classList.add('active');
    } else if (mode === 'history') {
        historyBtn.classList.add('active');
        historyMode.classList.add('active');
        loadHistory();
    }
}

evaluateBtn.addEventListener('click', () => switchMode('evaluate'));
compareBtn.addEventListener('click', () => switchMode('compare'));
historyBtn.addEventListener('click', () => switchMode('history'));

function displayResults(data, isError = false) {
    resultsContent.innerHTML = '';
    
    if (isError) {
        resultsContent.innerHTML = `
            <div class="error-message">
                <strong>Error:</strong> ${data.message || 'An error occurred'}
            </div>
        `;
    } else {
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(data, null, 2);
        resultsContent.appendChild(pre);
    }
    
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

clearResults.addEventListener('click', () => {
    resultsContent.innerHTML = '<p class="empty-message">Results will appear here...</p>';
});

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

submitEvaluate.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        displayResults({ message: 'Please enter a prompt to evaluate' }, true);
        return;
    }
    
    setButtonLoading(submitEvaluate, true);
    
    try {
        const response = await fetch('/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            displayResults(data, true);
        } else {
            displayResults(data);
        }
    } catch (error) {
        displayResults({ 
            message: `Network error: ${error.message}. Make sure the server and Ollama are running.` 
        }, true);
    } finally {
        setButtonLoading(submitEvaluate, false);
    }
});

submitCompare.addEventListener('click', async () => {
    const promptAText = promptA.value.trim();
    const promptBText = promptB.value.trim();
    
    if (!promptAText || !promptBText) {
        displayResults({ message: 'Please enter both prompts to compare' }, true);
        return;
    }
    
    setButtonLoading(submitCompare, true);
    
    try {
        const response = await fetch('/compare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                promptA: promptAText, 
                promptB: promptBText 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            displayResults(data, true);
        } else {
            displayResults(data);
        }
    } catch (error) {
        displayResults({ 
            message: `Network error: ${error.message}. Make sure the server and Ollama are running.` 
        }, true);
    } finally {
        setButtonLoading(submitCompare, false);
    }
});

async function loadHistory() {
    try {
        const response = await fetch('/history');
        const data = await response.json();
        
        if (data.history && data.history.length > 0) {
            historyContainer.innerHTML = data.history.map(item => `
                <div class="history-item">
                    <div class="history-item-header">
                        <span class="history-timestamp">${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="history-prompt">"${item.prompt}"</div>
                    <div class="history-scores">
                        <span class="score-item">Clarity: <span class="score-value">${item.result.clarity}/10</span></span>
                        <span class="score-item">Specificity: <span class="score-value">${item.result.specificity}/10</span></span>
                        <span class="score-item">Scope: <span class="score-value">${item.result.scope}/10</span></span>
                        <span class="score-item">Context: <span class="score-value">${item.result.context}/10</span></span>
                        <span class="score-item">Constraints: <span class="score-value">${item.result.constraints}/10</span></span>
                    </div>
                </div>
            `).join('');
        } else {
            historyContainer.innerHTML = '<p class="empty-message">No evaluation history yet.</p>';
        }
    } catch (error) {
        historyContainer.innerHTML = `
            <div class="error-message">
                Failed to load history: ${error.message}
            </div>
        `;
    }
}

refreshHistory.addEventListener('click', loadHistory);

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (currentMode === 'evaluate' && document.activeElement === promptInput) {
            submitEvaluate.click();
        } else if (currentMode === 'compare' && (document.activeElement === promptA || document.activeElement === promptB)) {
            submitCompare.click();
        }
    }
});

