// 시계 기능
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('clock')) {
        // 시계 초기화 및 업데이트
        updateClock();
        setInterval(updateClock, 1000);
        
        // 세계 시계 초기화 및 업데이트
        updateWorldClocks();
        setInterval(updateWorldClocks, 1000);
    }
});

// 시계 업데이트 함수
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