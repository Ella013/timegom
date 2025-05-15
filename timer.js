// 타이머 기능
document.addEventListener('DOMContentLoaded', function() {
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
        
        // 사용자 지정 알람 소리 설정
        let customAlarmSound = null;
        
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
                const ampm = endHours < 12 ? '오전' : '오후';
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
            clearInterval(timerInterval);
            resetTimer();
        });
        
        // 타이머 시작 함수
        function startTimer() {
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
            // 알람 소리 재생
            playSound('timer');
            
            // 알람 메시지 표시
            timerAlarm.classList.add('show');
            
            // 알람창 닫기 버튼 이벤트
            if (alarmCloseBtn) {
                alarmCloseBtn.addEventListener('click', function() {
                    // 알람음 중지
                    stopSound();
                    timerAlarm.classList.remove('show');
                    resetTimer();
                });
            }
        }
        
        // 타이머 초기화 함수
        function resetTimer() {
            clearInterval(timerInterval);
            isRunning = false;
            isPaused = false;
            
            // 시간 입력 필드 초기화
            document.getElementById('hourInput').value = 0;
            document.getElementById('minuteInput').value = 0;
            document.getElementById('secondInput').value = 0;
            
            // 프리셋 버튼 선택 해제
            document.querySelectorAll('.timer-preset-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 타이머 디스플레이 초기화
            timerDisplay.textContent = '00:00';
            endTimeDisplay.textContent = '--:--';
            setMinutesDisplay.textContent = '0';
            
            // 프로그레스링 초기화
            if (progressRing) {
                progressRing.style.strokeDashoffset = '0';
                progressRing.style.opacity = '1';
            }
            
            // 입력창 다시 표시
            timerContainer.classList.remove('timer-running');
            
            // 버튼 상태 초기화
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        }
    }
    
    // 음원 파일 업로드 기능 추가를 위한 UI 생성
    const timerSection = document.querySelector('.timer-section');
    if (timerSection) {
        const soundUploadContainer = document.createElement('div');
        soundUploadContainer.className = 'sound-upload-container';
        soundUploadContainer.innerHTML = `
            <h3>알람 소리 설정</h3>
            <div class="upload-form">
                <input type="file" id="soundUpload" accept="audio/*" />
                <label for="soundUpload" class="sound-upload-label">음원 파일 선택</label>
                <p class="sound-name" id="soundName">기본 알람음 사용 중</p>
                <button id="testSoundBtn" class="test-sound-btn">소리 테스트</button>
            </div>
        `;
        
        // 타이머 섹션 아래에 추가
        timerSection.appendChild(soundUploadContainer);
        
        // 음원 파일 업로드 처리
        const soundUpload = document.getElementById('soundUpload');
        const soundName = document.getElementById('soundName');
        const testSoundBtn = document.getElementById('testSoundBtn');
        
        // 사용자 지정 알람 소리
        window.customAlarmSound = null;
        
        if (soundUpload) {
            soundUpload.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    soundName.textContent = file.name;
                    
                    // FileReader로 파일을 읽어서 Audio 객체에 설정
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        window.customAlarmSound = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    soundName.textContent = '기본 알람음 사용 중';
                    window.customAlarmSound = null;
                }
            });
        }
        
        // 테스트 사운드 버튼
        if (testSoundBtn) {
            let isPlaying = false;  // 소리 재생 상태 추적

            // 소리 재생이 끝났을 때 상태 초기화
            testSoundBtn.addEventListener('sound-ended', function() {
                isPlaying = false;
            });

            testSoundBtn.addEventListener('click', function() {
                if (isPlaying) {
                    // 재생 중이면 중지
                    stopSound();
                    this.textContent = '소리 테스트';
                    isPlaying = false;
                } else {
                    // 중지 상태면 재생
                    playSound('timer');
                    this.textContent = '중지';
                    isPlaying = true;
                }
            });
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

document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        updateInput(this.dataset.unit, 1);
    });
});
document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        updateInput(this.dataset.unit, -1);
    });
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
        
        // 음원 재생이 끝났을 때 테스트 버튼 상태 초기화
        alarmAudio.onended = function() {
            const testSoundBtn = document.getElementById('testSoundBtn');
            if (testSoundBtn && testSoundBtn.textContent === '중지') {
                testSoundBtn.textContent = '소리 테스트';
                // isPlaying 변수 상태를 위해 커스텀 이벤트 발생
                testSoundBtn.dispatchEvent(new CustomEvent('sound-ended'));
            }
        };
        
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