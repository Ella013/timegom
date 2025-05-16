// 집중 타이머(Pomodoro) 기능
document.addEventListener('DOMContentLoaded', function() {
    // 오디오 컨텍스트 초기화 (페이지 로드 시 미리 생성)
    initializeAudioContext();
    
    if (document.querySelector('.pomodoro-section')) {
        // 요소 선택
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
        
        // 설정 관련 요소
        const focusTimeDisplay = document.getElementById('focusTime');
        const breakTimeDisplay = document.getElementById('breakTime');
        const longBreakTimeDisplay = document.getElementById('longBreakTime');
        const cyclesCountDisplay = document.getElementById('cyclesCount');
        
        // 원형 프로그레스 요소
        const progressRing = document.querySelector('.progress-ring-circle');
        const radius = progressRing ? progressRing.r.baseVal.value : 140;
        const circumference = 2 * Math.PI * radius;
        
        // 초기 설정
        if (progressRing) {
            progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            progressRing.style.strokeDashoffset = '0';
        }
        
        // 상태 변수
        let currentMode = 'focus'; // focus, break, longBreak
        let isRunning = false;
        let isPaused = false;
        let timerInterval;
        let endTime = 0;
        let remainingTime = 0;
        let totalDuration = 0;
        
        // 설정 값 (분)
        let settings = {
            focus: 25,
            break: 5,
            longBreak: 15,
            cycles: 4
        };
        
        // 현재 사이클
        let currentCycle = 0;
        
        // 타이머 초기화
        updateTimerDisplay(settings.focus * 60 * 1000);
        
        // 설정 버튼 이벤트 리스너
        document.querySelectorAll('.setting-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (isRunning) return; // 타이머 실행 중에는 설정 변경 불가
                
                const action = this.classList.contains('plus-btn') ? 1 : -1;
                const setting = this.dataset.setting;
                
                // 설정 값 변경
                let value = settings[setting] + action;
                
                // 범위 제한
                switch(setting) {
                    case 'focus':
                        value = Math.max(1, Math.min(60, value)); // 1-60분
                        break;
                    case 'break':
                        value = Math.max(1, Math.min(30, value)); // 1-30분
                        break;
                    case 'longBreak':
                        value = Math.max(1, Math.min(60, value)); // 1-60분
                        break;
                    case 'cycles':
                        value = Math.max(1, Math.min(10, value)); // 1-10회
                        break;
                }
                
                settings[setting] = value;
                
                // 화면 업데이트
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
                    // 현재 모드가 아닌 설정만 변경
                    if (setting === 'focus') focusTimeDisplay.textContent = settings.focus;
                    if (setting === 'break') breakTimeDisplay.textContent = settings.break;
                    if (setting === 'longBreak') longBreakTimeDisplay.textContent = settings.longBreak;
                }
                
                if (setting === 'cycles') {
                    cyclesCountDisplay.textContent = settings.cycles;
                    cycleCountDisplay.textContent = currentCycle;
                    document.querySelector('.cycle-count').innerHTML = `사이클: <span id="cycleCount">${currentCycle}</span>/${settings.cycles}`;
                }
            });
        });
        
        // 타이머 시작 버튼 이벤트 리스너
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                // 타이머 처음 시작 또는 재시작
                if (!isPaused) {
                    // 모드에 따른 시간 설정
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
                    // 일시정지 후 재시작
                    totalDuration = remainingTime;
                }
                
                endTime = Date.now() + remainingTime;
                
                // 종료 예정 시간 표시
                updateEndTimeDisplay();
                
                // 버튼 상태 변경
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                resetBtn.disabled = false;
                skipBtn.disabled = false;
                
                isRunning = true;
                isPaused = false;
                
                startTimer();
            }
        });
        
        // 일시정지 버튼 이벤트 리스너
        pauseBtn.addEventListener('click', function() {
            if (isRunning) {
                clearInterval(timerInterval);
                isRunning = false;
                isPaused = true;
                remainingTime = endTime - Date.now();
                
                // 버튼 상태 변경
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        });
        
        // 초기화 버튼 이벤트 리스너
        resetBtn.addEventListener('click', function() {
            resetTimer();
        });
        
        // 건너뛰기 버튼 이벤트 리스너
        skipBtn.addEventListener('click', function() {
            if (isRunning) {
                clearInterval(timerInterval);
            }
            
            // 다음 모드로 변경
            switchMode();
        });
        
        // 알람 닫기 버튼 이벤트 리스너
        if (alarmCloseBtn) {
            alarmCloseBtn.addEventListener('click', function() {
                // 알람음 중지
                if (alarmAudio) {
                    alarmAudio.pause();
                    alarmAudio.remove(); // DOM에서 제거
                    alarmAudio = null;
                }
                
                alarmContent.classList.remove('show');
                
                // 자동으로 다음 모드로 이동
                switchMode();
            });
        }
        
        // 페이지 가시성 변경 감지
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // 사용자의 첫 인터랙션으로 오디오 컨텍스트 활성화
        document.body.addEventListener('click', function() {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }, { once: true });
        
        // 타이머 시작 함수
        function startTimer() {
            // 매 프레임마다 타이머를 업데이트하기 위한 requestAnimationFrame 사용
            function updateTimer(timestamp) {
                if (!isRunning || isPaused) return;
                
                const now = Date.now();
                remainingTime = Math.max(0, endTime - now);
                
                // 초 단위로 변환
                const currentSecond = Math.ceil(remainingTime / 1000);
                
                // 타이머 표시 업데이트
                const minutes = Math.floor(currentSecond / 60);
                const seconds = currentSecond % 60;
                timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
                
                // 프로그레스 링 업데이트
                if (progressRing) {
                    const progress = remainingTime / totalDuration;
                    const dashOffset = circumference * (1 - progress);
                    progressRing.style.strokeDashoffset = dashOffset;
                }
                
                // 남은 시간이 0이면 타이머 완료 처리
                if (remainingTime <= 0) {
                    isRunning = false;
                    timerDisplay.textContent = '00:00';
                    
                    // 타이머가 0에 도달하면 원형 선 완전히 채움
                    if (progressRing) {
                        progressRing.style.strokeDashoffset = circumference;
                    }
                    
                    // 완료 처리
                    timerComplete();
                    return;
                }
                
                // 다음 프레임 요청
                requestAnimationFrame(updateTimer);
            }
            
            // 첫 프레임 시작
            requestAnimationFrame(updateTimer);
        }
        
        // 타이머 완료 함수
        function timerComplete() {
            // 오디오 요소를 직접 페이지에 추가
            const audio = document.createElement('audio');
            audio.src = window.customAlarmSound || './audio/ringtone-wow.mp3';
            audio.loop = true;
            document.body.appendChild(audio);
            
            // 소리 재생 시도
            audio.play().catch(e => console.error('알람 재생 실패:', e));
            
            // 알람 전역 변수에 저장
            alarmAudio = audio;
            
            // 모드에 따른 알람 메시지 설정
            let title, message;
            if (currentMode === 'focus') {
                alarmTitle.textContent = '집중 시간 완료!';
                alarmMessage.textContent = '휴식 시간을 시작하세요.';
                title = '집중 시간 완료!';
                message = '휴식 시간을 시작하세요.';
            } else if (currentMode === 'break' || currentMode === 'longBreak') {
                alarmTitle.textContent = '휴식 시간 완료!';
                alarmMessage.textContent = '다시 집중할 시간입니다.';
                title = '휴식 시간 완료!';
                message = '다시 집중할 시간입니다.';
            }
            
            // 알람 메시지 표시
            alarmContent.classList.add('show');
            
            // 웹 알림 표시 시도
            try {
                // 알림 권한 즉시 요청
                if (Notification.permission !== "granted") {
                    Notification.requestPermission();
                }
                
                // 알림 표시
                if (Notification.permission === "granted") {
                    const notification = new Notification(title, {
                        body: message,
                        icon: './timegom Logo.png',
                        sound: './audio/ringtone-wow.mp3', // 알림음 지정
                        vibrate: [200, 100, 200],          // 진동 패턴
                        silent: false                      // 알림음 활성화
                    });
                    
                    // 알림 클릭시 창 포커스
                    notification.onclick = function() {
                        window.focus();
                        this.close();
                    };
                }
            } catch (e) {
                console.error('알림 표시 실패:', e);
            }
        }
        
        // 타이머 초기화 함수
        function resetTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = false;
            
            // 모드를 집중으로 초기화
            currentMode = 'focus';
            setModeUI('focus');
            
            // 사이클 초기화
            currentCycle = 0;
            cycleCountDisplay.textContent = currentCycle;
            
            // 타이머 표시 초기화
            updateTimerDisplay(settings.focus * 60 * 1000);
            
            // 종료 시간 초기화
            endTimeDisplay.textContent = '--:--';
            
            // 프로그레스링 초기화
            if (progressRing) {
                progressRing.style.strokeDashoffset = '0';
            }
            
            // 버튼 상태 초기화
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
            skipBtn.disabled = true;
        }
        
        // 모드 전환 함수
        function switchMode() {
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = false;
            
            // 현재 모드에 따라 다음 모드 결정
            if (currentMode === 'focus') {
                // 집중 모드 완료 시 사이클 증가
                currentCycle++;
                cycleCountDisplay.textContent = currentCycle;
                
                // 설정한 사이클 횟수에 도달하면 긴 휴식, 아니면 짧은 휴식
                if (currentCycle >= settings.cycles) {
                    currentMode = 'longBreak';
                    setModeUI('longBreak');
                    updateTimerDisplay(settings.longBreak * 60 * 1000);
                } else {
                    currentMode = 'break';
                    setModeUI('break');
                    updateTimerDisplay(settings.break * 60 * 1000);
                }
            } else {
                // 휴식 모드(짧은/긴) 완료 시 다시 집중 모드로
                currentMode = 'focus';
                setModeUI('focus');
                updateTimerDisplay(settings.focus * 60 * 1000);
                
                // 긴 휴식 후에는 사이클 초기화
                if (currentMode === 'longBreak') {
                    currentCycle = 0;
                    cycleCountDisplay.textContent = currentCycle;
                }
            }
            
            // 종료 시간 초기화
            endTimeDisplay.textContent = '--:--';
            
            // 버튼 상태 초기화
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
            skipBtn.disabled = true;
        }
        
        // 타이머 표시 업데이트
        function updateTimerDisplay(ms) {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
        }
        
        // 종료 시간 표시 업데이트
        function updateEndTimeDisplay() {
            const endTimeObj = new Date(endTime);
            const hours = endTimeObj.getHours();
            const minutes = endTimeObj.getMinutes();
            const ampm = hours < 12 ? '오전' : '오후';
            const displayHours = hours % 12 || 12;
            endTimeDisplay.textContent = `${ampm} ${displayHours}:${padZero(minutes)}`;
        }
        
        // 모드에 따른 UI 변경
        function setModeUI(mode) {
            const timerContainer = document.querySelector('.pomodoro-timer');
            
            // 기존 모드 클래스 제거
            timerContainer.classList.remove('focus-mode', 'break-mode', 'long-break-mode');
            
            // 새 모드 클래스 추가
            switch(mode) {
                case 'focus':
                    timerContainer.classList.add('focus-mode');
                    timerMode.textContent = '집중 모드';
                    statusBadge.textContent = '집중 시간';
                    break;
                case 'break':
                    timerContainer.classList.add('break-mode');
                    timerMode.textContent = '휴식 모드';
                    statusBadge.textContent = '짧은 휴식';
                    break;
                case 'longBreak':
                    timerContainer.classList.add('long-break-mode');
                    timerMode.textContent = '긴 휴식 모드';
                    statusBadge.textContent = '긴 휴식';
                    break;
            }
        }
    }
});

// 글로벌 오디오 객체
let alarmAudio = null;
let audioContext = null;
let audioBuffer = null;
let isAudioInitialized = false;

// 오디오 컨텍스트 초기화 함수
function initializeAudioContext() {
    // AudioContext 생성
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        
        // 기본 알람 사운드 미리 로드
        fetch('./audio/ringtone-wow.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedData => {
                audioBuffer = decodedData;
                isAudioInitialized = true;
                console.log('오디오 초기화 완료');
            })
            .catch(error => console.error('오디오 초기화 실패:', error));
    } catch (e) {
        console.error('Web Audio API를 지원하지 않는 브라우저입니다:', e);
    }
}

// 페이지 가시성 변경 시 처리
function handleVisibilityChange() {
    if (!document.hidden && audioContext && audioContext.state === 'suspended') {
        // 페이지가 다시 보이게 되면 오디오 컨텍스트 재개
        audioContext.resume().then(() => {
            console.log('AudioContext resumed');
        });
    }
}

// 알림음 재생 함수
function playSound(type) {
    // 현재 모드 및 메시지 정보 가져오기
    const getNotificationInfo = () => {
        // 모듈 외부에서 currentMode에 접근할 수 없으므로 DOM 상태로 유추
        const isFocusMode = document.querySelector('.focus-mode') !== null;
        const isBreakMode = document.querySelector('.break-mode') !== null;
        const isLongBreakMode = document.querySelector('.long-break-mode') !== null;
        
        let title, message;
        if (isFocusMode) {
            title = '집중 시간 완료!';
            message = '휴식 시간을 시작하세요.';
        } else if (isBreakMode || isLongBreakMode) {
            title = '휴식 시간 완료!';
            message = '다시 집중할 시간입니다.';
        } else {
            title = '타이머 완료!';
            message = '다음 단계로 진행하세요.';
        }
        
        return { title, message };
    };

    // 웹 알림 먼저 표시 (권한이 있는 경우)
    if (document.hidden) {
        const { title, message } = getNotificationInfo();
        showWebNotification(title, message);
    }
    
    try {
        // 기존 재생 중인 알람이 있다면 중지
        stopSound();
        
        // Web Audio API를 사용한 소리 재생 (브라우저 제한을 우회하는 방법)
        if (audioContext && isAudioInitialized) {
            // AudioContext가 suspended 상태라면 resume 시도
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            // 사용자 지정 알람이 있는지 확인
            if (window.customAlarmSound) {
                // 사용자 지정 알람음 사용
                const audioElement = new Audio(window.customAlarmSound);
                audioElement.loop = true; // 반복 재생 설정
                
                // MediaElementAudioSourceNode 생성
                const source = audioContext.createMediaElementSource(audioElement);
                source.connect(audioContext.destination);
                
                // 재생 시작
                audioElement.play().catch(error => {
                    console.error('사용자 지정 알람음 재생 실패:', error);
                    // 실패 시 기본 알람음으로 대체
                    playDefaultSound();
                });
                
                // 나중에 중지할 수 있도록 참조 저장
                alarmAudio = audioElement;
            } else {
                // 기본 알람음 재생
                playDefaultSound();
            }
        } else {
            // Web Audio API를 사용할 수 없는 경우 기존 방식으로 시도
            fallbackPlaySound();
        }
    } catch(e) {
        console.error('알림음 재생 실패:', e);
        // 오류 발생 시 기존 방식으로 시도
        fallbackPlaySound();
        
        // 웹 알림 표시 (소리가 재생되지 않을 경우)
        if (document.hidden) {
            const { title, message } = getNotificationInfo();
            showWebNotification(title, message);
        }
    }
    
    // 기본 알람음 재생 함수 (Web Audio API 사용)
    function playDefaultSound() {
        if (!audioBuffer) return;
        
        // AudioBufferSourceNode 생성
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true; // 반복 재생 설정
        
        // 볼륨 조절 노드 추가
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1; // 최대 볼륨
        
        // 오디오 그래프 연결
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 재생 시작
        source.start(0);
        
        // 나중에 중지할 수 있도록 참조 저장
        alarmAudio = {
            source: source,
            gainNode: gainNode,
            stop: function() {
                try {
                    source.stop(0);
                } catch(e) {
                    console.log('이미 중지된 소스:', e);
                }
            }
        };
    }
    
    // 기존 방식의 소리 재생 (폴백)
    function fallbackPlaySound() {
        let audioSrc = './audio/ringtone-wow.mp3';
        
        if (window.customAlarmSound) {
            audioSrc = window.customAlarmSound;
        }
        
        const audio = new Audio(audioSrc);
        audio.loop = true; // 반복 재생 설정
        
        // 재생 시도
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('기존 방식 소리 재생 실패:', error);
            });
        }
        
        alarmAudio = audio;
    }
}

// 알림음 중지 함수
function stopSound() {
    if (alarmAudio) {
        if (alarmAudio.source && alarmAudio.stop) {
            // Web Audio API 방식으로 생성된 경우
            alarmAudio.stop();
        } else if (alarmAudio.pause) {
            // 기존 Audio 객체인 경우
            alarmAudio.pause();
        }
        alarmAudio = null;
    }
}

// 웹 알림 표시 함수
function showWebNotification(title, message) {
    // 브라우저에서 알림 지원 확인
    if (!("Notification" in window)) {
        console.warn("이 브라우저는 알림을 지원하지 않습니다.");
        return;
    }
    
    // 알림 권한 요청
    if (Notification.permission === "granted") {
        createNotification();
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                createNotification();
            }
        });
    }
    
    // 알림 생성 함수
    function createNotification() {
        const notification = new Notification(title, {
            body: message,
            icon: './timegom Logo.png',
            vibrate: [200, 100, 200]
        });
        
        // 알림 클릭 시 해당 탭으로 포커스
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        // 4초 후 자동으로 알림 닫기
        setTimeout(() => {
            notification.close();
        }, 4000);
    }
}

// 숫자 패딩 함수 (한 자리 숫자 앞에 0 추가)
function padZero(num) {
    return num.toString().padStart(2, '0');
} 