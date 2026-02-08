// Sample texts for testing
const sampleTexts = [
    "I absolutely love this! It's the best thing ever. I'm so happy and excited!",
    "This is terrible. I hate it. Worst experience of my life. Very disappointing.",
    "The product is okay. It works as expected. Nothing special about it."
];

// Character counter
document.getElementById('inputText').addEventListener('input', function() {
    document.getElementById('charCount').textContent = this.value.length;
});

// Fill sample text
function fillSample(index) {
    document.getElementById('inputText').value = sampleTexts[index];
    document.getElementById('charCount').textContent = sampleTexts[index].length;
}

// Analyze sentiment
async function analyzeSentiment() {
    const text = document.getElementById('inputText').value.trim();
    
    if (!text) {
        alert('Please enter some text to analyze!');
        return;
    }

    // Show loading state
    const btn = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    
    btn.disabled = true;
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (data.success) {
            displayResults(data.result);
            loadHistory();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error analyzing text: ' + error.message);
    } finally {
        // Reset button state
        btn.disabled = false;
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}

// Display results
function displayResults(result) {
    // Show results section
    document.getElementById('resultsSection').classList.remove('d-none');

    // Update sentiment display
    document.getElementById('sentimentEmoji').textContent = result.emoji;
    document.getElementById('sentimentText').textContent = result.sentiment;
    document.getElementById('sentimentText').className = `mb-1 text-${result.color}`;

    // Update scores
    document.getElementById('polarityScore').textContent = result.polarity;
    document.getElementById('subjectivityScore').textContent = result.subjectivity;

    // Update analyzed text
    document.getElementById('analyzedText').textContent = result.text;

    // Update polarity bar
    const polarityBar = document.getElementById('polarityBar');
    const polarityPercent = ((result.polarity + 1) / 2) * 100; // Convert -1 to 1 into 0 to 100
    polarityBar.style.width = polarityPercent + '%';
    polarityBar.textContent = result.polarity;
    polarityBar.className = `progress-bar bg-${result.color}`;

    // Update subjectivity bar
    const subjectivityBar = document.getElementById('subjectivityBar');
    const subjectivityPercent = result.subjectivity * 100;
    subjectivityBar.style.width = subjectivityPercent + '%';
    subjectivityBar.textContent = result.subjectivity;

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Load history
async function loadHistory() {
    try {
        const response = await fetch('/history');
        const data = await response.json();

        const historyList = document.getElementById('historyList');

        if (data.history && data.history.length > 0) {
            historyList.innerHTML = data.history.map(item => `
                <div class="card mb-2">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-2">
                                    <span class="fs-4 me-2">${item.emoji}</span>
                                    <span class="badge bg-${item.color}">${item.sentiment}</span>
                                    <small class="text-muted ms-auto">${item.timestamp}</small>
                                </div>
                                <p class="mb-2 text-truncate">${item.text}</p>
                                <div class="d-flex gap-3">
                                    <small><strong>Polarity:</strong> ${item.polarity}</small>
                                    <small><strong>Subjectivity:</strong> ${item.subjectivity}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            historyList.innerHTML = '<p class="text-muted text-center">No analyses yet.</p>';
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Load history on page load
window.addEventListener('load', loadHistory);

// Enter key to analyze
document.getElementById('inputText').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        analyzeSentiment();
    }
});