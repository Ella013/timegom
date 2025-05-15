// 스톱워치 기능
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('stopwatch')) {
        // 스톱워치 요소 선택
        const stopwatchDisplay = document.getElementById('stopwatch');
        const lapsList = document.getElementById('lapsList');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const lapBtn = document.getElementById('lapBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        let startTime;
        let elapsedTime = 0;
        let stopwatchInterval;
        let lapCount = 0;
        let isRunning = false;
        let lastLapTime = 0;
        
        // 초기 표시
        stopwatchDisplay.innerHTML = formatTimeWithMs(0);
        
        // 시작 버튼 이벤트 리스너
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                startTime = Date.now() - elapsedTime;
                stopwatchInterval = setInterval(updateStopwatch, 10); // 10ms마다 업데이트
                isRunning = true;
                
                // 버튼 상태 변경
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                lapBtn.disabled = false;
                resetBtn.disabled = false;
            }
        });
        
        // 일시정지 버튼 이벤트 리스너
        pauseBtn.addEventListener('click', function() {
            if (isRunning) {
                clearInterval(stopwatchInterval);
                elapsedTime = Date.now() - startTime;
                isRunning = false;
                
                // 버튼 상태 변경
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                lapBtn.disabled = true;
            }
        });
        
        // 기록 버튼 이벤트 리스너
        lapBtn.addEventListener('click', function() {
            if (isRunning) {
                const currentTime = Date.now() - startTime;
                const lapTime = currentTime - lastLapTime;
                lastLapTime = currentTime;
                
                // 기록 추가
                addLap(lapTime, currentTime);
            }
        });
        
        // 초기화 버튼 이벤트 리스너
        resetBtn.addEventListener('click', function() {
            clearInterval(stopwatchInterval);
            stopwatchDisplay.innerHTML = formatTimeWithMs(0);
            lapsList.innerHTML = '';
            
            // 변수 초기화
            elapsedTime = 0;
            lapCount = 0;
            isRunning = false;
            lastLapTime = 0;
            
            // 버튼 상태 초기화
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            lapBtn.disabled = true;
            resetBtn.disabled = true;
        });
        
        // 스톱워치 업데이트 함수
        function updateStopwatch() {
            const currentTime = Date.now();
            elapsedTime = currentTime - startTime;
            
            stopwatchDisplay.innerHTML = formatTimeWithMs(elapsedTime);
        }
        
        // 기록 추가 함수
        function addLap(lapTime, totalTime) {
            lapCount++;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="lap-number">랩 ${lapCount}</span>
                <span class="lap-time">랩 시간: ${formatTimeWithMs(lapTime)}</span>
                <span class="total-time">총 시간: ${formatTimeWithMs(totalTime)}</span>
            `;
            
            // 맨 앞에 추가
            if (lapsList.firstChild) {
                lapsList.insertBefore(li, lapsList.firstChild);
            } else {
                lapsList.appendChild(li);
            }
        }
    }
}); 