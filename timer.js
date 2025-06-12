// 타이머 기능
document.addEventListener('DOMContentLoaded', function() {
    // 오디오 컨텍스트 초기화 (페이지 로드 시 미리 생성)
    initializeAudioContext();
    
    // 페이지 로드 시 로컬 스토리지 초기화 (페이지를 처음 열었을 때 깨끗한 상태로 시작)
    localStorage.removeItem('alarmIsPlaying');
    localStorage.removeItem('timerCompleted');
    
    // 페이지 가시성 변경 감지 이벤트 리스너 등록
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 페이지 로드시 저장된 타이머가 있는지 확인
    checkSavedTimer();

    // 음원 파일 업로드 처리
    const soundUpload = document.getElementById('soundUpload');
    const soundName = document.getElementById('soundName');
    const testSoundBtn = document.getElementById('testSoundBtn');
    const resetSoundBtn = document.getElementById('resetSoundBtn');
    
    // 사용자 지정 알람 소리
    window.customAlarmSound = null;
    
    // 사용자의 첫 인터랙션으로 오디오 컨텍스트 활성화
    document.body.addEventListener('click', function() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
    
    if (soundUpload) {
        soundUpload.addEventListener('change', function(e) {
            console.log('Sound file selected');
            if (this.files && this.files[0]) {
                const file = this.files[0];
                soundName.textContent = file.name;
                
                // FileReader로 파일을 읽어서 Audio 객체에 설정
                const reader = new FileReader();
                reader.onload = function(e) {
                    window.customAlarmSound = e.target.result;
                    console.log('Sound file loaded successfully');
                };
                reader.readAsDataURL(file);
            } else {
                soundName.textContent = 'Using Default Alarm Sound';
                window.customAlarmSound = null;
            }
        });
    }
    
    // 테스트 사운드 버튼
    if (testSoundBtn) {
        testSoundBtn.isPlaying = false;
        
        testSoundBtn.addEventListener('click', function() {
            console.log('Test Sound button clicked');
            if (this.isPlaying) {
                stopSound();
                this.textContent = 'Test Sound';
                this.isPlaying = false;
            } else {
                playSound('timer', true);
                this.textContent = 'Stop';
                this.isPlaying = true;
            }
        });
    }
    
    // 초기화 버튼
    if (resetSoundBtn) {
        resetSoundBtn.addEventListener('click', function() {
            console.log('Reset button clicked');
            window.customAlarmSound = null;
            soundName.textContent = 'Using Default Alarm Sound';
            
            if (soundUpload) {
                soundUpload.value = '';
            }
            
            if (testSoundBtn && testSoundBtn.isPlaying) {
                stopSound();
                testSoundBtn.textContent = 'Test Sound';
                testSoundBtn.isPlaying = false;
            }
        });
    }

    if (document.getElementById('timer')) {
        // 타이머 요소 선택
        const timerContainer = document.querySelector('.circle-timer-container');
        const timerDisplay = document.getElementById('timer');
        const setMinutesDisplay = document.getElementById('setMinutes');
        const endTimeDisplay = document.getElementById('endTime');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const timerAlarm = document.getElementById('timerAlarm');
        const alarmCloseBtn = document.getElementById('alarmCloseBtn');
        
        // 원형 프로그레스 요소
        const progressRing = document.querySelector('.progress-ring-circle');
        const radius = progressRing ? progressRing.r.baseVal.value : 140;
        const circumference = 2 * Math.PI * radius;
        
        // 초기 설정
        if (progressRing) {
            progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            progressRing.style.strokeDashoffset = '0';
        }
        
        let timerInterval;
        let endTime = 0;
        let totalDuration = 0;
        let remainingTime = 0;
        let isRunning = false;
        let isPaused = false;
        
        // 초기화 버튼 활성화
        resetBtn.disabled = false;
        
        // 시작 버튼 이벤트 리스너
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                // 이전에 남아있는 타이머 상태 초기화
                localStorage.removeItem('timerEndTime');
                localStorage.removeItem('timerTotal');
                localStorage.removeItem('timerIsRunning');
                localStorage.removeItem('timerCompleted');
                localStorage.removeItem('alarmIsPlaying');
                
                // 이전 알람 소리가 있다면 중지
                if (alarmAudio) {
                    stopSound();
                }
                
                // 타이틀 플래시가 활성화되어 있다면 중지
                stopTitleFlash();
                
                // 알람창이 표시되어 있다면 숨김
                const timerAlarm = document.getElementById('timerAlarm');
                if (timerAlarm && timerAlarm.classList.contains('show')) {
                    timerAlarm.classList.remove('show');
                }
                
                // 타이머 처음 시작할 때
                let hours = parseInt(document.getElementById('hourInput').value) || 0;
                let minutes = parseInt(document.getElementById('minuteInput').value) || 0;
                let seconds = parseInt(document.getElementById('secondInput').value) || 0;
                
                // 모든 값이 0이면 기본값 5초 설정
                if (hours === 0 && minutes === 0 && seconds === 0) {
                    seconds = 5;
                    document.getElementById('secondInput').value = 5;
                }
                
                totalDuration = (hours * 3600 + minutes * 60 + seconds) * 1000;
                remainingTime = totalDuration;
                endTime = Date.now() + remainingTime;
                
                // 입력창 숨기고 타이머 표시
                timerContainer.classList.add('timer-running');
                
                // 종료 예정 시간 계산 및 표시
                setMinutesDisplay.textContent = minutes;
                const endTimeObj = new Date(endTime);
                const endHours = endTimeObj.getHours();
                const endMinutes = endTimeObj.getMinutes();
                const ampm = endHours < 12 ? 'AM' : 'PM';
                const displayHours = endHours % 12 || 12;
                endTimeDisplay.textContent = `${ampm} ${displayHours}:${padZero(endMinutes)}`;
                
                // 버튼 상태 변경
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                resetBtn.disabled = false;
                
                // 프로그레스 링 초기화
                if (progressRing) {
                    progressRing.style.strokeDashoffset = '0';
                    progressRing.style.opacity = '1';
                }
                
                isRunning = true;
                
                // 첫 화면에 설정한 정확한 시간을 표시
                const initialMinutes = Math.floor(totalDuration / 60000);
                const initialSeconds = Math.floor((totalDuration % 60000) / 1000);
                timerDisplay.textContent = `${padZero(initialMinutes)}:${padZero(initialSeconds)}`;
                
                // 타이머 시작
                startTimer();
            } else if (isPaused) {
                // 일시정지 후 재시작
                isPaused = false;
                endTime = Date.now() + remainingTime;
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                startTimer();
            }
        });
        
        // 일시정지 버튼 이벤트 리스너
        pauseBtn.addEventListener('click', function() {
            if (isRunning && !isPaused) {
                clearInterval(timerInterval);
                isPaused = true;
                startBtn.disabled = false;
                pauseBtn.disabled = true;
            }
        });
        
        // 초기화 버튼 이벤트 리스너
        resetBtn.addEventListener('click', function() {
            console.log('리셋 버튼 클릭됨');
            clearInterval(timerInterval);
            // 강제로 모든 알람 중지
            stopSound();
            resetTimer();
        });
        
        // 알람창 닫기 버튼 이벤트 리스너 설정
        if (alarmCloseBtn) {
            alarmCloseBtn.onclick = function() {
                console.log('Alarm stop button clicked');
                
                // Stop alarm sound and clear all audio states
                stopSound();
                
                // Clear alarm state from localStorage
                localStorage.removeItem('alarmIsPlaying');
                
                // Hide alarm window
                const timerAlarm = document.getElementById('timerAlarm');
                if (timerAlarm) {
                    timerAlarm.classList.remove('show');
                }
                
                // Reset timer
                resetTimer();
                
                // Stop title flash
                stopTitleFlash();
            };
        }
        
        // 타이머 시작 함수
        function startTimer() {
            // 타이머 시작 시 localStorage에 타이머 정보 저장
            localStorage.setItem('timerEndTime', endTime);
            localStorage.setItem('timerTotal', totalDuration);
            localStorage.setItem('timerIsRunning', 'true');
            console.log('타이머 시작: 저장된 종료 시간:', new Date(parseInt(localStorage.getItem('timerEndTime'))));
            
            // 매 프레임마다 타이머를 업데이트하기 위한 requestAnimationFrame 사용
            let lastSecond = Math.floor(remainingTime / 1000);
            let lastUpdate = Date.now();
            
            function updateTimer(timestamp) {
                if (!isRunning || isPaused) return;
                
                const now = Date.now();
                // 남은 시간 계산 (milliseconds)
                remainingTime = Math.max(0, endTime - now);
                
                // 초 단위로 변환
                const currentSecond = Math.ceil(remainingTime / 1000); // 올림으로 변경
                
                // 타이머 표시 업데이트 (1초 이상일 때만)
                if (currentSecond > 0) {
                    // 타이머 디스플레이 업데이트 (초 올림)
                    const displayMinutes = Math.floor(currentSecond / 60);
                    const displaySeconds = currentSecond % 60;
                    
                    // 현재 초가 변경됐을 때만 표시 업데이트
                    if (currentSecond !== lastSecond) {
                        lastSecond = currentSecond;
                        timerDisplay.textContent = `${padZero(displayMinutes)}:${padZero(displaySeconds)}`;
                    }
                } else if (lastSecond > 0) {
                    // 마지막으로 0으로 변경 (타이머 완료 시)
                    lastSecond = 0;
                    timerDisplay.textContent = '00:00';
                }
                
                // 프로그레스 링은 매 프레임마다 부드럽게 업데이트
                if (progressRing) {
                    const progress = remainingTime / totalDuration;
                    const dashOffset = circumference * (1 - progress);
                    progressRing.style.strokeDashoffset = dashOffset;
                }
                
                // 남은 시간이 0이면 타이머 완료 처리
                if (remainingTime <= 0) {
                    isRunning = false;
                    
                    // 타이머가 0에 도달하면 원형 선이 완전히 채워지도록 설정
                    if (progressRing) {
                        progressRing.style.strokeDashoffset = circumference;
                    }
                    
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
            try {
                // 이미 알람이 재생 중인지 먼저 확인
                const alarmIsPlaying = localStorage.getItem('alarmIsPlaying') === 'true';
                if (alarmIsPlaying) {
                    console.log('타이머 컴플리트: 알람이 이미 재생 중임, 중복 알람 방지');
                    
                    // 알람창은 표시
                    const timerAlarm = document.getElementById('timerAlarm');
                    if (timerAlarm && !timerAlarm.classList.contains('show')) {
                        timerAlarm.classList.add('show');
                    }
                    
                    // 타이틀 플래시는 시작
                    if (!titleInterval) {
                        startTitleFlash();
                    }
                    
                    // localStorage에서 타이머 데이터 삭제
                    localStorage.removeItem('timerEndTime');
                    localStorage.removeItem('timerTotal');
                    localStorage.removeItem('timerIsRunning');
                    
                    return; // 이미 알람이 재생 중이면 여기서 함수 종료
                }
                
                // localStorage에서 타이머 데이터 삭제
                localStorage.removeItem('timerEndTime');
                localStorage.removeItem('timerTotal');
                localStorage.removeItem('timerIsRunning');
                
                // 기존 재생 중인 알람이 있다면 중지
                if (alarmAudio) {
                    stopSound();
                }
                
                // 오디오 컨텍스트 상태 확인 및 재개
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume().catch(e => console.error('오디오 컨텍스트 재개 실패:', e));
                }
                
                // 알람 재생 중 플래그 미리 설정 (중복 방지)
                localStorage.setItem('alarmIsPlaying', 'true');
                
                // 오디오 요소를 직접 페이지에 추가
                const audio = new Audio();
                
                // 중요: src 설정 전에 이벤트 리스너 추가
                audio.addEventListener('canplaythrough', function() {
                    // 소리 재생 시도
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log('알람 재생 성공');
                            
                            // 알람 계속 재생 확인을 위한 인터벌 설정
                            const checkAlarmInterval = setInterval(() => {
                                if (audio.paused) {
                                    console.log('알람이 중단됨, 재시작 시도');
                                    audio.play().catch(e => console.error('알람 재시작 실패:', e));
                                }
                            }, 1000);
                            
                            // 인터벌 ID를 오디오 객체에 저장
                            audio.checkInterval = checkAlarmInterval;
                        }).catch(e => {
                            console.error('알람 재생 실패:', e);
                            // 두 번째 방법으로 시도
                            setTimeout(() => {
                                audio.play().catch(e => console.error('두 번째 재생 시도 실패:', e));
                            }, 1000);
                        });
                    }
                }, { once: true });
                
                // 추가 이벤트 리스너
                audio.addEventListener('error', function(e) {
                    console.error('오디오 로딩 오류:', e);
                    // Web Audio API로 대체 시도
                    playSound('timer');
                });
                
                // 소스 설정
                audio.src = window.customAlarmSound || './audio/ringtone-wow.mp3';
                
                // 백그라운드 재생 허용 속성 추가
                audio.loop = true; // 반복 재생 속성 활성화
                audio.autoplay = true;
                audio.muted = false;
                audio.volume = 1.0;
                audio.mozAudioChannelType = 'alarm'; // Firefox
                audio.msAudioCategory = 'alarm';     // IE/Edge
                audio.setAttribute('webkit-playsinline', 'true'); // iOS
                audio.setAttribute('playsinline', 'true');       // iOS
                
                // DOM에 요소 추가 (필수: 일부 브라우저에서는 이것이 없으면 배경 재생이 안 됨)
                document.body.appendChild(audio);
                
                // 알람 전역 변수에 저장
                alarmAudio = audio;
                
                // 알람 메시지 표시
                timerAlarm.classList.add('show');
            } catch (e) {
                console.error('타이머 완료 처리 중 오류:', e);
                // 오류 발생 시 대체 방법으로 재생 시도
                playSound('timer');
            }
        }
        
        // 타이머 초기화 함수
        function resetTimer() {
            console.log('타이머 초기화 함수 호출됨');
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = false;
            
            // localStorage에서 타이머 데이터 삭제
            localStorage.removeItem('timerEndTime');
            localStorage.removeItem('timerTotal');
            localStorage.removeItem('timerIsRunning');
            localStorage.removeItem('timerCompleted');
            localStorage.removeItem('alarmIsPlaying');
            
            // 알람 소리 중지 (초기화 버튼 눌렀을 때도 알람 꺼지도록)
            stopSound();
            
            // 알람창 닫기
            const timerAlarm = document.getElementById('timerAlarm');
            if (timerAlarm) {
                timerAlarm.classList.remove('show');
            }
            
            // 시간 입력 필드 초기화
            document.getElementById('hourInput').value = 0;
            document.getElementById('minuteInput').value = 0;
            document.getElementById('secondInput').value = 0;
            
            // 프리셋 버튼 선택 해제
            document.querySelectorAll('.timer-preset-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 타이머 디스플레이 초기화
            const timerDisplay = document.getElementById('timer');
            const endTimeDisplay = document.getElementById('endTime');
            const setMinutesDisplay = document.getElementById('setMinutes');
            
            if (timerDisplay) timerDisplay.textContent = '00:00';
            if (endTimeDisplay) endTimeDisplay.textContent = '--:--';
            if (setMinutesDisplay) setMinutesDisplay.textContent = '0';
            
            // 프로그레스링 초기화
            const progressRing = document.querySelector('.progress-ring-circle');
            if (progressRing) {
                progressRing.style.strokeDashoffset = '0';
                progressRing.style.opacity = '1';
            }
            
            // 입력창 다시 표시
            const timerContainer = document.querySelector('.circle-timer-container');
            if (timerContainer) {
                timerContainer.classList.remove('timer-running');
            }
            
            // 버튼 상태 초기화
            const startBtn = document.getElementById('startBtn');
            const pauseBtn = document.getElementById('pauseBtn');
            const resetBtn = document.getElementById('resetBtn');
            
            if (startBtn) startBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
            if (resetBtn) resetBtn.disabled = false;
            
            console.log('타이머 초기화 완료');
        }
    }
});

// 숫자 입력 및 증감 버튼 동작
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function updateInput(unit, delta) {
    const input = document.getElementById(unit + 'Input');
    const min = parseInt(input.min, 10);
    const max = parseInt(input.max, 10);
    let val = parseInt(input.value, 10) || 0;
    val = clamp(val + delta, min, max);
    input.value = val;
}

// 버튼 연속 증감을 위한 변수
let buttonIntervals = {};
let buttonTimeouts = {};

document.querySelectorAll('.plus-btn').forEach(btn => {
    // 버튼 누를 때
    btn.addEventListener('mousedown', function() {
        const unit = this.dataset.unit;
        const btnId = unit + 'plus';
        
        // 즉시 첫 번째 변경 적용
        updateInput(unit, 1);
        
        // 버튼을 계속 누르고 있을 때 약간의 지연 후 빠르게 증가
        buttonTimeouts[btnId] = setTimeout(() => {
            buttonIntervals[btnId] = setInterval(() => {
                updateInput(unit, 1);
            }, 100); // 0.1초마다 변경
        }, 500); // 0.5초 후 연속 증가 시작
    });
    
    // 버튼에서 손을 떼거나 마우스가 버튼을 벗어났을 때
    const stopContinuousChange = function() {
        const unit = this.dataset.unit;
        const btnId = unit + 'plus';
        
        // 타임아웃 및 인터벌 정리
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

document.querySelectorAll('.minus-btn').forEach(btn => {
    // 버튼 누를 때
    btn.addEventListener('mousedown', function() {
        const unit = this.dataset.unit;
        const btnId = unit + 'minus';
        
        // 즉시 첫 번째 변경 적용
        updateInput(unit, -1);
        
        // 버튼을 계속 누르고 있을 때 약간의 지연 후 빠르게 감소
        buttonTimeouts[btnId] = setTimeout(() => {
            buttonIntervals[btnId] = setInterval(() => {
                updateInput(unit, -1);
            }, 100); // 0.1초마다 변경
        }, 500); // 0.5초 후 연속 감소 시작
    });
    
    // 버튼에서 손을 떼거나 마우스가 버튼을 벗어났을 때
    const stopContinuousChange = function() {
        const unit = this.dataset.unit;
        const btnId = unit + 'minus';
        
        // 타임아웃 및 인터벌 정리
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

document.querySelectorAll('.time-unit input[type=number]').forEach(input => {
    input.addEventListener('input', function() {
        const min = parseInt(this.min, 10);
        const max = parseInt(this.max, 10);
        let val = parseInt(this.value, 10) || 0;
        this.value = clamp(val, min, max);
    });
});

// 프리셋 버튼 동작
const presetBtns = document.querySelectorAll('.timer-preset-btn');
presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // 현재 입력된 시간 가져오기
        const currentHours = parseInt(document.getElementById('hourInput').value) || 0;
        const currentMinutes = parseInt(document.getElementById('minuteInput').value) || 0;
        const currentSeconds = parseInt(document.getElementById('secondInput').value) || 0;
        
        // 버튼에 설정된 시간 가져오기
        const addHours = parseInt(this.getAttribute('data-hour'), 10) || 0;
        const addMinutes = parseInt(this.getAttribute('data-min'), 10) || 0;
        const addSeconds = parseInt(this.getAttribute('data-sec'), 10) || 0;
        
        // 시간 더하기
        let newSeconds = currentSeconds + addSeconds;
        let newMinutes = currentMinutes + addMinutes + Math.floor(newSeconds / 60);
        newSeconds %= 60;
        
        let newHours = currentHours + addHours + Math.floor(newMinutes / 60);
        newMinutes %= 60;
        
        // 최대값 제한
        newHours = Math.min(newHours, 23);
        
        // 입력 필드에 새 값 설정
        document.getElementById('hourInput').value = newHours;
        document.getElementById('minuteInput').value = newMinutes;
        document.getElementById('secondInput').value = newSeconds;
        
        // 활성화된 프리셋 버튼 표시
        document.querySelectorAll('.timer-preset-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// 숫자 패딩 함수 (한 자리 숫자 앞에 0 추가)
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 글로벌 오디오 객체 추가
let alarmAudio = null;
let audioContext = null;
let audioBuffer = null;
let isAudioInitialized = false;
let titleInterval = null; // 타이틀 변경을 위한 인터벌
let originalTitle = document.title; // 원래 페이지 타이틀 저장
let alarmSeconds = 0; // 알람이 울리고 있는 시간 (초)

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
    // 페이지가 숨겨질 때 localStorage에 현재 상태 저장
    if (document.hidden) {
        console.log('페이지가 백그라운드로 전환됨');
        
        // 전역 변수 대신 localStorage에서 값을 읽어 확인
        const savedEndTime = localStorage.getItem('timerEndTime');
        const isRunning = localStorage.getItem('timerIsRunning') === 'true';
        
        if (isRunning && savedEndTime) {
            // 10초마다 백그라운드에서 타이머 상태 확인 인터벌 설정
            const checkInterval = setInterval(function() {
                const now = Date.now();
                const endTimeValue = parseInt(savedEndTime);
                
                // 타이머 종료 확인
                if (now >= endTimeValue) {
                    console.log('백그라운드 인터벌에서 타이머 종료 감지:', now, endTimeValue);
                    clearInterval(checkInterval);
                    
                    // 이미 알람이 재생 중인지 확인
                    const alarmIsPlaying = localStorage.getItem('alarmIsPlaying') === 'true';
                    
                    // 알람이 아직 재생되지 않은 경우에만 재생
                    if (!alarmIsPlaying) {
                        // 백그라운드에서 알람 재생
                        if (typeof playSound === 'function') {
                            playSound('timer');
                        }
                        
                        // 타이머 종료 플래그 설정
                        localStorage.setItem('timerCompleted', 'true');
                        
                        // 알람이 재생 중임을 표시하는 플래그 설정
                        localStorage.setItem('alarmIsPlaying', 'true');
                    }
                }
            }, 1000);
            
            // 인터벌 ID를 저장하여 나중에 정리할 수 있도록 함
            localStorage.setItem('timerCheckInterval', checkInterval);
        }
        
        // 만약 알람 오디오가 재생 중이라면 계속 유지
        if (alarmAudio && (alarmAudio.paused || alarmAudio.ended)) {
            console.log('백그라운드에서 알람 재생 시도');
            try {
                if (typeof alarmAudio.play === 'function') {
                    alarmAudio.play().catch(e => console.error('백그라운드 알람 재생 실패:', e));
                }
            } catch (e) {
                console.error('백그라운드 알람 재생 중 오류:', e);
            }
        }
    } else {
        console.log('페이지가 포그라운드로 전환됨');
        
        // 먼저 알람이 이미 재생 중인지 확인
        const alarmIsPlaying = localStorage.getItem('alarmIsPlaying') === 'true';
        
        // 1. 알람이 이미 재생 중이면 UI만 업데이트하고 다른 작업은 수행하지 않음
        if (alarmIsPlaying) {
            console.log('알람이 이미 재생 중 - 시각적 업데이트만 수행');
            
            // 알람창 표시
            const timerAlarm = document.getElementById('timerAlarm');
            if (timerAlarm && !timerAlarm.classList.contains('show')) {
                timerAlarm.classList.add('show');
            }
            
            // 타이틀 플래시 시작
            if (!titleInterval) {
                startTitleFlash();
            }
            
            return; // 중요: 알람이 재생 중이면 여기서 함수 종료
        }
        
        // 인터벌 정리
        const intervalId = localStorage.getItem('timerCheckInterval');
        if (intervalId) {
            clearInterval(parseInt(intervalId));
            localStorage.removeItem('timerCheckInterval');
        }
        
        // 오디오 컨텍스트 재개
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
            });
        }
        
        // 2. 백그라운드에서 타이머가 완료되었는지 확인
        const timerCompleted = localStorage.getItem('timerCompleted') === 'true';
        if (timerCompleted) {
            console.log('포그라운드 전환 시 백그라운드에서 완료된 타이머 감지');
            
            // 타이머 상태 초기화 (alarmIsPlaying은 건드리지 않음)
            localStorage.removeItem('timerCompleted');
            localStorage.removeItem('timerEndTime');
            localStorage.removeItem('timerTotal');
            localStorage.removeItem('timerIsRunning');
            
            // 알람이 아직 재생 중이 아닌 경우에만 알람 재생
            if (!alarmIsPlaying) {
                const timerAlarm = document.getElementById('timerAlarm');
                if (timerAlarm) {
                    timerAlarm.classList.add('show');
                }
                
                // 알람 재생
                playSound('timer');
            }
            
            // global isRunning이 있으면 false로 설정
            if (typeof isRunning !== 'undefined') {
                isRunning = false;
            }
            return;
        }
        
        // 3. 타이머가 실행 중이고 종료 시간이 지났는지 확인
        // 중요: 알람이 이미 재생 중이면 이 부분이 실행되지 않음 (위에서 return했으므로)
        const savedEndTime = localStorage.getItem('timerEndTime');
        const savedIsRunning = localStorage.getItem('timerIsRunning') === 'true';
        
        if (savedIsRunning && savedEndTime && parseInt(savedEndTime) <= Date.now()) {
            console.log('포그라운드 전환 시 타이머 종료 감지');
            
            // 타이머 완료 처리
            if (typeof timerComplete === 'function') {
                // global isRunning이 있으면 false로 설정
                if (typeof isRunning !== 'undefined') {
                    isRunning = false;
                }
                timerComplete();
            } else {
                // timerComplete 함수가 없으면 직접 알람 재생
                playSound('timer');
                
                // 타이머 상태 초기화
                localStorage.removeItem('timerEndTime');
                localStorage.removeItem('timerTotal');
                localStorage.removeItem('timerIsRunning');
            }
        }
    }
}

// 알림음 재생 함수
function playSound(type, isTest = false) {
    // 테스트 재생인 경우 별도 처리
    if (isTest) {
        // 기존 재생 중인 알람이 있다면 중지
        stopSound();
        
        // 간단한 오디오 재생
        const audio = new Audio();
        audio.src = window.customAlarmSound || './audio/ringtone-wow.mp3';
        audio.loop = false;
        audio.volume = 1.0;
        
        // 재생 시작
        audio.play().catch(e => console.error('테스트 사운드 재생 실패:', e));
        
        // 알람 전역 변수에 저장
        alarmAudio = audio;
        return;
    }
    
    // 기존 타이머 알람 로직
    if (alarmAudio && !alarmAudio.paused || localStorage.getItem('alarmIsPlaying') === 'true') {
        console.log('이미 알람이 재생 중입니다. 중복 재생 방지');
        
        // 알람창은 표시
        const timerAlarm = document.getElementById('timerAlarm');
        if (timerAlarm && !timerAlarm.classList.contains('show')) {
            timerAlarm.classList.add('show');
        }
        
        // 타이틀 플래시는 시작
        if (!titleInterval) {
            startTitleFlash();
        }
        
        return; // 이미 알람이 재생 중이면 여기서 끝내기
    }
    
    // 여기에 도달하면 새 알람 생성 시작
    console.log('새 알람 생성 시작');
    
    try {
        // 기존 재생 중인 알람이 있다면 중지
        stopSound();
        
        // 타이틀 변경 시작
        startTitleFlash();
        
        // 알람 재생 중 플래그 미리 설정 (중복 방지)
        localStorage.setItem('alarmIsPlaying', 'true');
        
        // 백그라운드에서의 알람 우선 재생 - 가장 간단하고 신뢰할 수 있는 방식
        const audio = new Audio();
        
        // 소스 설정
        audio.src = window.customAlarmSound || './audio/ringtone-wow.mp3';
        
        // 백그라운드 재생에 필요한 속성 설정
        audio.loop = true; // 반복 재생 속성 활성화
        audio.autoplay = true;
        audio.muted = false;
        audio.volume = 1.0;
        audio.mozAudioChannelType = 'alarm'; // Firefox
        audio.msAudioCategory = 'alarm';     // IE/Edge
        audio.setAttribute('webkit-playsinline', 'true'); // iOS
        audio.setAttribute('playsinline', 'true');       // iOS
        
        // DOM에 추가 (일부 브라우저에서는 이렇게 해야 백그라운드 재생이 가능)
        document.body.appendChild(audio);
        
        // 알람 전역 변수에 저장
        alarmAudio = audio;
        
        // 알람 메시지 표시
        timerAlarm.classList.add('show');
    } catch (e) {
        console.error('알림음 재생 실패:', e);
        // 오류 발생 시 기존 방식으로 시도
        fallbackPlaySound();
    }
    
    // 기존 방식의 소리 재생 (폴백)
    function fallbackPlaySound() {
        try {
            // 이미 재생 중인 알람이 있으면 중복 시도 방지
            if (localStorage.getItem('alarmIsPlaying') === 'true' && alarmAudio) {
                console.log('fallback: 이미 알람이 재생 중입니다');
                return;
            }
            
            // Web Audio API 시도
            if (audioContext && isAudioInitialized && audioBuffer) {
                // AudioBufferSourceNode 생성
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.loop = true; // 반복 재생 활성화
                
                // 볼륨 조절 노드 추가
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 1; // 최대 볼륨
                
                // 오디오 그래프 연결
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // 재생 시작
                source.start(0);
                
                // 레퍼런스 저장
                alarmAudio = {
                    source: source,
                    gainNode: gainNode,
                    stop: function() {
                        try {
                            source.stop(0);
                            // 알람 재생 중 플래그 초기화
                            localStorage.removeItem('alarmIsPlaying');
                        } catch(e) {
                            console.log('이미 중지된 소스:', e);
                        }
                    },
                    paused: false
                };
            } else {
                // 이미 재생 중인 알람이 있는지 한 번 더 확인
                if (localStorage.getItem('alarmIsPlaying') === 'true' && alarmAudio) {
                    console.log('fallback final: 이미 알람이 재생 중입니다');
                    return;
                }
                
                // 최후의 방법: 기본 Audio API
                const audioElement = new Audio();
                
                // 소스 설정 - 커스텀 알람 소리 사용
                if (window.customAlarmSound) {
                    audioElement.src = window.customAlarmSound;
                } else {
                    audioElement.src = './audio/ringtone-wow.mp3';
                }
                
                audioElement.loop = true; // 반복 재생 활성화
                audioElement.autoplay = true;
                audio.muted = false;
                audio.volume = 1.0;
                document.body.appendChild(audioElement);
                
                // 레퍼런스 미리 저장 (중복 방지)
                alarmAudio = audioElement;
                
                // 재생 시도
                audioElement.play().then(function() {
                    console.log('최종 방법으로 알람 재생 성공');
                    
                    // 알람 계속 재생 확인을 위한 인터벌 설정
                    const checkAlarmInterval = setInterval(() => {
                        if (audioElement.paused) {
                            console.log('알람이 중단됨, 재시작 시도');
                            audioElement.play().catch(e => console.error('알람 재시작 실패:', e));
                        }
                    }, 1000);
                    
                    // 인터벌 ID를 오디오 객체에 저장
                    audioElement.checkInterval = checkAlarmInterval;
                    
                }).catch(e => console.error('최종 재생 시도 실패:', e));
            }
        } catch (e) {
            console.error('모든 오디오 재생 시도 실패:', e);
        }
    }
}

// 알림음 중지 함수
function stopSound() {
    console.log('알람 정지 함수 호출됨');
    
    try {
        // 인터벌 정리
        if (alarmAudio && alarmAudio.checkInterval) {
            console.log('알람 인터벌 정리');
            clearInterval(alarmAudio.checkInterval);
            alarmAudio.checkInterval = null;
        }
        
        // Web Audio API 방식으로 생성된 경우
        if (alarmAudio && alarmAudio.source && alarmAudio.stop) {
            console.log('Web Audio API 알람 정지');
            alarmAudio.stop();
        } 
        // 기존 Audio 객체인 경우
        else if (alarmAudio && alarmAudio.pause) {
            console.log('표준 Audio 객체 알람 정지');
            alarmAudio.pause();
            alarmAudio.currentTime = 0; // 재생 위치 초기화
            alarmAudio.loop = false; // 루프 비활성화
            
            // src 초기화
            alarmAudio.src = '';
            
            // DOM에서 제거
            if (alarmAudio.remove) {
                alarmAudio.remove();
            } else if (alarmAudio.parentNode) {
                alarmAudio.parentNode.removeChild(alarmAudio);
            }
        }
        
        // 추가 안전 장치: 문서에 있는 모든 오디오 요소 검사 및 정지
        const audioElements = document.querySelectorAll('audio');
        if (audioElements.length > 0) {
            console.log(`문서에서 ${audioElements.length}개의 추가 오디오 요소 발견, 모두 정지`);
            audioElements.forEach(audio => {
                try {
                    audio.pause();
                    audio.currentTime = 0; // 재생 위치 초기화
                    audio.loop = false;
                    audio.src = ''; // src 초기화
                    if (audio.parentNode) {
                        audio.parentNode.removeChild(audio);
                    }
                } catch (e) {
                    console.error('오디오 요소 정지 중 오류:', e);
                }
            });
        }
        
        // 알람 재생 중 플래그 초기화
        localStorage.removeItem('alarmIsPlaying');
        
        // 알람 오디오 객체 초기화
        alarmAudio = null;
        
        // 타이틀 변경 중지
        stopTitleFlash();
        
        console.log('알람 정지 완료');
    } catch (e) {
        console.error('알람 정지 중 오류 발생:', e);
        // 오류 발생 시에도 플래그는 초기화
        localStorage.removeItem('alarmIsPlaying');
        alarmAudio = null;
    }
}

// 타이틀 변경 시작 함수
function startTitleFlash() {
    // 이미 실행 중인 인터벌이 있으면 제거
    if (titleInterval) {
        clearInterval(titleInterval);
    }
    
    // 원래 타이틀 저장
    originalTitle = document.title;
    
    // 타이머 설정 시간 가져오기
    let timerMinutes = 0;
    let timerSeconds = 0;
    
    // 타이머 설정 시간 가져오기
    const hourInput = document.getElementById('hourInput');
    const minuteInput = document.getElementById('minuteInput');
    const secondInput = document.getElementById('secondInput');
    
    if (hourInput && minuteInput && secondInput) {
        const hours = parseInt(hourInput.value) || 0;
        const minutes = parseInt(minuteInput.value) || 0;
        const seconds = parseInt(secondInput.value) || 0;
        
        timerMinutes = hours * 60 + minutes;
        timerSeconds = seconds;
    }
    
    // 시간 형식 생성
    const formattedHours = padZero(Math.floor(timerMinutes / 60));
    const formattedMinutes = padZero(timerMinutes % 60);
    const formattedSeconds = padZero(timerSeconds);
    const timerDisplay = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    
    // 1초마다 타이틀 변경 (설정 시간과 원래 타이틀 번갈아 표시)
    titleInterval = setInterval(function() {
        // 타이틀 표시 형식 (원래 타이틀과 타이머 시간 번갈아 표시)
        if (document.title === originalTitle) {
            document.title = `< ${timerDisplay} >`;
        } else {
            document.title = originalTitle;
        }
    }, 1000);
}

// 타이틀 변경 중지 함수
function stopTitleFlash() {
    if (titleInterval) {
        clearInterval(titleInterval);
        titleInterval = null;
    }
    
    // 타이틀 원래대로 복원
    if (document.title !== originalTitle) {
        document.title = originalTitle;
    }
}

// 웹 알림 표시 함수
function showWebNotification(title, message) {
    // 이미 재생 중인 알람이 있으면 추가 알람 생성하지 않음
    if (alarmAudio && !alarmAudio.paused) {
        console.log('이미 알람이 재생 중입니다.');
        return;
    }
    
    // 타이틀 변경 시작
    startTitleFlash();
    
    // 알림 권한 요청 대신 오디오 재생으로 대체
    // 백그라운드에서도 소리가 들리도록 오디오 요소 직접 추가
    try {
        const audio = new Audio();
        audio.src = window.customAlarmSound || './audio/ringtone-wow.mp3';
        audio.loop = true;
        audio.autoplay = true;
        audio.muted = false;
        audio.volume = 1.0;
        
        // 백그라운드 재생 허용 속성
        audio.mozAudioChannelType = 'alarm'; // Firefox
        audio.msAudioCategory = 'alarm';     // IE/Edge
        audio.setAttribute('webkit-playsinline', 'true'); // iOS
        audio.setAttribute('playsinline', 'true');       // iOS
        
        // DOM에 추가
        document.body.appendChild(audio);
        
        // 재생 시도
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.error('알람 재생 실패:', e);
                // 실패 시 다른 방법으로 시도
                setTimeout(() => audio.play().catch(e => console.error('재시도 실패:', e)), 500);
            });
        }
        
        // 기존 alarmAudio가 있으면 중지하고 새 오디오로 설정
        if (alarmAudio && alarmAudio !== audio) {
            stopSound();
        }
        alarmAudio = audio;
    } catch (e) {
        console.error('알람 생성 오류:', e);
    }
}

// 페이지 로드 시 저장된 타이머 확인
function checkSavedTimer() {
    console.log('페이지 로드: 저장된 타이머 확인');
    
    // 알람이 이미 재생 중인지 먼저 확인
    const alarmIsPlaying = localStorage.getItem('alarmIsPlaying') === 'true';
    
    // 알람이 이미 재생 중이면 UI만 업데이트하고 새 알람은 시작하지 않음
    if (alarmIsPlaying) {
        console.log('체크 세이브드 타이머: 알람이 이미 재생 중임');
        
        // 알람창 표시
        const timerAlarm = document.getElementById('timerAlarm');
        if (timerAlarm) {
            timerAlarm.classList.add('show');
        }
        
        // 타이틀 플래시 시작
        startTitleFlash();
        
        return; // 알람이 이미 재생 중이면 여기서 함수 종료
    }
    
    // 알람이 재생 중이 아닌 경우에만 저장된 타이머 확인
    const savedEndTime = localStorage.getItem('timerEndTime');
    const savedTotal = localStorage.getItem('timerTotal');
    const isRunning = localStorage.getItem('timerIsRunning') === 'true';
    
    if (savedEndTime && isRunning) {
        const now = Date.now();
        const endTime = parseInt(savedEndTime);
        
        console.log('저장된 타이머 상태 확인:', {
            현재시간: new Date(now),
            저장된종료시간: new Date(endTime),
            남은시간: endTime - now
        });
        
        // 저장된 타이머가 이미 종료되었는지 확인
        if (endTime <= now) {
            console.log('저장된 타이머가 종료됨: 알람 재생');
            // 타이머가 종료된 경우 알람 재생
            playSound('timer');
            
            // 알람창 표시
            const timerAlarm = document.getElementById('timerAlarm');
            if (timerAlarm) {
                timerAlarm.classList.add('show');
            }
            
            // 타이머 상태 초기화
            localStorage.removeItem('timerEndTime');
            localStorage.removeItem('timerTotal');
            localStorage.removeItem('timerIsRunning');
        }
    }
} 