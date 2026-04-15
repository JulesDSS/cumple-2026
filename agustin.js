const screens = {
    level1: document.getElementById('level-1'),
    reveal: document.getElementById('reveal')
};

const brickStacks = document.querySelectorAll('.brick-stack');
const codeSlots = document.querySelectorAll('.code-slot');
const codeInputs = document.querySelectorAll('.code-input');
const clearCode = document.getElementById('clear-code');
const submitCode = document.getElementById('submit-code');
const codeLock = document.getElementById('code-lock');
const wrongBanner = document.getElementById('wrong-banner');
const playAgain = document.getElementById('play-again');

const correctCode = ['9', '1', '2'];

function showScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove('active'));
    screens[name].classList.add('active');
}

function resetLevel1() {
    brickStacks.forEach((stack) => stack.classList.remove('revealed'));
    document.querySelectorAll('.symbol').forEach((symbol) => symbol.classList.remove('found'));
}

function resetCode() {
    codeInputs.forEach((input) => {
        input.value = '';
    });
    codeSlots.forEach((slot) => {
        slot.dataset.filled = 'false';
    });
}

function getEnteredCode() {
    return Array.from(codeInputs).map((input) => input.value.trim()).join('');
}

function showWrong(message) {
    wrongBanner.textContent = message;
    wrongBanner.classList.remove('hidden');
    const lock = document.querySelector('.code-lock');
    lock.classList.add('shake');

    window.setTimeout(() => {
        wrongBanner.classList.add('hidden');
        lock.classList.remove('shake');
    }, 1200);
}

function launchConfetti() {
    if (typeof confetti !== 'function') return;

    const end = Date.now() + 2200;
    const colors = ['#e3000b', '#ffd500', '#0055bf', '#009b48'];

    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

codeInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        codeSlots[index].dataset.filled = input.value ? 'true' : 'false';
    });
});

brickStacks.forEach((stack) => {
    stack.querySelector('.brick').addEventListener('click', () => {
        stack.classList.add('revealed');
    });
});

clearCode.addEventListener('click', () => {
    brickStacks.forEach((stack) => stack.classList.remove('revealed'));
    resetCode();
});

submitCode.addEventListener('click', () => {
    if (getEnteredCode() === correctCode.join('')) {
        showScreen('reveal');
        launchConfetti();
        return;
    }

    showWrong('Codigo incorrecto. Sigue el orden de los símbolos.');
    resetCode();
});

playAgain.addEventListener('click', () => {
    resetLevel1();
    resetCode();
    wrongBanner.classList.add('hidden');
    showScreen('level1');
});

resetCode();
resetLevel1();
