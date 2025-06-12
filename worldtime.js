// 도시별 UTC 시차 정보
const cityTimezones = {
    'seoul': 9,      // KST
    'tokyo': 9,      // JST
    'hong-kong': 8,  // HKT
    'singapore': 8,  // SGT
    'bangkok': 7,    // ICT
    'delhi': 5.5,    // IST
    'dubai': 4,      // GST
    'moscow': 3,     // MSK
    'istanbul': 3,   // TRT
    'cairo': 2,      // EET
    'paris': 2,      // CEST
    'berlin': 2,     // CEST
    'rome': 2,       // CEST
    'london': 1,     // BST
    'sao-paulo': -3, // BRT
    'new-york': -4,  // EDT
    'toronto': -4,   // EDT
    'chicago': -5,   // CDT
    'los-angeles': -7, // PDT
    'vancouver': -7,  // PDT
    'sydney': 10,    // AEST
    'melbourne': 10, // AEST
    'auckland': 12,  // NZST
    'tel-aviv': 3    // IDT
};

// 세계 시간 업데이트 함수
function updateWorldTime() {
    const timeElements = document.querySelectorAll('.world-time');
    const now = new Date();
    
    // Update time for each city
    timeElements.forEach(element => {
        const cityId = element.parentElement.id;
        let timezone = '';
        
        switch(cityId) {
            case 'newyork':
                timezone = 'America/New_York';
                break;
            case 'london':
                timezone = 'Europe/London';
                break;
            case 'paris':
                timezone = 'Europe/Paris';
                break;
            case 'tokyo':
                timezone = 'Asia/Tokyo';
                break;
        }
        
        if (timezone) {
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            element.textContent = now.toLocaleTimeString('en-US', {
                ...options,
                timeZone: timezone
            });
        }
    });
}

// Start updating world time
document.addEventListener('DOMContentLoaded', function() {
    updateWorldTime();
    setInterval(updateWorldTime, 1000);
}); 