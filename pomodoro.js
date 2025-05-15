// 집중 타이머(Pomodoro) 기능
document.addEventListener('DOMContentLoaded', function() {
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
                stopSound();
                alarmContent.classList.remove('show');
                
                // 자동으로 다음 모드로 이동
                switchMode();
            });
        }
        
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
            // 알람 소리 재생
            playSound('timer');
            
            // 모드에 따른 알람 메시지 설정
            if (currentMode === 'focus') {
                alarmTitle.textContent = '집중 시간 완료!';
                alarmMessage.textContent = '휴식 시간을 시작하세요.';
            } else if (currentMode === 'break' || currentMode === 'longBreak') {
                alarmTitle.textContent = '휴식 시간 완료!';
                alarmMessage.textContent = '다시 집중할 시간입니다.';
            }
            
            // 알람 메시지 표시
            alarmContent.classList.add('show');
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

// 알림음 재생 함수
function playSound(type) {
    try {
        // 기존 재생 중인 알람이 있다면 중지
        if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio = null;
        }
        
        let audioSrc = './audio/ringtone-wow.mp3';
        
        // 사용자가 업로드한 음원 파일이 있으면 사용
        if (window.customAlarmSound) {
            audioSrc = window.customAlarmSound;
        }
        
        alarmAudio = new Audio(audioSrc);
        alarmAudio.play();
    } catch(e) {
        console.error('알림음 재생 실패:', e);
    }
}

// 알림음 중지 함수
function stopSound() {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio = null;
    }
}

// 숫자 패딩 함수 (한 자리 숫자 앞에 0 추가)
function padZero(num) {
    return num.toString().padStart(2, '0');
} 