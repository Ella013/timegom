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
    const hours24 = now.getHours();
    const minutes = padZero(now.getMinutes());
    const seconds = padZero(now.getSeconds());
    
    // 12시간제로 변경
    const hours12 = hours24 % 12 || 12; // 0시는 12시로 표시
    const ampm = hours24 < 12 ? '오전' : '오후';
    
    // 시간 형식: 9:31:07 형식
    timeElement.textContent = `${hours12}:${minutes}:${seconds}`;
    
    // 날짜 및 요일 업데이트
    const dateElement = document.getElementById('date');
    const year = now.getFullYear();
    const month = padZero(now.getMonth() + 1);
    const day = padZero(now.getDate());
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[now.getDay()];
    dateElement.textContent = `${year}년 ${month}월 ${day}일 ${weekday}`;
    
    // 요일 요소 숨기기
    const dayElement = document.getElementById('day');
    dayElement.style.display = 'none';
}

// 아날로그 시계 업데이트 함수
function updateAnalogClock() {
    const now = new Date();
    const hours = now.getHours() % 12; // 12시간제로 변환
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 각도 계산 (12시 방향이 0도, 시계 방향으로 회전)
    const hourDegrees = (hours * 30) + (minutes * 0.5); // 시침: 한 시간당 30도, 분당 추가 0.5도
    const minuteDegrees = minutes * 6; // 분침: 분당 6도
    const secondDegrees = seconds * 6; // 초침: 초당 6도

    // 바늘 회전 적용
    document.querySelector('.hour-hand').style.transform = `rotate(${hourDegrees}deg)`;
    document.querySelector('.minute-hand').style.transform = `rotate(${minuteDegrees}deg)`;
    document.querySelector('.second-hand').style.transform = `rotate(${secondDegrees}deg)`;
    
    // 아날로그 시계 날짜 표시 업데이트
    const analogDateElement = document.getElementById('analog-date');
    const analogDayElement = document.getElementById('analog-day');
    
    if (analogDateElement && analogDayElement) {
        // 날짜 및 요일 포맷팅
        const year = now.getFullYear();
        const month = padZero(now.getMonth() + 1);
        const day = padZero(now.getDate());
        const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const weekday = weekdays[now.getDay()];
        analogDateElement.textContent = `${year}년 ${month}월 ${day}일 ${weekday}`;
        
        // 요일 요소 숨기기
        analogDayElement.style.display = 'none';
    }
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
        hour12: true
    };
    
    return new Intl.DateTimeFormat('ko-KR', options).format(new Date());
}

// 숫자를 두 자리로 포맷팅하는 함수
function padZero(num) {
    return num.toString().padStart(2, '0');
} 