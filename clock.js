// 시계 기능
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('clock')) {
        // 디지털/아날로그 토글 버튼
        const digitalToggle = document.getElementById('digitalToggle');
        const analogToggle = document.getElementById('analogToggle');
        const digitalClock = document.getElementById('clock');
        const analogClock = document.getElementById('analogClock');
        
        // 초기 상태 확인 (URL 파라미터에서 시계 타입 체크)
        const urlParams = new URLSearchParams(window.location.search);
        const clockType = urlParams.get('type');
        
        if (clockType === 'analog') {
            // 아날로그 시계 활성화
            analogToggle.click();
        }
        
        // 토글 버튼 이벤트 리스너
        digitalToggle.addEventListener('click', function() {
            digitalToggle.classList.add('active');
            analogToggle.classList.remove('active');
            digitalClock.style.display = 'block';
            analogClock.style.display = 'none';
            // 상태 URL에 반영
            updateUrlParam('type', 'digital');
        });
        
        analogToggle.addEventListener('click', function() {
            analogToggle.classList.add('active');
            digitalToggle.classList.remove('active');
            analogClock.style.display = 'block';
            digitalClock.style.display = 'none';
            // 상태 URL에 반영
            updateUrlParam('type', 'analog');
        });
        
        // 시계 초기화 및 업데이트
        updateClock();
        updateAnalogClock();
        setInterval(updateClock, 1000);
        setInterval(updateAnalogClock, 1000);
        
        // 세계 시계 초기화 및 업데이트
        updateWorldClocks();
        setInterval(updateWorldClocks, 1000);
    }
});

// 디지털 시계 업데이트 함수
function updateClock() {
    const now = new Date();
    
    // 시간 업데이트
    const timeElement = document.getElementById('time');
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const seconds = padZero(now.getSeconds());
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    
    // 날짜 업데이트
    const dateElement = document.getElementById('date');
    const year = now.getFullYear();
    const month = padZero(now.getMonth() + 1);
    const day = padZero(now.getDate());
    dateElement.textContent = `${year}년 ${month}월 ${day}일`;
    
    // 요일 업데이트
    const dayElement = document.getElementById('day');
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[now.getDay()];
    dayElement.textContent = weekday;
}

// 아날로그 시계 업데이트 함수
function updateAnalogClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12; // 12시간제 변환
    
    // 시침, 분침, 초침 각도 계산 (0도가 12시 방향)
    const secondDegrees = (seconds / 60) * 360;
    const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
    const hourDegrees = ((hours + minutes / 60 + seconds / 3600) / 12) * 360;
    
    // 시계 바늘 회전 (CSS에서 12시 방향이 0도가 되도록 -90도 조정)
    const secondHand = document.querySelector('.second-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const hourHand = document.querySelector('.hour-hand');
    
    secondHand.style.transform = `rotate(${secondDegrees - 90}deg)`;
    minuteHand.style.transform = `rotate(${minuteDegrees - 90}deg)`;
    hourHand.style.transform = `rotate(${hourDegrees - 90}deg)`;
    
    // 아날로그 시계 날짜 및 요일 업데이트
    const analogDateElement = document.getElementById('analog-date');
    const analogDayElement = document.getElementById('analog-day');
    
    const year = now.getFullYear();
    const month = padZero(now.getMonth() + 1);
    const day = padZero(now.getDate());
    analogDateElement.textContent = `${year}년 ${month}월 ${day}일`;
    
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[now.getDay()];
    analogDayElement.textContent = weekday;
}

// URL 파라미터 업데이트 함수
function updateUrlParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

// 세계 시계 업데이트 함수
function updateWorldClocks() {
    // 타임존 매핑
    const timeZones = {
        'newyork': 'America/New_York',
        'london': 'Europe/London',
        'paris': 'Europe/Paris',
        'tokyo': 'Asia/Tokyo'
    };
    
    // 각 도시별 시간 업데이트
    for (const [city, timezone] of Object.entries(timeZones)) {
        const clockElement = document.querySelector(`#${city} .world-time`);
        if (clockElement) {
            clockElement.textContent = getTimeInTimeZone(timezone);
        }
    }
}

// 특정 시간대의 시간을 가져오는 함수
function getTimeInTimeZone(timezone) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone,
        hour12: false
    };
    
    return new Intl.DateTimeFormat('ko-KR', options).format(new Date());
}

// 숫자를 두 자리로 포맷팅하는 함수
function padZero(num) {
    return num.toString().padStart(2, '0');
} 