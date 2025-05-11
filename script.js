// 공통 함수 및 유틸리티
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로딩 시 실행될 코드
    console.log('TimeGom 애플리케이션이 로드되었습니다.');
    
    // 현재 페이지에 active 클래스 추가
    highlightCurrentPage();
});

// 현재 페이지의 메뉴 항목 강조
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// 숫자를 두 자리로 표시하는 함수 (예: 5 -> 05)
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 타임스탬프를 형식화된 시간 문자열로 변환 (HH:MM:SS)
function formatTime(timestamp) {
    const hours = Math.floor(timestamp / 3600000);
    const minutes = Math.floor((timestamp % 3600000) / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

// 타임스탬프를 분:초 형식으로 변환 (MM:SS)
function formatTimeMinSec(timestamp) {
    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    
    return `${padZero(minutes)}:${padZero(seconds)}`;
}

// 특정 시간대의 시간을 가져오는 함수
function getTimeInTimeZone(timezone) {
    return new Date().toLocaleTimeString('ko-KR', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// 오디오 효과 재생
function playSound(soundType) {
    // 추후 오디오 효과를 추가할 수 있음
    console.log(`${soundType} 소리를 재생합니다.`);
}

// 시계 기능
function updateClock() {
    const now = new Date();
    
    // 시간 표시
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // 날짜 표시
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
    };
    const dateString = now.toLocaleDateString('ko-KR', options);
    
    // 화면에 표시
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    
    if (clockElement) clockElement.textContent = timeString;
    if (dateElement) dateElement.textContent = dateString;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지 URL로 메뉴 활성화
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop() || 'index.html';
    
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === fileName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 시계 페이지인 경우 시계 업데이트 시작
    if (fileName === 'index.html' || fileName === '') {
        updateClock();
        setInterval(updateClock, 1000);
    }
}); 