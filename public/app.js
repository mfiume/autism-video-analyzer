/**
 * ARIA Autism Assessment Analyzer - Main Application
 */

let player;
let currentCase = null;
let markIn = null;
let markOut = null;
let clips = [];
let notes = [];
let videoDuration = 0;
let playheadInterval = null;

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
            'modestbranding': 1,
            'controls': 0,  // Hide YouTube controls
            'disablekb': 1,  // Disable keyboard controls
            'fs': 0,  // Hide fullscreen button
            'iv_load_policy': 3  // Hide annotations
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

    // Get video duration
    videoDuration = player.getDuration();

    // Update total time display
    updateTimeDisplay();

    // Start updating playhead position
    startPlayheadUpdates();
}

function changeSpeed() {
    const speed = parseFloat(document.getElementById('speedControl').value);
    if (player && player.setPlaybackRate) {
        player.setPlaybackRate(speed);
    }
}

function togglePlayPause() {
    if (!player) return;

    const btn = document.getElementById('playPauseBtn');

    try {
        const state = player.getPlayerState();

        if (state === 1) {  // 1 = PLAYING
            player.pauseVideo();
            btn.textContent = '▶';
        } else {
            player.playVideo();
            btn.textContent = '⏸';
        }
    } catch (e) {
        console.error('Error toggling play/pause:', e);
    }
}

function skipBackward() {
    if (!player || !player.getCurrentTime) return;
    const currentTime = player.getCurrentTime();
    player.seekTo(Math.max(0, currentTime - 5));
}

function skipForward() {
    if (!player || !player.getCurrentTime) return;
    const currentTime = player.getCurrentTime();
    const newTime = Math.min(videoDuration, currentTime + 5);
    player.seekTo(newTime);
}

function restartVideo() {
    if (!player) return;
    player.seekTo(0);
    player.playVideo();
    const btn = document.getElementById('playPauseBtn');
    if (btn) btn.textContent = '⏸';
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimeDisplay() {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');

    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentTime);
    }

    if (totalTimeEl && videoDuration) {
        totalTimeEl.textContent = formatTime(videoDuration);
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

    // Automatically switch to Clips tab to show the new clip
    switchTabByName('clips');
}

function displayClips() {
    const container = document.getElementById('clipsList');
    if (!container) return;

    if (clips.length === 0) {
        container.innerHTML = '<p style="color: #86868b; padding: 12px; text-align: center;">No clips created yet</p>';
    } else {
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

    // Update timeline markers
    updateTimeline();
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

    // Automatically switch to Notes tab to show the new note
    switchTabByName('notes');
}

function displayNotes() {
    const container = document.getElementById('notesList');
    if (!container) return;

    if (notes.length === 0) {
        container.innerHTML = '<p style="color: #86868b; padding: 12px; text-align: center;">No notes yet</p>';
    } else {
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

    // Update timeline markers
    updateTimeline();
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
        'notes': 'notesTab',
        'analysis': 'analysisTab'
    };

    const selectedTab = document.getElementById(tabMap[tabName]);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activate selected button (if clicked from UI)
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Programmatically activate button based on tab name
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach((button, index) => {
            const buttonTabs = ['subject', 'clips', 'notes', 'analysis'];
            if (buttonTabs[index] === tabName) {
                button.classList.add('active');
            }
        });
    }
}

// Helper function for programmatic tab switching
function switchTabByName(tabName) {
    switchTab.call(null, tabName);
}

// Timeline Functions
function updateTimeline() {
    const container = document.getElementById('timelineMarkers');
    if (!container || videoDuration === 0) return;

    container.innerHTML = '';

    // Add clip markers
    clips.forEach(clip => {
        const marker = document.createElement('div');
        marker.className = 'timeline-marker clip-marker';
        marker.style.left = `${(clip.markIn / videoDuration) * 100}%`;
        marker.setAttribute('data-label', clip.name);
        marker.onclick = (e) => {
            e.stopPropagation();
            gotoClip(clip.markIn);
        };
        container.appendChild(marker);
    });

    // Add note markers
    notes.forEach(note => {
        const marker = document.createElement('div');
        marker.className = 'timeline-marker note-marker';
        marker.style.left = `${(note.timecode / videoDuration) * 100}%`;
        marker.setAttribute('data-label', `Note: ${formatTimecode(note.timecode)}`);
        marker.onclick = (e) => {
            e.stopPropagation();
            gotoClip(note.timecode);
        };
        container.appendChild(marker);
    });
}

function onTimelineClick(event) {
    if (!player || videoDuration === 0) return;

    const track = document.querySelector('.timeline-track');
    const rect = track.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * videoDuration;

    player.seekTo(seekTime);
}

function updatePlayhead() {
    if (!player || !player.getCurrentTime || videoDuration === 0) return;

    const currentTime = player.getCurrentTime();
    const playhead = document.getElementById('playheadPosition');

    if (playhead) {
        const percentage = (currentTime / videoDuration) * 100;
        playhead.style.left = `${percentage}%`;
    }

    // Also update time display
    updateTimeDisplay();
}

function startPlayheadUpdates() {
    // Clear existing interval if any
    if (playheadInterval) {
        clearInterval(playheadInterval);
    }

    // Update playhead position every 100ms
    playheadInterval = setInterval(updatePlayhead, 100);
}

// Analysis Functions
function generateAnalysis() {
    const btn = document.getElementById('analyzeBtn');
    btn.classList.add('analyzing');
    btn.innerHTML = '<span class="btn-icon">⏳</span> Analyzing...';
    btn.disabled = true;

    // Simulate AI analysis with a delay
    setTimeout(() => {
        displayAnalysisResults();
        btn.classList.remove('analyzing');
        btn.innerHTML = '<span class="btn-icon">✨</span> Generate AI Analysis';
        btn.disabled = false;
    }, 2000);
}

function displayAnalysisResults() {
    // Show results sections
    document.getElementById('analysisResults').style.display = 'block';
    document.getElementById('timestampsSection').style.display = 'block';

    // Display summary
    const summaryContainer = document.getElementById('analysisSummary');
    summaryContainer.innerHTML = `
        <p>This autism assessment session demonstrates a comprehensive evaluation of social communication, repetitive behaviors, and adaptive functioning. The subject shows variable engagement patterns throughout the 14:50 minute session, with notable differences in response to structured versus unstructured interaction approaches.</p>
        <p style="margin-top: 12px;">Key behavioral observations include reduced eye contact during the initial greeting phase (00:45-02:15), improved reciprocal communication during play-based activities (05:30-08:45), and increased repetitive motor movements during transitions (10:20-11:40).</p>
    `;

    // Display timestamps
    const timestampsContainer = document.getElementById('timestampsList');
    const mockTimestamps = [
        {
            time: 45,
            category: 'Social Communication',
            description: 'Initial greeting - limited eye contact and delayed response to name'
        },
        {
            time: 135,
            category: 'Engagement',
            description: 'Subject shows interest in toy, demonstrates joint attention'
        },
        {
            time: 330,
            category: 'Social Interaction',
            description: 'Reciprocal play initiated - sharing toys and taking turns'
        },
        {
            time: 525,
            category: 'Communication',
            description: 'Verbal communication emerges - requests and labels objects'
        },
        {
            time: 620,
            category: 'Repetitive Behavior',
            description: 'Hand flapping observed during exciting activity'
        },
        {
            time: 700,
            category: 'Adaptive Behavior',
            description: 'Demonstrates problem-solving skills with puzzle activity'
        },
        {
            time: 815,
            category: 'Social Communication',
            description: 'Decreased eye contact during unstructured free play'
        }
    ];

    timestampsContainer.innerHTML = mockTimestamps.map(ts => `
        <div class="timestamp-item" onclick="gotoClip(${ts.time})">
            <div class="timestamp-time">
                <span class="timestamp-badge">${formatTimecode(ts.time)}</span>
                <span class="timestamp-category">${ts.category}</span>
            </div>
            <div class="timestamp-description">${ts.description}</div>
        </div>
    `).join('');
}
