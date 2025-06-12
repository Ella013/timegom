// Focus Timer (Pomodoro) functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio context (created at page load)
    initializeAudioContext();
    
    if (document.querySelector('.pomodoro-section')) {
        // Element selection
        const timerDisplay = document.getElementById('pomodoroTimer');
        const timerMode = document.getElementById('timerMode');
        const statusBadge = document.getElementById('statusBadge');
        const endTimeDisplay = document.getElementById('endTime');
        const cycleCountDisplay = document.getElementById('cycleCount');
        const alarmTitle = document.getElementById('alarmTitle');
        const alarmMessage = document.getElementById('alarmMessage');
        const alarmContent = document.getElementById('timerAlarm');
        const alarmCloseBtn = document.getElementById('alarmCloseBtn');
        
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const skipBtn = document.getElementById('skipBtn');
        
        // Setting related elements
        const focusTimeDisplay = document.getElementById('focusTime');
        const breakTimeDisplay = document.getElementById('breakTime');
        const longBreakTimeDisplay = document.getElementById('longBreakTime');
        const cyclesCountDisplay = document.getElementById('cyclesCount');
        
        // Circular progress element
        const progressRing = document.querySelector('.progress-ring-circle');
        const radius = progressRing ? progressRing.r.baseVal.value : 140;
        const circumference = 2 * Math.PI * radius;
        
        // Initial setup
        if (progressRing) {
            progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            progressRing.style.strokeDashoffset = '0';
        }
        
        // Status variables
        let currentMode = 'focus'; // focus, break, longBreak
        let isRunning = false;
        let isPaused = false;
        let timerInterval;
        let endTime = 0;
        let remainingTime = 0;
        let totalDuration = 0;
        
        // Setting values (minutes)
        let settings = {
            focus: 25,
            break: 5,
            longBreak: 15,
            cycles: 4
        };
        
        // Current cycle
        let currentCycle = 0;
        
        // Timer initialization
        updateTimerDisplay(settings.focus * 60 * 1000);
        
        // Show mode and time display in initial state
        const totalMinutes = settings.focus;
        timerMode.textContent = `${totalMinutes} minutes`;
        
        // Enable pause button and show in initial state
        pauseBtn.disabled = false;
        pauseBtn.style.display = 'inline-flex';
        
        // Variables for continuous increase/decrease of buttons
        let buttonIntervals = {};
        let buttonTimeouts = {};
        
        // Setting button event listeners
        document.querySelectorAll('.setting-btn').forEach(btn => {
            // Button pressed
            btn.addEventListener('mousedown', function() {
                if (isRunning) return; // Cannot change settings while running
                
                const action = this.classList.contains('plus-btn') ? 1 : -1;
                const setting = this.dataset.setting;
                
                // Button identifier
                const btnId = setting + (action > 0 ? 'plus' : 'minus');
                
                // Apply immediately first change
                updateSettingValue(setting, action);
                
                // Keep pressing button for a while for a slight delay and then quickly increase/decrease
                buttonTimeouts[btnId] = setTimeout(() => {
                    buttonIntervals[btnId] = setInterval(() => {
                        updateSettingValue(setting, action);
                    }, 100); // Change every 0.1 seconds
                }, 500); // Start continuous increase/decrease 0.5 seconds later
            });
            
            // Button released or mouse left button
            const stopContinuousChange = function() {
                const action = this.classList.contains('plus-btn') ? 1 : -1;
                const setting = this.dataset.setting;
                const btnId = setting + (action > 0 ? 'plus' : 'minus');
                
                // Clear timeout and interval
                if (buttonTimeouts[btnId]) {
                    clearTimeout(buttonTimeouts[btnId]);
                    buttonTimeouts[btnId] = null;
                }
                
                if (buttonIntervals[btnId]) {
                    clearInterval(buttonIntervals[btnId]);
                    buttonIntervals[btnId] = null;
                }
            };
            
            btn.addEventListener('mouseup', stopContinuousChange);
            btn.addEventListener('mouseleave', stopContinuousChange);
            btn.addEventListener('touchend', stopContinuousChange);
            btn.addEventListener('touchcancel', stopContinuousChange);
        });
        
        // Setting value update function
        function updateSettingValue(setting, action) {
            let value = settings[setting] + action;
            
            // Range restriction
            switch(setting) {
                case 'focus':
                    value = Math.max(1, Math.min(60, value)); // 1-60 minutes
                    break;
                case 'break':
                    value = Math.max(1, Math.min(30, value)); // 1-30 minutes
                    break;
                case 'longBreak':
                    value = Math.max(1, Math.min(60, value)); // 1-60 minutes
                    break;
                case 'cycles':
                    value = Math.max(1, Math.min(10, value)); // 1-10 times
                    break;
            }
            
            settings[setting] = value;
            
            // Screen update
            if (setting === 'focus' && currentMode === 'focus') {
                updateTimerDisplay(settings.focus * 60 * 1000);
                focusTimeDisplay.textContent = settings.focus;
            } else if (setting === 'break' && currentMode === 'break') {
                updateTimerDisplay(settings.break * 60 * 1000);
                breakTimeDisplay.textContent = settings.break;
            } else if (setting === 'longBreak' && currentMode === 'longBreak') {
                updateTimerDisplay(settings.longBreak * 60 * 1000);
                longBreakTimeDisplay.textContent = settings.longBreak;
            } else {
                // Change only settings not current mode
                if (setting === 'focus') focusTimeDisplay.textContent = settings.focus;
                if (setting === 'break') breakTimeDisplay.textContent = settings.break;
                if (setting === 'longBreak') longBreakTimeDisplay.textContent = settings.longBreak;
            }
            
            if (setting === 'cycles') {
                cyclesCountDisplay.textContent = settings.cycles;
                cycleCountDisplay.textContent = currentCycle;
                document.querySelector('.cycle-count').innerHTML = `Cycle: <span id="cycleCount">${currentCycle}</span>/${settings.cycles}`;
            }
        }
        
        // Timer start button event listener
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                // Timer first start or restart
                if (!isPaused) {
                    // Set time based on mode
                    switch(currentMode) {
                        case 'focus':
                            totalDuration = settings.focus * 60 * 1000;
                            break;
                        case 'break':
                            totalDuration = settings.break * 60 * 1000;
                            break;
                        case 'longBreak':
                            totalDuration = settings.longBreak * 60 * 1000;
                            break;
                    }
                    remainingTime = totalDuration;
                } else {
                    // Restart after pause
                    totalDuration = remainingTime;
                }
                
                endTime = Date.now() + remainingTime;
                
                // Show scheduled end time
                updateEndTimeDisplay();
                
                // Button status change
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                resetBtn.disabled = false;
                skipBtn.disabled = false;
                
                isRunning = true;
                isPaused = false;
                
                startTimer();
            }
        });
        
        // Pause button event listener
        pauseBtn.addEventListener('click', function() {
            if (isRunning) {
                clearInterval(timerInterval);
                isRunning = false;
                isPaused = true;
                remainingTime = endTime - Date.now();
                
                // Button status change
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        });
        
        // Reset button event listener
        resetBtn.addEventListener('click', function() {
            resetTimer();
        });
        
        // Skip button event listener
        skipBtn.addEventListener('click', function() {
            if (isRunning) {
                clearInterval(timerInterval);
            }
            
            // Switch to next mode
            switchMode();
        });
        
        // Alarm close button event listener
        if (alarmCloseBtn) {
            alarmCloseBtn.addEventListener('click', function() {
                // Stop sound
                if (alarmAudio) {
                    alarmAudio.pause();
                    alarmAudio.remove(); // Remove from DOM
                    alarmAudio = null;
                }
                
                alarmContent.classList.remove('show');
                
                // Automatically switch to next mode
                switchMode();
                
                // Automatically start timer
                // Give a slight delay to update UI before timer starts
                setTimeout(() => {
                    startBtn.click();
                }, 100);
            });
        }
        
        // Page visibility change detection
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // User's first interaction to activate audio context
        document.body.addEventListener('click', function() {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }, { once: true });
        
        // Timer start function
        function startTimer() {
            // Timer start with progress ring fully filled
            if (progressRing) {
                progressRing.style.strokeDashoffset = '0';
            }
            
            // Start time display in timerMode
            const totalMinutes = Math.floor(totalDuration / 60000);
            timerMode.textContent = `${totalMinutes} minutes`;
            
            // Use requestAnimationFrame for updating timer every frame
            function updateTimer(timestamp) {
                if (!isRunning || isPaused) return;
                
                const now = Date.now();
                remainingTime = Math.max(0, endTime - now);
                
                // Convert to seconds
                const currentSecond = Math.ceil(remainingTime / 1000);
                
                // Update timer display
                const minutes = Math.floor(currentSecond / 60);
                const seconds = currentSecond % 60;
                timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
                
                // Update progress ring - effect of shrinking circle as time decreases
                if (progressRing) {
                    const progress = remainingTime / totalDuration;
                    const dashOffset = circumference * (1 - progress);
                    progressRing.style.strokeDashoffset = dashOffset;
                }
                
                // Timer complete if remaining time is 0
                if (remainingTime <= 0) {
                    isRunning = false;
                    timerDisplay.textContent = '00:00';
                    
                    // Progress ring completely empty when timer reaches 0
                    if (progressRing) {
                        progressRing.style.strokeDashoffset = circumference;
                    }
                    
                    // Complete processing
                    timerComplete();
                    return;
                }
                
                // Next frame request
                requestAnimationFrame(updateTimer);
            }
            
            // First frame start
            requestAnimationFrame(updateTimer);
        }
        
        // Timer complete function
        function timerComplete() {
            isRunning = false;
            isPaused = false;
            
            // Play sound and show notification
            playSound('timer');
            
            let title, message;
            switch(currentMode) {
                case 'focus':
                    title = 'Focus Time Complete!';
                    message = 'Time for a break.';
                    break;
                case 'break':
                    title = 'Break Time Complete!';
                    message = 'Ready to focus again?';
                    break;
                case 'longBreak':
                    title = 'Long Break Complete!';
                    message = 'Ready for a new session?';
                    break;
            }
            
            alarmTitle.textContent = title;
            alarmMessage.textContent = message;
            alarmContent.classList.add('show');
            
            showWebNotification(title, message);
            
            // Reset buttons
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
            skipBtn.disabled = true;
            
            // Switch to next mode
            switchMode();
        }
        
        // Timer initialization function
        function resetTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = false;
            
            // Cycle initialization
            currentCycle = 0;
            cycleCountDisplay.textContent = currentCycle;
            document.querySelector('.cycle-count').innerHTML = `Cycle: <span id="cycleCount">${currentCycle}</span>/${settings.cycles}`;
            
            // Always initialize mode to focus
            currentMode = 'focus';
            setModeUI(currentMode);
            
            // Set time to focus time
            let minutes = settings.focus;
            
            // Update timer display
            updateTimerDisplay(minutes * 60 * 1000);
            
            // Circular progress initialization - fully filled state
            if (progressRing) {
                progressRing.style.strokeDashoffset = '0';
            }
            
            // End time initialization
            endTimeDisplay.textContent = '--:--';
            
            // Button status initialization
            startBtn.disabled = false;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
            skipBtn.disabled = true;
        }
        
        // Mode switching function
        function switchMode() {
            // Mode switching (focus -> break -> focus -> break -> ... -> longBreak)
            if (currentMode === 'focus') {
                currentCycle++;
                // If reached the set cycle count, go to long break, otherwise go to short break
                if (currentCycle >= settings.cycles) {
                    currentMode = 'longBreak';
                } else {
                    currentMode = 'break';
                }
            } else {
                // Always go to focus mode after break
                currentMode = 'focus';
            }
            
            // Cycle complete reset
            if (currentMode === 'focus' && currentCycle >= settings.cycles) {
                currentCycle = 0;
            }
            
            // Mode UI update
            setModeUI(currentMode);
            cycleCountDisplay.textContent = currentCycle;
            
            // Timer initialization
            isRunning = false;
            isPaused = false;
            
            // Set time based on mode
            let minutes = 0;
            switch(currentMode) {
                case 'focus':
                    minutes = settings.focus;
                    break;
                case 'break':
                    minutes = settings.break;
                    break;
                case 'longBreak':
                    minutes = settings.longBreak;
                    break;
            }
            
            // Update timer display
            updateTimerDisplay(minutes * 60 * 1000);
            
            // Circular progress initialization - fully filled state
            if (progressRing) {
                progressRing.style.strokeDashoffset = '0';
            }
            
            // Button status initialization
            startBtn.disabled = false;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
            skipBtn.disabled = true;
        }
        
        // Timer display update
        function updateTimerDisplay(ms) {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
        }
        
        // End time display update
        function updateEndTimeDisplay() {
            const endTimeObj = new Date(endTime);
            const hours = endTimeObj.getHours();
            const minutes = endTimeObj.getMinutes();
            const ampm = hours < 12 ? 'AM' : 'PM';
            const displayHours = hours % 12 || 12;
            endTimeDisplay.textContent = `${ampm} ${displayHours}:${padZero(minutes)}`;
        }
        
        // Mode-based UI change
        function setModeUI(mode) {
            const timerContainer = document.querySelector('.pomodoro-timer');
            
            // Remove existing mode classes
            timerContainer.classList.remove('focus-mode', 'break-mode', 'long-break-mode');
            
            // Add new mode class
            switch(mode) {
                case 'focus':
                    timerContainer.classList.add('focus-mode');
                    timerMode.textContent = 'Focus Mode';
                    statusBadge.textContent = 'Focus Time';
                    break;
                case 'break':
                    timerContainer.classList.add('break-mode');
                    timerMode.textContent = 'Break Mode';
                    statusBadge.textContent = 'Break Time';
                    break;
                case 'longBreak':
                    timerContainer.classList.add('long-break-mode');
                    timerMode.textContent = 'Long Break Mode';
                    statusBadge.textContent = 'Long Break';
                    break;
            }
        }
    }
});

// Global audio object
let alarmAudio = null;
let audioContext = null;
let audioBuffer = null;
let isAudioInitialized = false;

// Audio context initialization function
function initializeAudioContext() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        
        fetch('./audio/ringtone-wow.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedData => {
                audioBuffer = decodedData;
                isAudioInitialized = true;
                console.log('Audio initialization complete');
            })
            .catch(error => console.error('Audio initialization failed:', error));
    } catch (e) {
        console.error('This browser does not support Web Audio API:', e);
    }
}

// Page visibility change handling
function handleVisibilityChange() {
    if (!document.hidden && audioContext && audioContext.state === 'suspended') {
        // Resume audio context if page becomes visible
        audioContext.resume().then(() => {
            console.log('AudioContext resumed');
        });
    }
}

// Sound playing function
function playSound(type) {
    try {
        stopSound();
        
        if (audioContext && isAudioInitialized) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            if (window.customAlarmSound) {
                const audioElement = new Audio(window.customAlarmSound);
                audioElement.loop = true;
                
                const source = audioContext.createMediaElementSource(audioElement);
                source.connect(audioContext.destination);
                
                audioElement.play().catch(error => {
                    console.error('User-specified sound playback failed:', error);
                    playDefaultSound();
                });
                
                alarmAudio = audioElement;
            } else {
                playDefaultSound();
            }
        } else {
            fallbackPlaySound();
        }
    } catch(e) {
        console.error('Sound playback failed:', e);
        fallbackPlaySound();
        
        if (document.hidden) {
            const { title, message } = getNotificationInfo();
            showWebNotification(title, message);
        }
    }
    
    // Default sound playing function (using Web Audio API)
    function playDefaultSound() {
        if (!audioBuffer) return;
        
        // Create AudioBufferSourceNode
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true; // Repeat play setting
        
        // Add gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1; // Maximum volume
        
        // Connect audio graph
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start playing
        source.start(0);
        
        // Save for later stop
        alarmAudio = {
            source: source,
            gainNode: gainNode,
            stop: function() {
                try {
                    source.stop(0);
                } catch(e) {
                    console.log('Already stopped source:', e);
                }
            }
        };
    }
    
    // Old method sound playing (fallback)
    function fallbackPlaySound() {
        let audioSrc = './audio/ringtone-wow.mp3';
        
        if (window.customAlarmSound) {
            audioSrc = window.customAlarmSound;
        }
        
        const audio = new Audio(audioSrc);
        audio.loop = true; // Repeat play setting
        
        // Try playing
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Old method sound playback failed:', error);
            });
        }
        
        alarmAudio = audio;
    }
}

// Sound stop function
function stopSound() {
    if (alarmAudio) {
        if (alarmAudio.source && alarmAudio.stop) {
            // If using Web Audio API
            alarmAudio.stop();
        } else if (alarmAudio.pause) {
            // If using old Audio object
            alarmAudio.pause();
        }
        alarmAudio = null;
    }
}

// Web notification showing function
function showWebNotification(title, message) {
    // Check browser notification support
    if (!("Notification" in window)) {
        console.warn("This browser does not support notifications.");
        return;
    }
    
    // Request notification permission
    if (Notification.permission === "granted") {
        createNotification();
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                createNotification();
            }
        });
    }
    
    // Notification creation function
    function createNotification() {
        const notification = new Notification(title, {
            body: message,
            icon: './timegom Logo.png',
            vibrate: [200, 100, 200]
        });
        
        // Notification clicked to focus tab
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        // Close notification automatically after 4 seconds
        setTimeout(() => {
            notification.close();
        }, 4000);
    }
}

// Number padding function (add 0 in front of single digit)
function padZero(num) {
    return num.toString().padStart(2, '0');
} 