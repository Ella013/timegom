// 전역 변수로 interval 저장
let clockInterval;
let analogClockInterval;

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
            
            // 즉시 아날로그 시계 업데이트
            updateAnalogClock();
        });
        
        // 기존 인터벌 초기화
        clearInterval(clockInterval);
        clearInterval(analogClockInterval);
        
        // 시계 초기화 및 업데이트
        updateClock();
        updateAnalogClock();
        
        // 하나의 인터벌로 두 시계 모두 업데이트 (1초마다)
        clockInterval = setInterval(function() {
            updateClock();
            updateAnalogClock();
        }, 1000);
        
        // 세계 시계 초기화 및 업데이트
        updateWorldClocks();
        setInterval(updateWorldClocks, 1000);
        
        console.log('시계 초기화 완료');
    }
});

// 한국 표준시(KST)로 Date 객체 반환
function getKSTDate() {
    // 가장 단순한 방법: 현재 시간을 그대로 사용
    // 브라우저는 이미 사용자의 로컬 시간에 맞춰진 시간을 제공함
    return new Date();
}

// 디지털 시계 업데이트 함수
function updateClock() {
    try {
        const now = getKSTDate();
        
        // 시간 업데이트
        const timeElement = document.getElementById('time');
        if (!timeElement) return;
        
        const hours24 = now.getHours();
        const minutes = padZero(now.getMinutes());
        const seconds = padZero(now.getSeconds());
        
        // 12시간제로 변경
        const hours12 = hours24 % 12 || 12; // 0시는 12시로 표시
        const ampm = hours24 < 12 ? '오전' : '오후';
        
        // 시간 형식: 오전/오후를 시간 앞에 표시
        timeElement.innerHTML = `<span class="ampm">${ampm}</span> ${hours12}:${minutes}:${seconds}`;
        
        // 날짜 및 요일 업데이트
        const dateElement = document.getElementById('date');
        if (dateElement) {
            const year = now.getFullYear();
            const month = padZero(now.getMonth() + 1);
            const day = padZero(now.getDate());
            const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
            const weekday = weekdays[now.getDay()];
            dateElement.textContent = `${year}년 ${month}월 ${day}일 ${weekday}`;
        }
        
        // 요일 요소 숨기기 (날짜와 함께 표시하므로 별도의 요일 요소는 필요 없음)
        const dayElement = document.getElementById('day');
        if (dayElement) {
            dayElement.style.display = 'none';
        }
    } catch (error) {
        console.error('디지털 시계 업데이트 오류:', error);
    }
}

// 아날로그 시계 업데이트 함수
function updateAnalogClock() {
    try {
        // 현재 시간을 직접 가져옴
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // 시간 정보 콘솔 출력 (디버깅용)
        console.log(`현재 시간: ${hours}:${minutes}:${seconds}`);
        
        // 12시간제로 변환
        const hour12 = hours % 12;
        
        // 각 바늘의 각도를 명시적으로 재계산
        const hourAngle = hour12 * 30 + minutes * 0.5;
        const minuteAngle = minutes * 6;
        const secondAngle = seconds * 6;
        
        console.log(`회전 각도 - 시침: ${hourAngle}도, 분침: ${minuteAngle}도, 초침: ${secondAngle}도`);
        
        // DOM 요소 찾기 (아날로그 시계 컨테이너 내부에서만 찾음)
        const analogClock = document.getElementById('analogClock');
        if (analogClock) {
            const hourHand = analogClock.querySelector('.hour-hand');
            const minuteHand = analogClock.querySelector('.minute-hand');
            const secondHand = analogClock.querySelector('.second-hand');
            
            // 바늘 회전 적용 (인라인 스타일을 명시적으로 적용)
            if (hourHand) {
                hourHand.style.cssText = `transform: rotate(${hourAngle}deg); transform-origin: 0% 50%;`;
                console.log('시침 스타일 적용:', hourHand.style.cssText);
            } else {
                console.error('시침 요소를 찾을 수 없습니다.');
            }
            
            if (minuteHand) {
                minuteHand.style.cssText = `transform: rotate(${minuteAngle}deg); transform-origin: 0% 50%;`;
                console.log('분침 스타일 적용:', minuteHand.style.cssText);
            } else {
                console.error('분침 요소를 찾을 수 없습니다.');
            }
            
            if (secondHand) {
                secondHand.style.cssText = `transform: rotate(${secondAngle}deg); transform-origin: 0% 50%;`;
                console.log('초침 스타일 적용:', secondHand.style.cssText);
            } else {
                console.error('초침 요소를 찾을 수 없습니다.');
            }
        } else {
            console.error('아날로그 시계 컨테이너를 찾을 수 없습니다.');
        }
        
        // 날짜 표시 업데이트
        const analogDateElement = document.getElementById('analog-date');
        if (analogDateElement) {
            const year = now.getFullYear();
            const month = padZero(now.getMonth() + 1);
            const day = padZero(now.getDate());
            const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
            const weekday = weekdays[now.getDay()];
            analogDateElement.textContent = `${year}년 ${month}월 ${day}일 ${weekday}`;
        }
    } catch (error) {
        console.error('아날로그 시계 업데이트 오류:', error);
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
            clockElement.innerHTML = getTimeInTimeZone(timezone);
        }
    }
}

// 특정 시간대의 시간을 가져오는 함수
function getTimeInTimeZone(timezone) {
    // 현재 날짜 객체
    const now = new Date();
    
    // 목표 시간대의 날짜 객체 생성
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone,
        hour12: true
    };
    
    // 현재 로컬 날짜
    const localDate = now.getDate();
    
    // 해당 시간대의 날짜 정보 가져오기
    const tzOptions = {
        day: 'numeric',
        timeZone: timezone
    };
    const tzDate = parseInt(new Intl.DateTimeFormat('ko-KR', tzOptions).format(now).replace(/[^0-9]/g, ''));
    
    // 현재 로컬 날짜와 비교하여 오늘/어제 표시
    let datePrefix = '';
    if (tzDate < localDate) {
        datePrefix = '어제 ';
    } else if (tzDate > localDate) {
        datePrefix = '내일 ';
    } else {
        datePrefix = '오늘 ';
    }
    
    // 시간 정보 가져오기
    const timeString = new Intl.DateTimeFormat('ko-KR', options).format(now);
    
    // 최종 형식: "오늘 오전 10:30:45" 형태로 반환
    return `<span style="font-weight: 400;">${datePrefix}</span>${timeString}`;
}

// 숫자를 두 자리로 포맷팅하는 함수
function padZero(num) {
    return num.toString().padStart(2, '0');
} 