const screens = {
    intro: document.getElementById('intro'),
    level1: document.getElementById('level-1'),
    level2: document.getElementById('level-2'),
    reveal: document.getElementById('reveal')
};

const startGame = document.getElementById('start-game');
const brickStacks = document.querySelectorAll('.brick-stack');
const codeSlots = document.querySelectorAll('.code-slot');
const codeInputs = document.querySelectorAll('.code-input');
const clearCode = document.getElementById('clear-code');
const submitCode = document.getElementById('submit-code');
const codeLock = document.getElementById('code-lock');
const wrongBanner = document.getElementById('wrong-banner');
const memoryStart = document.getElementById('memory-start');
const memoryStage = document.querySelector('.memory-stage');
const memoryPads = Array.from(document.querySelectorAll('.memory-pad'));
const memoryHint = document.getElementById('memory-hint');
const memoryReplay = document.getElementById('memory-replay');
const playAgain = document.getElementById('play-again');

let correctCode = ['9', '1', '2'];
const clueStacks = Array.from(document.querySelectorAll('.brick-stack[data-kind="number"]'));
const memoryTones = ['red', 'blue', 'yellow', 'green'];
const memoryFlashMs = 650;
const memoryGapMs = 350;
const memoryFinishDelayMs = 700;

let memorySequence = [];
let memoryIndex = 0;
let memoryAccepting = false;
let memoryTimeouts = [];

function showScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove('active'));
    screens[name].classList.add('active');
}

function resetLevel1() {
    brickStacks.forEach((stack) => stack.classList.remove('revealed'));
    document.querySelectorAll('.symbol').forEach((symbol) => symbol.classList.remove('found'));
}

function shuffle(values) {
    const copy = [...values];

    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function randomizeFirstScreen() {
    const clues = shuffle([
        { value: '9', symbol: '✦' },
        { value: '1', symbol: '●' },
        { value: '2', symbol: '▲' }
    ]);

    clueStacks.forEach((stack, index) => {
        const clueValue = stack.querySelector('.clue-value');
        const clueSymbol = stack.querySelector('.clue-symbol');
        const clue = clues[index];

        stack.dataset.value = clue.value;
        stack.dataset.symbol = clue.symbol;
        clueValue.textContent = clue.value;
        clueSymbol.textContent = clue.symbol;
    });

    correctCode = ['✦', '●', '▲'].map((symbol) => clues.find((clue) => clue.symbol === symbol).value);
}

function resetMemoryPuzzle() {
    memoryTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    memoryTimeouts = [];
    memoryIndex = 0;
    memoryAccepting = false;
    memorySequence = [];
    memoryPads.forEach((pad) => pad.classList.remove('active', 'wrong'));
    memoryHint.textContent = 'Pulsa Iniciar para ver la secuencia.';
    memoryReplay.disabled = true;
    memoryStart.disabled = false;
    memoryStart.classList.remove('hidden');
    memoryStage.dataset.state = 'idle';
}

function buildMemorySequence() {
    const pool = [...memoryTones];
    const sequence = [];

    while (pool.length) {
        const index = Math.floor(Math.random() * pool.length);
        sequence.push(pool.splice(index, 1)[0]);
    }

    return sequence;
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
    }, 2500);
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

function flashPad(tone) {
    const pad = memoryPads.find((button) => button.dataset.tone === tone);
    if (!pad) return;

    pad.classList.add('active');
    memoryTimeouts.push(window.setTimeout(() => {
        pad.classList.remove('active');
    }, memoryFlashMs));
}

function playMemorySequence() {
    memoryTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    memoryTimeouts = [];
    memoryIndex = 0;
    memoryAccepting = false;
    if (!memorySequence.length) {
        memorySequence = buildMemorySequence();
    }
    memoryStage.dataset.state = 'playing';
    memoryStart.classList.add('hidden');
    memoryReplay.disabled = true;
    memoryHint.textContent = 'Mira con cuidado.';

    memorySequence.forEach((tone, index) => {
        const startAt = index * (memoryFlashMs + memoryGapMs);
        memoryTimeouts.push(window.setTimeout(() => flashPad(tone), startAt));
    });

    const readyAt = memorySequence.length * (memoryFlashMs + memoryGapMs);
    memoryTimeouts.push(window.setTimeout(() => {
        memoryAccepting = true;
        memoryHint.textContent = 'Ahora repitela tocando los colores.';
        memoryReplay.disabled = false;
    }, readyAt));
}

function failMemory() {
    memoryAccepting = false;
    memoryHint.textContent = 'Prueba otra vez.';
    memoryPads.forEach((pad) => pad.classList.add('wrong'));

    memoryTimeouts.push(window.setTimeout(() => {
        memoryPads.forEach((pad) => pad.classList.remove('wrong'));
        playMemorySequence();
    }, 900));
}

function handleMemoryTap(tone) {
    if (!memoryAccepting) return;

    const expectedTone = memorySequence[memoryIndex];
    const pad = memoryPads.find((button) => button.dataset.tone === tone);
    if (!pad) return;

    if (tone !== expectedTone) {
        failMemory();
        return;
    }

    pad.classList.add('active');
    window.setTimeout(() => pad.classList.remove('active'), 260);
    memoryIndex += 1;

    if (memoryIndex === memorySequence.length) {
        memoryAccepting = false;
        memoryHint.textContent = 'Perfecto!';
        window.setTimeout(() => {
            showScreen('reveal');
            launchConfetti();
        }, memoryFinishDelayMs);
        return;
    }

    memoryHint.textContent = `Bien. ${memoryIndex}/${memorySequence.length}`;
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
        showScreen('level2');
        resetMemoryPuzzle();
        return;
    }

    showWrong('Codigo incorrecto. Sigue el orden de los símbolos.');
    resetCode();
});

memoryPads.forEach((pad) => {
    pad.addEventListener('click', () => {
        handleMemoryTap(pad.dataset.tone);
    });
});

memoryReplay.addEventListener('click', () => {
    playMemorySequence();
});

memoryStart.addEventListener('click', () => {
    memorySequence = buildMemorySequence();
    playMemorySequence();
});

playAgain.addEventListener('click', () => {
    resetLevel1();
    resetCode();
    resetMemoryPuzzle();
    randomizeFirstScreen();
    wrongBanner.classList.add('hidden');
    showScreen('intro');
});

startGame.addEventListener('click', () => {
    showScreen('level1');
});

randomizeFirstScreen();
resetCode();
resetLevel1();
resetMemoryPuzzle();
