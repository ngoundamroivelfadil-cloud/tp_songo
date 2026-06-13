/**
 * Songho - Remote Game (Online Multiplayer via PHP/AJAX polling)
 */
document.addEventListener('DOMContentLoaded', () => {

    // ─── State ────────────────────────────────────────────
    const game       = new SongoCore();
    let playerRole   = null; // 0 = Nord, 1 = Sud
    let gameKey      = '';
    let pollingId    = null;
    let lastTurnSeen = -1;
    let isAnimating  = false;

    // ─── DOM ──────────────────────────────────────────────
    const setupScreen  = document.getElementById('setup-screen');
    const gameScreen   = document.getElementById('game-screen');
    const displayKey   = document.getElementById('display-key');
    const displayPly   = document.getElementById('display-player');
    const remoteStatus = document.getElementById('remote-status');
    const connDot      = document.getElementById('conn-dot');
    const remoteHint   = document.getElementById('remote-hint');
    const holes        = document.querySelectorAll('.hole');
    const statusMsg    = document.getElementById('status-msg');
    const score0El     = document.getElementById('score0');
    const score1El     = document.getElementById('score1');
    const player0Card  = document.getElementById('player0-card');
    const player1Card  = document.getElementById('player1-card');
    const modal        = document.getElementById('victory-modal');
    const winnerText   = document.getElementById('winner-text');
    const winnerScore  = document.getElementById('winner-score');
    const trophyIcon   = document.getElementById('trophy-icon');
    const historyList  = document.getElementById('history-list');

    // ─── Server Status Check ──────────────────────────────
    async function checkServerStatus() {
        try {
            const data = await apiCall('ping');
            if (data.pong) {
                document.getElementById('server-dot').className = 'status-dot online';
                document.getElementById('server-status-text').textContent = 'Serveur connecté';
            }
        } catch(e) {
            document.getElementById('server-dot').className = 'status-dot';
            document.getElementById('server-status-text').textContent = 'Serveur non disponible (mode local uniquement)';
        }
    }
    checkServerStatus();

    // ─── API ──────────────────────────────────────────────
    async function apiCall(action, params={}, method='GET', body=null) {
        const base = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        const url  = new URL('server/game_api.php', window.location.origin + base);
        url.searchParams.append('action', action);
        for (const [k,v] of Object.entries(params)) url.searchParams.append(k, v);

        const opts = { method };
        if (body) {
            opts.headers = { 'Content-Type': 'application/json' };
            opts.body = JSON.stringify(body);
        }

        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        try { return JSON.parse(txt); }
        catch(e) { throw new Error('Réponse serveur invalide'); }
    }

    // ─── Create / Join ────────────────────────────────────
    async function createGame() {
        const btn = document.getElementById('btn-create');
        btn.textContent = '⏳ Création...';
        try {
            const data = await apiCall('create');
            if (data && data.success) {
                gameKey    = data.game_key;
                playerRole = data.player_role; // 1 = Sud = creator starts
                enterGame();
                showShareAlert(gameKey);
            } else {
                alert('Erreur serveur : ' + (data.error || 'Réponse invalide'));
            }
        } catch(e) {
            alert('Connexion impossible : ' + e.message + '\n\nVérifiez que XAMPP / le serveur PHP est actif.');
        } finally {
            btn.disabled = false;
            btn.textContent = '✚ Créer une partie';
        }
    }

    async function joinGame() {
        const key = document.getElementById('input-key').value.trim().toLowerCase();
        if (!key) return alert('Veuillez entrer une clé de partie');
        const btn = document.getElementById('btn-join');
        btn.disabled = true;
        btn.textContent = '⏳ Connexion...';
        try {
            const data = await apiCall('join', { key });
            if (data && data.success) {
                gameKey    = key;
                playerRole = data.player_role; // 0 = Nord = joiner
                enterGame();
            } else {
                alert('Erreur : ' + (data.error || 'Clé invalide ou partie introuvable'));
            }
        } catch(e) {
            alert('Connexion impossible : ' + e.message);
        } finally {
            btn.disabled = false;
            btn.textContent = '→ Rejoindre';
        }
    }

    function enterGame() {
        setupScreen.style.display = 'none';
        gameScreen.style.display  = 'block';
        displayKey.textContent    = gameKey.toUpperCase();
        displayPly.textContent    = playerRole === 0 ? 'Vous êtes NORD (J1)' : 'Vous êtes SUD (J2)';
        remoteHint.textContent    = playerRole === 1
            ? 'Vous êtes créateur. Attendez que l\'adversaire rejoigne.'
            : 'Vous avez rejoint la partie. Bonne chance !';
        updateUI();
        startPolling();
    }

    function showShareAlert(key) {
        const link = `${window.location.origin}${window.location.pathname}?key=${key}`;
        const msg  = `Partie créée ! Clé : ${key.toUpperCase()}\n\nPartagez cette clé à votre adversaire.`;
        alert(msg);
    }

    // ─── Polling ──────────────────────────────────────────
    function startPolling() {
        if (pollingId) return;
        pollingId = setInterval(pollState, 2000);
    }

    async function pollState() {
        if (!gameKey) return;
        try {
            const data = await apiCall('get_state', { key: gameKey });
            if (!data.success) return;

            connDot.className   = 'status-dot online';
            remoteStatus.textContent = 'Connecté';

            const remote = data.game;
            const remoteTurn = parseInt(remote.current_turn);

            if (remote.status === 'waiting') {
                statusMsg.textContent = 'En attente de l\'adversaire...';
                connDot.className = 'status-dot waiting';
                remoteStatus.textContent = 'Attente adversaire';
                return;
            }

            // Sync if state changed
            if (remoteTurn !== lastTurnSeen || remote.status !== game.status) {
                lastTurnSeen = remoteTurn;
                game.board   = JSON.parse(remote.board_state);
                game.scores  = [parseInt(remote.p1_score), parseInt(remote.p2_score)];
                game.turn    = remoteTurn;
                game.status  = remote.status;
                game.winner  = remote.winner !== null ? parseInt(remote.winner) : null;
                updateUI();
            }

        } catch(e) {
            connDot.className = 'status-dot';
            remoteStatus.textContent = 'Déconnecté';
        }
    }

    async function pushMove() {
        await apiCall('move', {}, 'POST', {
            key:        gameKey,
            boardState: game.board,
            scores:     game.scores,
            turn:       game.turn,
            status:     game.status,
            winner:     game.winner
        });
    }

    // ─── Seed Dots (same as local) ────────────────────────
    const DOT_POSITIONS = [
        [],
        [{x:'50%',y:'50%'}],
        [{x:'35%',y:'50%'},{x:'65%',y:'50%'}],
        [{x:'50%',y:'25%'},{x:'30%',y:'68%'},{x:'70%',y:'68%'}],
        [{x:'30%',y:'30%'},{x:'70%',y:'30%'},{x:'30%',y:'68%'},{x:'70%',y:'68%'}],
        [{x:'50%',y:'20%'},{x:'25%',y:'43%'},{x:'75%',y:'43%'},{x:'35%',y:'72%'},{x:'65%',y:'72%'}],
        [{x:'25%',y:'25%'},{x:'75%',y:'25%'},{x:'25%',y:'50%'},{x:'75%',y:'50%'},{x:'25%',y:'75%'},{x:'75%',y:'75%'}],
    ];

    function renderSeedDots(holeEl, count) {
        const visual = holeEl.querySelector('.seeds-visual');
        if (!visual) return;
        visual.innerHTML = '';
        const positions = count <= 6 ? DOT_POSITIONS[count] : null;
        const n = Math.min(count, 9);
        if (positions) {
            positions.forEach(pos => {
                const d = document.createElement('div');
                d.className = 'seed-dot';
                d.style.left = pos.x; d.style.top = pos.y;
                d.style.transform = 'translate(-50%,-50%)';
                visual.appendChild(d);
            });
        } else {
            for (let i = 0; i < n; i++) {
                const d = document.createElement('div');
                d.className = 'seed-dot';
                const angle = (i/n) * Math.PI * 2;
                d.style.left = `calc(50% + ${Math.cos(angle)*25}%)`;
                d.style.top  = `calc(50% + ${Math.sin(angle)*25}%)`;
                d.style.transform = 'translate(-50%,-50%)';
                visual.appendChild(d);
            }
        }
    }

    // ─── Update UI ────────────────────────────────────────
    function updateUI() {
        game.board.forEach((seeds, idx) => {
            const h = document.querySelector(`.hole[data-index="${idx}"]`);
            if (!h) return;
            h.querySelector('.seed-count').textContent = seeds;
            renderSeedDots(h, seeds);
        });

        score0El.textContent = game.scores[0];
        score1El.textContent = game.scores[1];

        const validMoves = game.status === 'playing' ? game.getValidMoves(game.turn) : [];
        const isMyTurn   = game.turn === playerRole;

        holes.forEach(hole => {
            const idx = parseInt(hole.getAttribute('data-index'));
            const isMyTerritory = (playerRole === 0 && idx <= 6) || (playerRole === 1 && idx >= 7);
            hole.classList.remove('active-turn','valid-move','disabled-turn');
            if (game.status === 'playing') {
                if (isMyTurn && isMyTerritory && validMoves.includes(idx)) {
                    hole.classList.add('active-turn');
                } else if (!isMyTurn || !isMyTerritory) {
                    hole.classList.remove('active-turn');
                }
            }
            hole.style.cursor = (isMyTurn && isMyTerritory && validMoves.includes(idx)) ? 'pointer' : 'default';
        });

        if (game.turn === 0) {
            player0Card.classList.add('active');
            player1Card.classList.remove('active');
        } else {
            player1Card.classList.add('active');
            player0Card.classList.remove('active');
        }

        if (game.status === 'playing') {
            const tourNom = game.turn === 0 ? 'NORD (J1)' : 'SUD (J2)';
            statusMsg.textContent = isMyTurn ? `C'est votre tour !` : `Au tour de ${tourNom}...`;
        }

        // History
        historyList.innerHTML = '';
        [...game.log].reverse().slice(0, 10).forEach(msg => {
            const li = document.createElement('li');
            li.textContent = msg;
            historyList.appendChild(li);
        });

        if (game.status === 'finished' || game.status === 'draw') {
            clearInterval(pollingId);
            modal.style.display = 'flex';
            if (game.status === 'draw') {
                trophyIcon.textContent = 'MATCH NUL';
                winnerText.textContent = 'Match Nul !';
            } else if (game.winner === playerRole) {
                trophyIcon.textContent = 'VICTOIRE';
                winnerText.textContent = 'Vous avez gagné !';
            } else {
                trophyIcon.textContent = 'DEFAITE';
                winnerText.textContent = 'Vous avez perdu...';
            }
            winnerScore.textContent = `${game.scores[0]} – ${game.scores[1]}`;
        }
    }

    // ─── Click Handler ────────────────────────────────────
    holes.forEach(hole => {
        hole.addEventListener('click', async () => {
            if (game.turn !== playerRole || game.status !== 'playing' || isAnimating) return;
            const idx = parseInt(hole.getAttribute('data-index'));
            const isMyTerritory = (playerRole === 0 && idx <= 6) || (playerRole === 1 && idx >= 7);
            if (!isMyTerritory) return;

            const validMoves = game.getValidMoves(game.turn);
            if (!validMoves.includes(idx)) {
                hole.classList.add('shake');
                setTimeout(() => hole.classList.remove('shake'), 500);
                return;
            }

            isAnimating = true;
            hole.classList.add('picking');
            await delay(300);
            hole.classList.remove('picking');

            const seedsToSow = game.board[idx];
            const res = game.move(idx);
            if (res.error) { isAnimating = false; return; }

            // Step-by-step animation
            const path = getPlayerPath(playerRole);
            let currPathIdx = path.indexOf(idx);
            let distributed = 0;

            // Update starting hole to 0 visually
            const startHole = document.querySelector(`.hole[data-index="${idx}"]`);
            if (startHole) {
                startHole.querySelector('.seed-count').textContent = 0;
                renderSeedDots(startHole, 0);
            }

            while (distributed < seedsToSow) {
                currPathIdx = (currPathIdx + 1) % 14;
                const bIdx = path[currPathIdx];
                if (bIdx === idx) continue;

                // Rule > 13 skip own territory
                if (seedsToSow > 13 && distributed >= 13 && ((playerRole === 0 && bIdx <= 6) || (playerRole === 1 && bIdx >= 7))) {
                    continue;
                }

                distributed++;
                const targetHole = document.querySelector(`.hole[data-index="${bIdx}"]`);
                if (targetHole) {
                    targetHole.classList.add('sowing');
                    const currentDisplay = parseInt(targetHole.querySelector('.seed-count').textContent) || 0;
                    targetHole.querySelector('.seed-count').textContent = currentDisplay + 1;
                    await delay(800); // Slow motion
                    targetHole.classList.remove('sowing');
                }
            }

            updateUI();
            await pushMove().catch(e => console.error('Push failed:', e));
            isAnimating = false;
        });
    });

    // ─── Helpers ──────────────────────────────────────────
    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    function getPlayerPath(playerIndex) {
        return playerIndex === 0
            ? [0,1,2,3,4,5,6,7,8,9,10,11,12,13]
            : [13,12,11,10,9,8,7,6,5,4,3,2,1,0];
    }

    // ─── Buttons ──────────────────────────────────────────
    document.getElementById('btn-create').addEventListener('click', createGame);
    document.getElementById('btn-join').addEventListener('click', joinGame);

    // Handle ?key= param (direct join via shared link)
    const urlKey = new URLSearchParams(window.location.search).get('key');
    if (urlKey) {
        document.getElementById('input-key').value = urlKey;
        // Auto-join after a small delay to ensure server ping is done
        setTimeout(() => {
            document.getElementById('btn-join').click();
        }, 500);
    }
});

// ─── Global copyKey ───────────────────────────────────
function copyKey() {
    const key = document.getElementById('display-key').textContent;
    navigator.clipboard.writeText(key).then(() => {
        alert('Clé copiée : ' + key);
    }).catch(() => {
        prompt('Copiez cette clé :', key);
    });
}
