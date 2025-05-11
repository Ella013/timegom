// 타이머 기능
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('timer')) {
        // 타이머 요소 선택
        const timerDisplay = document.getElementById('timer');
        const minutesInput = document.getElementById('minutes');
        const secondsInput = document.getElementById('seconds');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const timerInput = document.getElementById('timerInput');
        
        let timerInterval;
        let remainingTime = 0;
        let isRunning = false;
        let isPaused = false;
        
        // 시작 버튼 이벤트 리스너
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                // 타이머 처음 시작할 때
                const minutes = parseInt(minutesInput.value) || 0;
                const seconds = parseInt(secondsInput.value) || 0;
                remainingTime = (minutes * 60 + seconds) * 1000;
                
                if (remainingTime <= 0) {
                    alert('타이머 시간을 설정해주세요.');
                    return;
                }
                
                // 입력 필드 비활성화
                timerInput.style.display = 'none';
                
                // 버튼 상태 변경
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                resetBtn.disabled = false;
                
                isRunning = true;
                startTimer();
            } else if (isPaused) {
                // 일시정지 후 재시작
                isPaused = false;
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
            isRunning = false;
            isPaused = false;
            
            // 입력 필드 다시 표시
            timerInput.style.display = 'flex';
            
            // 타이머 디스플레이 초기화
            timerDisplay.textContent = '00:00';
            
            // 버튼 상태 초기화
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = true;
        });
        
        // 타이머 시작 함수
        function startTimer() {
            const endTime = Date.now() + remainingTime;
            
            timerInterval = setInterval(function() {
                const currentTime = Date.now();
                remainingTime = endTime - currentTime;
                
                if (remainingTime <= 0) {
                    clearInterval(timerInterval);
                    timerDisplay.textContent = '00:00';
                    timerComplete();
                    return;
                }
                
                updateTimerDisplay();
            }, 100);
        }
        
        // 타이머 디스플레이 업데이트 함수
        function updateTimerDisplay() {
            timerDisplay.textContent = formatTimeMinSec(remainingTime);
        }
        
        // 타이머 완료 함수
        function timerComplete() {
            playSound('timer');
            alert('타이머가 완료되었습니다!');
            
            // 타이머 상태 및 UI 초기화
            isRunning = false;
            isPaused = false;
            timerInput.style.display = 'flex';
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = true;
        }
    }
}); 