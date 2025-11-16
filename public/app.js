/**
 * ARIA Autism Assessment Analyzer - Main Application
 */

let player;
let currentCase = null;
let markIn = null;
let markOut = null;
let clips = [];
let notes = [];

// YouTube API Ready callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    // Auto-load default case
    setTimeout(() => {
        loadDefaultCase();
    }, 500);
});

async function loadDefaultCase() {
    try {
        const response = await fetch('/api/cases/1-0102-004');
        const caseData = await response.json();
        await loadCase(caseData);
    } catch (error) {
        console.error('Error loading default case:', error);
    }
}

async function loadCase(caseData) {
    currentCase = caseData;

    // Show controls
    document.getElementById('viewerControlsInline').style.display = 'flex';
    document.getElementById('caseId').textContent = caseData.id;

    // Load video
    loadVideo(caseData.video);

    // Display clinical data
    displaySubjectInfo(caseData);
    displayFamilyInfo(caseData);
    displaySampleInfo(caseData);
    displayClinicalScores(caseData);
}

function loadVideo(videoUrl) {
    // Extract video ID from YouTube URL
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
        console.error('Invalid video URL');
        return;
    }

    // Destroy existing player if any
    if (player) {
        player.destroy();
    }

    // Create new player
    player = new YT.Player('videoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function extractVideoId(url) {
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

function onPlayerReady(event) {
    console.log('Player ready');
}

function changeSpeed() {
    const speed = parseFloat(document.getElementById('speedControl').value);
    if (player && player.setPlaybackRate) {
        player.setPlaybackRate(speed);
    }
}

function displaySubjectInfo(caseData) {
    const container = document.getElementById('subjectInfo');
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Index ID</span>
            <span class="info-value">${caseData.id}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date of Birth</span>
            <span class="info-value">${caseData.dob}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Sex</span>
            <span class="info-value">${caseData.sex}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Affection</span>
            <span class="info-value">${caseData.affection}</span>
        </div>
    `;
}

function displayFamilyInfo(caseData) {
    const container = document.getElementById('familyInfo');
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Family ID</span>
            <span class="info-value">${caseData.familyId}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Family Type</span>
            <span class="info-value">${caseData.familyType}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Mother ID</span>
            <span class="info-value">${caseData.motherId}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Father ID</span>
            <span class="info-value">${caseData.fatherId}</span>
        </div>
    `;
}

function displaySampleInfo(caseData) {
    const container = document.getElementById('sampleInfo');
    container.innerHTML = `
        <div class="info-row">
            <span class="info-label">Submitted ID</span>
            <span class="info-value">${caseData.sample.submittedId}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Index ID</span>
            <span class="info-value">${caseData.sample.indexId}</span>
        </div>
        <div class="info-row">
            <span class="info-label">DNA Source</span>
            <span class="info-value">${caseData.sample.dnaSource}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Platform</span>
            <span class="info-value">${caseData.sample.platform}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Predicted Ancestry</span>
            <span class="info-value">${caseData.sample.predictedAncestry}</span>
        </div>
    `;
}

function displayClinicalScores(caseData) {
    const container = document.getElementById('clinicalScores');
    const section = document.getElementById('clinicalScoresSection');

    const scores = [
        { name: 'ADOS', value: caseData.scores.ados },
        { name: 'ADI-R', value: caseData.scores.adi },
        { name: 'Vineland', value: caseData.scores.vineland }
    ];

    // Only show section if at least one score is available
    const hasAvailableScores = scores.some(score => score.value !== null);

    if (!hasAvailableScores) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = scores
        .filter(score => score.value !== null)
        .map(score => `
            <div class="score-item">
                <div class="score-name">${score.name}</div>
                <div class="score-value">${score.value}</div>
            </div>
        `).join('');
}

async function openCaseSelector() {
    try {
        const response = await fetch('/api/cases');
        const cases = await response.json();

        const container = document.getElementById('caseList');
        container.innerHTML = cases.map(c => `
            <div class="case-item" onclick='selectCase(${JSON.stringify(c).replace(/'/g, "&apos;")})'>
                <div class="case-id">${c.subject}</div>
                <div class="case-info">${c.sex} · ${c.dob}</div>
                <div class="case-info">${c.familyType} · ${c.sample.predictedAncestry}</div>
            </div>
        `).join('');

        document.getElementById('caseSidebar').style.display = 'flex';
    } catch (error) {
        console.error('Error loading cases:', error);
    }
}

function selectCase(caseData) {
    loadCase(caseData);
    closeSidebar();
}

function closeSidebar() {
    document.getElementById('caseSidebar').style.display = 'none';
}

// Mark In/Out Functions
function setMarkIn() {
    if (!player || !player.getCurrentTime) return;
    markIn = player.getCurrentTime();
    updateMarkDisplay();
    console.log('Mark In set at:', formatTimecode(markIn));
}

function setMarkOut() {
    if (!player || !player.getCurrentTime) return;
    markOut = player.getCurrentTime();
    updateMarkDisplay();
    console.log('Mark Out set at:', formatTimecode(markOut));
}

function clearMarks() {
    markIn = null;
    markOut = null;
    updateMarkDisplay();
}

function updateMarkDisplay() {
    const markInDisplay = document.getElementById('markInDisplay');
    const markOutDisplay = document.getElementById('markOutDisplay');

    if (markInDisplay) {
        markInDisplay.textContent = markIn !== null ? formatTimecode(markIn) : '--:--';
    }
    if (markOutDisplay) {
        markOutDisplay.textContent = markOut !== null ? formatTimecode(markOut) : '--:--';
    }

    // Enable/disable create clip button
    const createClipBtn = document.getElementById('createClipBtn');
    if (createClipBtn) {
        createClipBtn.disabled = (markIn === null || markOut === null);
    }
}

function formatTimecode(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function createClip() {
    if (markIn === null || markOut === null) {
        alert('Please set both Mark In and Mark Out');
        return;
    }

    if (markIn >= markOut) {
        alert('Mark In must be before Mark Out');
        return;
    }

    // Show clip naming dialog
    const clipName = prompt('Enter clip name:', `Clip ${clips.length + 1}`);
    if (!clipName) return;

    const clip = {
        id: Date.now(),
        name: clipName,
        markIn: markIn,
        markOut: markOut,
        duration: markOut - markIn,
        timestamp: new Date().toISOString()
    };

    clips.push(clip);
    displayClips();
    clearMarks();
}

function displayClips() {
    const container = document.getElementById('clipsList');
    if (!container) return;

    if (clips.length === 0) {
        container.innerHTML = '<p style="color: #86868b; padding: 12px; text-align: center;">No clips created yet</p>';
        return;
    }

    container.innerHTML = clips.map(clip => `
        <div class="clip-item">
            <div class="clip-header">
                <span class="clip-name">${clip.name}</span>
                <button class="clip-delete" onclick="deleteClip(${clip.id})" title="Delete clip">×</button>
            </div>
            <div class="clip-timecode">
                ${formatTimecode(clip.markIn)} → ${formatTimecode(clip.markOut)}
            </div>
            <div class="clip-duration">
                Duration: ${formatTimecode(clip.duration)}
            </div>
            <button class="clip-goto" onclick="gotoClip(${clip.markIn})">Go to Clip</button>
        </div>
    `).join('');
}

function deleteClip(clipId) {
    if (!confirm('Delete this clip?')) return;
    clips = clips.filter(c => c.id !== clipId);
    displayClips();
}

function gotoClip(time) {
    if (player && player.seekTo) {
        player.seekTo(time);
    }
}

// Notes Functions
function addNote() {
    if (!player || !player.getCurrentTime) return;

    const noteText = prompt('Enter note:');
    if (!noteText || noteText.trim() === '') return;

    const note = {
        id: Date.now(),
        text: noteText.trim(),
        timecode: player.getCurrentTime(),
        timestamp: new Date().toISOString()
    };

    notes.push(note);
    displayNotes();
}

function displayNotes() {
    const container = document.getElementById('notesList');
    if (!container) return;

    if (notes.length === 0) {
        container.innerHTML = '<p style="color: #86868b; padding: 12px; text-align: center;">No notes yet</p>';
        return;
    }

    // Sort notes by timecode
    const sortedNotes = [...notes].sort((a, b) => a.timecode - b.timecode);

    container.innerHTML = sortedNotes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <span class="note-timecode" onclick="gotoClip(${note.timecode})" style="cursor: pointer;">
                    ${formatTimecode(note.timecode)}
                </span>
                <button class="note-delete" onclick="deleteNote(${note.id})" title="Delete note">×</button>
            </div>
            <div class="note-text">${escapeHtml(note.text)}</div>
        </div>
    `).join('');
}

function deleteNote(noteId) {
    if (!confirm('Delete this note?')) return;
    notes = notes.filter(n => n.id !== noteId);
    displayNotes();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    const tabMap = {
        'subject': 'subjectTab',
        'clips': 'clipsTab',
        'notes': 'notesTab'
    };

    const selectedTab = document.getElementById(tabMap[tabName]);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activate selected button
    event.target.classList.add('active');
}
