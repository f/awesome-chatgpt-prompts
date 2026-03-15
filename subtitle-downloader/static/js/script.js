/**
 * Subtitle Downloader Frontend Script
 */

// DOM Elements
const searchForm = document.getElementById('searchForm');
const searchBtn = document.getElementById('searchBtn');
const btnText = document.querySelector('.btn-text');
const btnSpinner = document.querySelector('.btn-spinner');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const resultsList = document.getElementById('resultsList');
const noResults = document.getElementById('noResults');

// Event Listeners
searchForm.addEventListener('submit', handleSearch);

/**
 * Handle search form submission
 */
async function handleSearch(e) {
    e.preventDefault();

    // Get form values
    const seriesName = document.getElementById('seriesName').value.trim();
    const seasonEpisode = document.getElementById('seasonEpisode').value.trim();
    const language = document.getElementById('language').value.trim();

    // Validate input
    const validation = validateInput(seriesName, seasonEpisode, language);
    if (!validation.valid) {
        showError(validation.errors.join('\n'));
        return;
    }

    // Clear previous results
    clearResults();
    hideError();

    // Show loading state
    setButtonLoading(true);

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                series_name: seriesName,
                season_episode: seasonEpisode,
                language: language
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.errors ? data.errors.join('\n') : data.error;
            showError(errorMsg);
            setButtonLoading(false);
            return;
        }

        if (!data.success) {
            showError(data.error || 'Search failed');
            setButtonLoading(false);
            return;
        }

        // Handle results
        if (data.results && data.results.length > 0) {
            displayResults(data.results);
        } else {
            noResults.style.display = 'block';
        }

    } catch (error) {
        showError('Network error. Please try again.');
        console.error('Search error:', error);
    } finally {
        setButtonLoading(false);
    }
}

/**
 * Validate user input
 */
function validateInput(seriesName, seasonEpisode, language) {
    const errors = [];

    if (!seriesName) {
        errors.push('Series name is required');
    } else if (seriesName.length > 100) {
        errors.push('Series name is too long');
    }

    if (!seasonEpisode) {
        errors.push('Season and episode is required');
    } else if (!/^[sS]\d{1,2}[eE]\d{1,2}$|^\d{1,2}[xX]\d{1,2}$/.test(seasonEpisode)) {
        errors.push('Invalid format. Use S01E01 or 1x1');
    }

    if (!language) {
        errors.push('Language is required');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Display search results
 */
function displayResults(subtitles) {
    resultsSection.style.display = 'block';
    noResults.style.display = 'none';
    resultsList.innerHTML = '';

    subtitles.forEach(subtitle => {
        const item = createSubtitleItem(subtitle);
        resultsList.appendChild(item);
    });

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Create a subtitle item element
 */
function createSubtitleItem(subtitle) {
    const div = document.createElement('div');
    div.className = 'subtitle-item';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'subtitle-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'subtitle-name';
    nameDiv.textContent = subtitle.file_name || subtitle.release_name || subtitle.id;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'subtitle-meta';

    if (subtitle.release_name) {
        const releaseSpan = document.createElement('span');
        releaseSpan.className = 'meta-item';
        releaseSpan.textContent = `📺 ${subtitle.release_name}`;
        metaDiv.appendChild(releaseSpan);
    }

    if (subtitle.download_count !== undefined) {
        const downloadSpan = document.createElement('span');
        downloadSpan.className = 'meta-item';
        downloadSpan.textContent = `📥 ${subtitle.downloads || 0} downloads`;
        metaDiv.appendChild(downloadSpan);
    }

    if (subtitle.upload_date) {
        const dateSpan = document.createElement('span');
        dateSpan.className = 'meta-item';
        dateSpan.textContent = `📅 ${new Date(subtitle.upload_date).toLocaleDateString()}`;
        metaDiv.appendChild(dateSpan);
    }

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(metaDiv);

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = '⬇️ Download';
    downloadBtn.onclick = (e) => handleDownload(e, subtitle.id, subtitle.file_name);

    div.appendChild(infoDiv);
    div.appendChild(downloadBtn);

    return div;
}

/**
 * Handle subtitle download
 */
async function handleDownload(e, subtitleId, fileName) {
    e.preventDefault();
    const btn = e.target;

    try {
        btn.disabled = true;
        btn.textContent = '⏳ Downloading...';

        const response = await fetch(`/api/download/${subtitleId}`);

        if (!response.ok) {
            throw new Error('Download failed');
        }

        // Create blob from response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `subtitle_${subtitleId}.srt`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        btn.textContent = '✓ Downloaded';
        setTimeout(() => {
            btn.textContent = '⬇️ Download';
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        showError('Download failed. Please try again.');
        console.error('Download error:', error);
        btn.textContent = '⬇️ Download';
        btn.disabled = false;
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorContainer.style.display = 'flex';
}

/**
 * Hide error message
 */
function hideError() {
    errorContainer.style.display = 'none';
}

/**
 * Clear results
 */
function clearResults() {
    resultsList.innerHTML = '';
    resultsSection.style.display = 'none';
    noResults.style.display = 'none';
}

/**
 * Set button loading state
 */
function setButtonLoading(loading) {
    searchBtn.disabled = loading;
    if (loading) {
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
    } else {
        btnText.style.display = 'inline-block';
        btnSpinner.style.display = 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Subtitle Downloader loaded');
});
