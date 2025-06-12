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
    const now = new Date();
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    return now.toLocaleTimeString('en-US', {
        ...options,
        timeZone: timezone
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
    
    // Time display in 12-hour format with AM/PM
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
    
    // Date display in English format (e.g., "Monday, January 1, 2024")
    const options = { 
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    };
    const dateString = now.toLocaleDateString('en-US', options);
    
    // Update display
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

// Language dropdown toggle
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.language-selector')) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Language change function
function changeLanguage(lang) {
    const selectedFlag = document.getElementById('selectedFlag');
    const selectedText = document.querySelector('.selected-text');
    const dropdown = document.getElementById('languageDropdown');
    
    // Update selected language display
    selectedFlag.className = '';
    selectedFlag.classList.add('fi', `fi-${lang}`);
    
    // Update selected text
    const selectedOption = document.querySelector(`.language-option[onclick*="'${lang}'"]`);
    if (selectedOption) {
        selectedText.textContent = selectedOption.querySelector('span:last-child').textContent;
    }
    
    // Hide dropdown
    dropdown.classList.remove('show');
    
    // Get current page name (e.g., 'index.html', 'timer.html', etc.)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Redirect to the appropriate language version
    if (lang === 'gb') {
        window.location.href = currentPage;
    } else {
        window.location.href = `/${lang}/${currentPage}`;
    }
}

// Set initial language based on current path
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const match = path.match(/\/([a-z]{2})\//);
    if (match) {
        const lang = match[1];
        const selectedFlag = document.getElementById('selectedFlag');
        const selectedText = document.querySelector('.selected-text');
        const selectedOption = document.querySelector(`.language-option[onclick*="'${lang}'"]`);
        
        if (selectedFlag && selectedText && selectedOption) {
            selectedFlag.className = '';
            selectedFlag.classList.add('fi', `fi-${lang}`);
            selectedText.textContent = selectedOption.querySelector('span:last-child').textContent;
        }
    }
});

// World Map Time functionality
document.addEventListener('DOMContentLoaded', function() {
    const cityTimeDisplay = document.getElementById('cityTimeDisplay');
    const mouseTooltip = document.getElementById('mouseTooltip');
    const pinnedCities = document.getElementById('pinnedCities');
    const markers = document.querySelectorAll('.map-marker');
    const resetButton = document.querySelector('.reset-button');
    
    // City flags mapping
    const cityData = {
        'New York': { flag: 'fi-us' },
        'Los Angeles': { flag: 'fi-us' },
        'Toronto': { flag: 'fi-ca' },
        'Mexico City': { flag: 'fi-mx' },
        'São Paulo': { flag: 'fi-br' },
        'London': { flag: 'fi-gb' },
        'Paris': { flag: 'fi-fr' },
        'Berlin': { flag: 'fi-de' },
        'Rome': { flag: 'fi-it' },
        'Moscow': { flag: 'fi-ru' },
        'Dubai': { flag: 'fi-ae' },
        'Mumbai': { flag: 'fi-in' },
        'Bangkok': { flag: 'fi-th' },
        'Singapore': { flag: 'fi-sg' },
        'Beijing': { flag: 'fi-cn' },
        'Shanghai': { flag: 'fi-cn' },
        'Tokyo': { flag: 'fi-jp' },
        'Seoul': { flag: 'fi-kr' },
        'Sydney': { flag: 'fi-au' },
        'Auckland': { flag: 'fi-nz' }
    };
    
    // Calculate time difference between two cities
    function getTimeDifference(timezone1, timezone2) {
        const now = new Date();
        const time1 = new Date(now.toLocaleString('en-US', { timeZone: timezone1 }));
        const time2 = new Date(now.toLocaleString('en-US', { timeZone: timezone2 }));
        const diffHours = (time1 - time2) / (1000 * 60 * 60);
        
        if (diffHours === 0) return 'Same time';
        const ahead = diffHours > 0;
        const hours = Math.abs(diffHours);
        return `${ahead ? 'Ahead' : 'Behind'} by ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    // Update time for a specific city
    function updateCityTime(city, timezone) {
        const now = new Date();
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        return now.toLocaleTimeString('en-US', options);
    }

    // Create pinned city element
    function createPinnedCity(city, timezone) {
        const pinnedCity = document.createElement('div');
        pinnedCity.className = 'city-time-display';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-pin';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => {
            clearInterval(Number(pinnedCity.dataset.intervalId));
            pinnedCity.remove();
            updatePinnedCitiesLayout();
        };
        
        pinnedCity.innerHTML = `
            <span class="city-icon"></span>
            <span class="city-name">${city}</span>
            <span class="fi ${cityData[city].flag}"></span>
            <span class="city-time">${updateCityTime(city, timezone)}</span>
            <div class="time-difference"></div>
        `;
        
        pinnedCity.appendChild(closeButton);
        
        // Update time every second
        const intervalId = setInterval(() => {
            pinnedCity.querySelector('.city-time').textContent = updateCityTime(city, timezone);
            updateTimeDifferences();
        }, 1000);
        
        // Store interval ID and timezone for cleanup and time difference calculation
        pinnedCity.dataset.intervalId = intervalId;
        pinnedCity.dataset.timezone = timezone;
        
        return pinnedCity;
    }
    
    // Update layout and time differences for pinned cities
    function updatePinnedCitiesLayout() {
        const pinnedCitiesArray = Array.from(pinnedCities.children);
        const worldMapSection = document.querySelector('.world-map-time');
        
        // Toggle the has-pinned class based on whether there are any pinned cities
        worldMapSection.classList.toggle('has-pinned', pinnedCitiesArray.length > 0);
        
        // Update time differences if there are exactly 2 cities
        if (pinnedCitiesArray.length === 2) {
            const [city1, city2] = pinnedCitiesArray;
            const diff = getTimeDifference(city1.dataset.timezone, city2.dataset.timezone);
            city1.querySelector('.time-difference').textContent = diff;
            city2.querySelector('.time-difference').textContent = getTimeDifference(city2.dataset.timezone, city1.dataset.timezone);
        } else {
            pinnedCitiesArray.forEach(city => {
                city.querySelector('.time-difference').textContent = '';
            });
        }
    }
    
    // Update time differences between pinned cities
    function updateTimeDifferences() {
        const pinnedCitiesArray = Array.from(pinnedCities.children);
        if (pinnedCitiesArray.length === 2) {
            const [city1, city2] = pinnedCitiesArray;
            const diff = getTimeDifference(city1.dataset.timezone, city2.dataset.timezone);
            city1.querySelector('.time-difference').textContent = diff;
            city2.querySelector('.time-difference').textContent = getTimeDifference(city2.dataset.timezone, city1.dataset.timezone);
        } else {
            pinnedCitiesArray.forEach(city => {
                city.querySelector('.time-difference').textContent = '';
            });
        }
    }
    
    // Handle marker hover and click
    markers.forEach(marker => {
        marker.addEventListener('mouseenter', function(e) {
            const city = this.dataset.city;
            const timezone = this.dataset.timezone;
            const time = updateCityTime(city, timezone);
            
            mouseTooltip.innerHTML = `${city}<br>${time}`;
            mouseTooltip.style.display = 'block';
            
            cityTimeDisplay.querySelector('.city-icon').textContent = '';
            cityTimeDisplay.querySelector('.city-name').textContent = city;
            cityTimeDisplay.querySelector('.fi').className = `fi ${cityData[city].flag}`;
            cityTimeDisplay.querySelector('.city-time').textContent = time;
            cityTimeDisplay.classList.add('show');
            
            this.dataset.intervalId = setInterval(() => {
                const updatedTime = updateCityTime(city, timezone);
                cityTimeDisplay.querySelector('.city-time').textContent = updatedTime;
                mouseTooltip.innerHTML = `${city}<br>${updatedTime}`;
            }, 1000);
        });
        
        marker.addEventListener('mousemove', function(e) {
            mouseTooltip.style.left = (e.pageX + 15) + 'px';
            mouseTooltip.style.top = (e.pageY + 15) + 'px';
        });
        
        marker.addEventListener('mouseleave', function() {
            mouseTooltip.style.display = 'none';
            cityTimeDisplay.classList.remove('show');
            clearInterval(Number(this.dataset.intervalId));
        });
        
        marker.addEventListener('click', function() {
            const city = this.dataset.city;
            const timezone = this.dataset.timezone;
            
            if (pinnedCities.children.length < 2) {
                const existingPin = Array.from(pinnedCities.children).find(
                    pin => pin.querySelector('.city-name').textContent === city
                );
                
                if (!existingPin) {
                    const pinnedCity = createPinnedCity(city, timezone);
                    pinnedCities.appendChild(pinnedCity);
                    updatePinnedCitiesLayout();
                }
            }
        });
    });
    
    // Reset button functionality
    resetButton.addEventListener('click', () => {
        Array.from(pinnedCities.children).forEach(pin => {
            clearInterval(Number(pin.dataset.intervalId));
        });
        pinnedCities.innerHTML = '';
    });
    
    // Cleanup intervals when leaving the page
    window.addEventListener('beforeunload', () => {
        Array.from(pinnedCities.children).forEach(pin => {
            clearInterval(Number(pin.dataset.intervalId));
        });
    });
}); 