/**
 * Songho - Local Game (PvP + VS Computer)
 * Handles all UI interactions for the local game mode.
 */
document.addEventListener('DOMContentLoaded', () => {

    // ─── State ────────────────────────────────────────────
    const game = new SongoCore();
    let isVsComputer = false;
    let isAnimating  = false;
    let playerNames  = { p1: "Joueur 1", p2: "Joueur 2" };

    // Detect URL param ?vs=computer
    if (new URLSearchParams(window.location.search).get('vs') === 'computer') {
        isVsComputer = true;
    }

    // ─── DOM References ───────────────────────────────────
    const holes          = document.querySelectorAll('.hole');
    const score0El       = document.getElementById('score0');
    const score1El       = document.getElementById('score1');
    const player0Card    = document.getElementById('player0-card');
    const player1Card    = document.getElementById('player1-card');
    const statusMsg      = document.getElementById('status-msg');
    const resetBtn       = document.getElementById('reset-btn');
    const modal          = document.getElementById('victory-modal');
    const winnerText     = document.getElementById('winner-text');
    const winnerScore    = document.getElementById('winner-score');
    const trophyIcon     = document.getElementById('trophy-icon');
    const historyList    = document.getElementById('history-list');
    const lastMoveDsp    = document.getElementById('last-move-display');
    const displayMode    = document.getElementById('display-mode');
    const displayCamp    = document.getElementById('display-camp');
    const displayTour    = document.getElementById('display-tour');
    const displayTotal   = document.getElementById('display-total');
    const vsPlayerBtn    = document.getElementById('vs-player-btn');
    const vsComputerBtn  = document.getElementById('vs-computer-btn');
    const modalRestart   = document.getElementById('modal-restart-btn');
    
    // Names Modal Elements
    const namesModal     = document.getElementById('names-modal');
    const p1NameInput    = document.getElementById('p1-name-input');
    const p2NameInput    = document.getElementById('p2-name-input');
    const startGameBtn   = document.getElementById('start-game-btn');
    const p1CardName     = player0Card.querySelector('.label-side:nth-of-type(2)');
    const p2CardName     = player1Card.querySelector('.label-side:nth-of-type(2)');

    // ─── Seed Dot Positions (for visual layout inside hole) ──
    const DOT_POSITIONS = [
        [],
        [{x:'50%',y:'50%'}],
        [{x:'35%',y:'50%'},{x:'65%',y:'50%'}],
        [{x:'50%',y:'25%'},{x:'30%',y:'68%'},{x:'70%',y:'68%'}],
        [{x:'30%',y:'30%'},{x:'70%',y:'30%'},{x:'30%',y:'68%'},{x:'70%',y:'68%'}],
        [{x:'50%',y:'20%'},{x:'25%',y:'43%'},{x:'75%',y:'43%'},{x:'35%',y:'72%'},{x:'65%',y:'72%'}],
        [{x:'25%',y:'25%'},{x:'75%',y:'25%'},{x:'25%',y:'50%'},{x:'75%',y:'50%'},{x:'25%',y:'75%'},{x:'75%',y:'75%'}],
    ];

    // ─── Render Seeds Visual Dots ─────────────────────────
    function renderSeedDots(holeEl, count) {
        const visual = holeEl.querySelector('.seeds-visual');
        if (!visual) return;
        visual.innerHTML = '';
        const positions = count <= 6 ? DOT_POSITIONS[count] : null;
        const renderCount = Math.min(count, 9);
        if (positions) {
            positions.forEach(pos => {
                const dot = document.createElement('div');
                dot.className = 'seed-dot';
                dot.style.left = pos.x;
                dot.style.top  = pos.y;
                dot.style.transform = 'translate(-50%,-50%)';
                visual.appendChild(dot);
            });
        } else {
            // Scatter layout for 7+
            for (let i = 0; i < renderCount; i++) {
                const dot = document.createElement('div');
                dot.className = 'seed-dot';
                const angle  = (i / renderCount) * Math.PI * 2;
                const radius = Math.random() * 25 + 15;
                dot.style.left = `calc(50% + ${Math.cos(angle) * radius}%)`;
                dot.style.top  = `calc(50% + ${Math.sin(angle) * radius}%)`;
                dot.style.transform = 'translate(-50%,-50%)';
                visual.appendChild(dot);
            }
        }
    }

    // ─── Update a Single Hole's Display ──────────────────
    function updateHoleDisplay(index, seedCount) {
        const hole = document.querySelector(`.hole[data-index="${index}"]`);
        if (!hole) return;
        hole.querySelector('.seed-count').textContent = seedCount;
        renderSeedDots(hole, seedCount);
    }

    // ─── Update Full UI ───────────────────────────────────
    function updateUI() {
        // Board
        game.board.forEach((seeds, index) => {
            updateHoleDisplay(index, seeds);
        });

        // Scores
        score0El.textContent = game.scores[0];
        score1El.textContent = game.scores[1];

        // Total
        const total = game.board.reduce((a,b)=>a+b,0);
        if (displayTotal) displayTotal.textContent = total;

        // Active turn highlighting
        const validMoves = game.status === 'playing' ? game.getValidMoves(game.turn) : [];
        holes.forEach(hole => {
            const idx = parseInt(hole.getAttribute('data-index'));
            const isMyTerritory = (game.turn === 0 && idx <= 6) || (game.turn === 1 && idx >= 7);
            hole.classList.remove('active-turn', 'valid-move', 'disabled-turn');
            if (game.status === 'playing') {
                if (isMyTerritory && validMoves.includes(idx)) {
                    hole.classList.add('active-turn');
                } else if (isMyTerritory && !validMoves.includes(idx)) {
                    hole.classList.add('disabled-turn');
                }
            }
        });

        // Player card highlights and names
        p1CardName.textContent = playerNames.p1;
        p2CardName.textContent = playerNames.p2;

        if (game.turn === 1) {
            player1Card.classList.add('active');
            player0Card.classList.remove('active');
            player0Card.style.removeProperty('border-color');
            player0Card.style.removeProperty('box-shadow');
        } else {
            player0Card.classList.add('active');
            player1Card.classList.remove('active');
            player1Card.style.removeProperty('border-color');
            player1Card.style.removeProperty('box-shadow');
        }

        // Status message
        const currentName = game.turn === 0 ? playerNames.p1 : playerNames.p2;
        if (game.status === 'playing') {
            if (isVsComputer && game.turn === 0) {
                statusMsg.textContent = 'L\'Ordinateur réfléchit...';
            } else {
                statusMsg.textContent = `Au tour de ${currentName}`;
            }
        }

        // Stat cards
        if (displayTour) displayTour.textContent = game.turn === 0 ? playerNames.p1 : playerNames.p2;
        if (displayCamp) displayCamp.textContent = isVsComputer ? `${playerNames.p2} (Vous)` : playerNames.p2;
        if (displayMode) displayMode.textContent = isVsComputer ? 'VS Ordinateur' : 'Joueur vs Joueur';

        // History
        historyList.innerHTML = '';
        const recent = [...game.log].reverse().slice(0, 12);
        recent.forEach((msg, i) => {
            const li = document.createElement('li');
            li.textContent = msg;
            historyList.appendChild(li);
        });

        // Last move
        if (game.log.length > 1) {
            const last = game.log[game.log.length - 1];
            lastMoveDsp.innerHTML = `<strong>${last}</strong>`;
        }

        // Victory modal
        if (game.status === 'finished' || game.status === 'draw') {
            showVictoryModal();
        }

    }

    // ─── Victory Modal ────────────────────────────────────
    function showVictoryModal() {
        modal.style.display = 'flex';
        if (game.status === 'draw') {
            trophyIcon.textContent = 'MATCH NUL';
            winnerText.textContent = 'Match Nul !';
        } else if (game.winner === 0) {
            trophyIcon.textContent = 'VICTOIRE';
            winnerText.textContent = isVsComputer ? 'L\'Ordinateur a gagné !' : `${playerNames.p1} Gagne !`;
        } else {
            trophyIcon.textContent = 'VICTOIRE';
            winnerText.textContent = isVsComputer ? `Félicitations ${playerNames.p2}, vous avez gagné !` : `${playerNames.p2} Gagne !`;
        }
        winnerScore.textContent = `${game.scores[0]} – ${game.scores[1]}`;
    }

    // ─── Handle Click on Hole ─────────────────────────────
    holes.forEach(hole => {
        hole.addEventListener('click', () => {
            if (isAnimating) return;
            if (isVsComputer && game.turn === 0) return; // Computer's turn
            const index = parseInt(hole.getAttribute('data-index'));
            handleMove(index, hole);
        });
    });

    async function handleMove(index, holeEl) {
        if (game.status !== 'playing' || isAnimating) return;

        const validMoves = game.getValidMoves(game.turn);
        if (!validMoves.includes(index)) {
            const isMyTerritory = (game.turn === 0 && index <= 6) || (game.turn === 1 && index >= 7);
            if (isMyTerritory) {
                holeEl.classList.add('shake');
                setTimeout(() => holeEl.classList.remove('shake'), 500);
                statusMsg.textContent = 'Coup invalide : solidarité obligatoire !';
            }
            return;
        }

        isAnimating = true;
        document.getElementById('board').style.pointerEvents = 'none';

        const seedsToSow   = game.board[index];
        const playerIndex  = game.turn;

        // Pick-up animation
        holeEl.classList.add('picking');
        await delay(600);
        holeEl.classList.remove('picking');

        // Execute core move
        const result = game.move(index);
        if (result.error) {
            isAnimating = false;
            document.getElementById('board').style.pointerEvents = 'auto';
            return;
        }

        // Sowing animation (step-by-step)
        const path = getPlayerPath(playerIndex);
        let currPathIdx = path.indexOf(index);
        let distributed = 0;

        // Visually empty start hole
        updateHoleDisplay(index, 0);

        while (distributed < seedsToSow) {
            currPathIdx = (currPathIdx + 1) % 14;
            const bIdx = path[currPathIdx];
            if (bIdx === index) continue;

            // Skip own territory for seeds > 13 after first lap
            if (seedsToSow > 13 && distributed >= 13 && ((playerIndex === 0 && bIdx <= 6) || (playerIndex === 1 && bIdx >= 7))) {
                continue;
            }

            distributed++;

            const targetHole = document.querySelector(`.hole[data-index="${bIdx}"]`);
            if (targetHole) {
                targetHole.classList.add('sowing');
                // Update the count incrementally (add 1 each step)
                const currentDisplay = parseInt(targetHole.querySelector('.seed-count').textContent) || 0;
                targetHole.querySelector('.seed-count').textContent = currentDisplay + 1;
                await delay(800);
                targetHole.classList.remove('sowing');
            }
        }

        // Final board sync from actual game state
        document.getElementById('board').style.pointerEvents = 'auto';
        isAnimating = false;  // must be false BEFORE updateUI
        updateUI();

        // Schedule computer move AFTER animation ends and isAnimating is false
        if (game.status === 'playing' && isVsComputer && game.turn === 0) {
            setTimeout(executeComputerMove, 1200);
        }
    }

    // ─── Computer AI ──────────────────────────────────────
    async function executeComputerMove() {
        if (game.status !== 'playing' || game.turn !== 0 || isAnimating) return;
        const best = getBestMove(0);
        if (best === null) return;
        const holeEl = document.querySelector(`.hole[data-index="${best}"]`);
        await handleMove(best, holeEl);
    }

    function getBestMove(playerIndex) {
        const validMoves = game.getValidMoves(playerIndex);
        if (!validMoves.length) return null;

        let bestScore = -Infinity;
        let bestMoves = [];

        validMoves.forEach(i => {
            const tmp = new SongoCore();
            tmp.board  = [...game.board];
            tmp.scores = [...game.scores];
            tmp.turn   = playerIndex;
            tmp.status = 'playing';
            tmp.log    = [];
            const res = tmp.move(i);
            if (!res.error) {
                const gain = tmp.scores[playerIndex] - game.scores[playerIndex];
                if (gain > bestScore) { bestScore = gain; bestMoves = [i]; }
                else if (gain === bestScore) bestMoves.push(i);
            }
        });

        if (!bestMoves.length) return validMoves[0];
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    // ─── Helpers ──────────────────────────────────────────
    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    function getPlayerPath(playerIndex) {
        return playerIndex === 0
            ? [0,1,2,3,4,5,6,7,8,9,10,11,12,13]
            : [13,12,11,10,9,8,7,6,5,4,3,2,1,0];
    }

    // ─── Start Game Logic ────────────────────────────────
    startGameBtn.addEventListener('click', () => {
        const p1 = p1NameInput.value.trim();
        const p2 = p2NameInput.value.trim();
        
        playerNames.p1 = p1 || (isVsComputer ? "Ordinateur" : "Joueur 1");
        playerNames.p2 = p2 || "Joueur 2";
        
        namesModal.style.display = 'none';
        updateUI();
    });

    // ─── Buttons ──────────────────────────────────────────
    vsPlayerBtn.addEventListener('click', () => {
        isVsComputer = false;
        vsPlayerBtn.classList.add('active');
        vsComputerBtn.classList.remove('active');
        p1NameInput.placeholder = "Nom Joueur 1 (NORD)";
        p2NameInput.placeholder = "Nom Joueur 2 (SUD)";
        p1NameInput.parentElement.style.display = 'flex';
        namesModal.style.display = 'flex';
        game.reset(); game.board.fill(4);
        updateUI();
    });

    vsComputerBtn.addEventListener('click', () => {
        isVsComputer = true;
        vsComputerBtn.classList.add('active');
        vsPlayerBtn.classList.remove('active');
        p1NameInput.parentElement.style.display = 'flex'; // Optional: hide p1 input for CPU
        p1NameInput.value = "Ordinateur";
        p2NameInput.placeholder = "Votre Nom (SUD)";
        namesModal.style.display = 'flex';
        game.reset(); game.board.fill(4);
        game.turn = 1; // Player is South, starts first
        updateUI();
    });

    resetBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        game.reset(); game.board.fill(4);
        if (isVsComputer) game.turn = 1;
        updateUI();
    });

    if (modalRestart) {
        modalRestart.addEventListener('click', () => {
            modal.style.display = 'none';
            game.reset(); game.board.fill(4);
            if (isVsComputer) game.turn = 1;
            updateUI();
        });
    }

    // ─── Init ─────────────────────────────────────────────
    // Initial State Check
    if (isVsComputer) {
        vsComputerBtn.classList.add('active');
        vsPlayerBtn.classList.remove('active');
        p1NameInput.value = "Ordinateur";
        p2NameInput.placeholder = "Votre Nom (SUD)";
    }
    
    namesModal.style.display = 'flex';
    game.reset(); game.board.fill(4);
    if (isVsComputer) game.turn = 1;
    updateUI();
});
