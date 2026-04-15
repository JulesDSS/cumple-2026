// Game State
const state = {
    level: 1,
    locked: false
};

// DOM Elements
const flashlight = document.getElementById('flashlight');
const level1 = document.getElementById('level-1');
const level2 = document.getElementById('level-2');
const reveal = document.getElementById('reveal');
const lockout = document.getElementById('lockout');
const timer = document.getElementById('timer');
const errorModal = document.getElementById('error-modal');
const doors = document.querySelectorAll('.door');
const continueBtn = document.getElementById('continue-btn');

// Flashlight Effect (Level 1)
function initFlashlight() {
    console.log("Initializing flashlight...");
    
    function updateFlashlight(x, y) {
        flashlight.style.webkitMaskImage = `radial-gradient(circle 80px at ${x}px ${y}px, transparent 100%, black 100%)`;
        flashlight.style.maskImage = `radial-gradient(circle 80px at ${x}px ${y}px, transparent 100%, black 100%)`;
    }
    
    // Touch events
    level1.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        updateFlashlight(touch.clientX, touch.clientY);
        checkSymbolDiscovery(touch.clientX, touch.clientY);
    }, { passive: false });
    
    // Mouse events
    level1.addEventListener('mousemove', (e) => {
        updateFlashlight(e.clientX, e.clientY);
        checkSymbolDiscovery(e.clientX, e.clientY);
    });
    
    // Initial position
    updateFlashlight(window.innerWidth / 2, window.innerHeight / 2);
    console.log("Flashlight ready!");
}

// Track current expected symbol order
let currentOrder = 1;
let lastFoundTime = 0;
const COOLDOWN_MS = 1000;

// Auto-detect when flashlight reveals symbols (in correct order)
function checkSymbolDiscovery(mouseX, mouseY) {
    const now = Date.now();
    
    if (currentOrder > 3) return;
    if (now - lastFoundTime < COOLDOWN_MS) return;
    
    const symbol = document.querySelector(`.symbol[data-order="${currentOrder}"]`);
    if (!symbol || symbol.classList.contains('found')) return;
    
    const rect = symbol.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
    
    console.log(`Checking symbol ${currentOrder}, dist: ${distance.toFixed(0)}`);
    
    if (distance < 50) {
        symbol.classList.add('found');
        lastFoundTime = now;
        console.log(`FOUND symbol ${currentOrder}!`);
        
        currentOrder++;
        
        if (currentOrder > 3) {
            console.log("All 3 found! Show continue button...");
            continueBtn.classList.add('visible');
        }
    }
}

// Transition to Level 2
function goToLevel2() {
    level1.classList.remove('active');
    level2.classList.add('active');
    state.level = 2;
}

// Door Click Handler (Level 2)
function handleDoorClick(doorNum) {
    if (state.locked) return;

    if (doorNum === 2) {
        level2.classList.remove('active');
        reveal.classList.add('active');
        state.level = 3;
        launchConfetti();
    } else {
        const clickedDoor = document.querySelector(`[data-door="${doorNum}"]`);
        clickedDoor.classList.add('wrong');
        showErrorModal();
        startLockout();
    }
}

// Show error modal briefly
function showErrorModal() {
    errorModal.classList.add('active');
    setTimeout(() => {
        errorModal.classList.remove('active');
    }, 1500);
}

// Lockout timer
function startLockout() {
    state.locked = true;
    lockout.classList.add('active');
    
    let timeLeft = 10;
    timer.textContent = timeLeft;
    
    const interval = setInterval(() => {
        timeLeft--;
        timer.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            lockout.classList.remove('active');
            state.locked = false;
            doors.forEach(d => d.classList.remove('wrong'));
        }
    }, 1000);
}

// Confetti effect
function launchConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ffd700', '#e94560', '#00d2d3', '#ff9f43']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffd700', '#e94560', '#00d2d3', '#ff9f43']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initFlashlight();

    continueBtn.addEventListener('click', goToLevel2);

    doors.forEach(door => {
        door.addEventListener('click', () => {
            const doorNum = parseInt(door.dataset.door);
            handleDoorClick(doorNum);
        });
    });
});