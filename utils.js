/**
 * TimeGom 유틸리티 함수
 */

// 숫자를 두 자리로 포맷팅하는 함수
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 밀리초를 시:분:초 형식으로 변환
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

// 밀리초를 시:분:초:밀리초 형식으로 변환
function formatTimeWithMs(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10); // 밀리초의 앞 두 자리
    
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds)}`;
}

// 밀리초를 분:초 형식으로 변환
function formatTimeMinSec(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${padZero(minutes)}:${padZero(seconds)}`;
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

// 알림음 재생 함수
function playSound(type) {
    // 추후 사운드 기능 확장을 위한 준비
    const sounds = {
        'timer': 'sounds/timer-complete.mp3',
        'click': 'sounds/button-click.mp3',
        'lap': 'sounds/lap-record.mp3'
    };
    
    // 브라우저에서 오디오 재생 가능 여부 확인
    if ('Audio' in window) {
        try {
            const sound = new Audio(sounds[type] || sounds['click']);
            sound.play();
        } catch (error) {
            console.log('오디오 재생 실패:', error);
        }
    }
} 