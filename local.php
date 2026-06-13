<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Songho – Mode Local</title>
    <link rel="icon" type="image/svg+xml" href="logo.svg">
    <meta name="description" content="Jouez au Songo en local - PvP ou contre l'ordinateur.">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="container">

    <!-- HEADER -->
    <header>
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="logo.svg" alt="Logo" style="height: 40px; width: auto;">
            <h1>SONGHO</h1>
        </div>
        <div class="controls-top">
            <button id="vs-player-btn" class="btn btn-secondary active">PVP Local</button>
            <button id="vs-computer-btn" class="btn btn-secondary">VS Ordinateur</button>
            <button class="btn btn-primary" id="reset-btn">Nouvelle partie</button>
            <a href="index.php" class="btn">← Menu</a>
        </div>
    </header>

    <!-- TOP STATS -->
    <div class="top-stats">
        <div class="stat-card">
            <label>Mode</label>
            <span id="display-mode">Joueur vs Joueur</span>
        </div>
        <div class="stat-card">
            <label>Votre camp</label>
            <span id="display-camp">SUD</span>
        </div>
        <div class="stat-card">
            <label>Tour actuel</label>
            <span id="display-tour">SUD</span>
        </div>
        <div class="stat-card">
            <label>Total sur plateau</label>
            <span id="display-total">70</span>
        </div>
    </div>

    <!-- GAME INFO BAR -->
    <div class="game-info-bar">
        <div class="status-msg" id="status-msg">Au tour du Joueur 2 (SUD)</div>
        <div style="font-size:0.8rem; color:var(--text-muted)" id="last-move-details">Aucun coup joué.</div>
    </div>

    <!-- MAIN GAME LAYOUT -->
    <div class="game-layout">
        <!-- Nord Score Panel -->
        <div class="side-panel" id="player0-card">
            <div class="player-avatar">P1</div>
            <span class="label-side">Nord</span>
            <div class="score-side" id="score0">0</div>
            <span class="label-side">Graines</span>
        </div>

        <!-- Board -->
        <div class="songo-board" id="board">
            <div class="territory-label" style="color:var(--north);">↑ NORD — Joueur 1</div>
            <div class="territory north" id="territory-north">
                <div class="hole" data-index="0" id="hole-0"><span class="hole-label">N1</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="1" id="hole-1"><span class="hole-label">N2</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="2" id="hole-2"><span class="hole-label">N3</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="3" id="hole-3"><span class="hole-label">N4</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="4" id="hole-4"><span class="hole-label">N5</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="5" id="hole-5"><span class="hole-label">N6</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="6" id="hole-6"><span class="hole-label">N7</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
            </div>

            <div class="board-divider"></div>

            <div class="territory south" id="territory-south">
                <div class="hole" data-index="13" id="hole-13"><span class="hole-label">S1</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="12" id="hole-12"><span class="hole-label">S2</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="11" id="hole-11"><span class="hole-label">S3</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="10" id="hole-10"><span class="hole-label">S4</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="9"  id="hole-9" ><span class="hole-label">S5</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="8"  id="hole-8" ><span class="hole-label">S6</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                <div class="hole" data-index="7"  id="hole-7" ><span class="hole-label">S7</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
            </div>
            <div class="territory-label" style="color:var(--south);">↓ SUD — Joueur 2</div>
        </div>

        <!-- Sud Score Panel -->
        <div class="side-panel" id="player1-card" style="border-color:var(--gold); box-shadow:var(--glow-gold);">
            <div class="player-avatar">P2</div>
            <span class="label-side">Sud</span>
            <div class="score-side" id="score1">0</div>
            <span class="label-side">Graines</span>
        </div>
    </div>

    <!-- HISTORY & LAST MOVE -->
    <div class="bottom-panels">
        <div class="panel">
            <h3>Historique des coups</h3>
            <ul id="history-list">
                <li>Début de la partie</li>
            </ul>
        </div>
        <div class="panel">
            <h3>Dernier coup</h3>
            <div class="last-move-display" id="last-move-display">
                Aucun coup joué pour l'instant.<br>
                <strong>Cliquez sur un trou pour commencer.</strong>
            </div>
        </div>
    </div>

    <!-- RULES -->
    <div class="rules-footer">
        <h2>Règles du jeu</h2>
        <div class="rules-grid">
            <div class="rule-item"><strong>Semaille</strong>Distribution anti-horaire, une graine par trou.</div>
            <div class="rule-item"><strong>Capture</strong>2, 3 ou 4 graines dans le camp adverse en fin de tour.</div>
            <div class="rule-item"><strong>Chaînage</strong>Si le trou précédent remplit aussi les conditions, il est capturé.</div>
            <div class="rule-item"><strong>Solidarité</strong>On doit obligatoirement nourrir l'adversaire s'il n'a plus de graines.</div>
            <div class="rule-item"><strong>Anti-famine</strong>Il est interdit de vider entièrement le camp adverse.</div>
            <div class="rule-item"><strong>Trou 1</strong>Protection spéciale sur la première case adverse.</div>
        </div>
    </div>

    <div style="margin-top: 40px; padding: 20px; text-align: center; border-top: 1px solid var(--border); opacity: 0.5; font-size: 0.8rem;">
        <p>Réalisé par : MOUNBEKET NGOUNDAM V ABDEL FADIL | Université de Yaoundé I | Licence 2 Cameroun</p>
    </div>
</div>

    <!-- PLAYER NAMES MODAL -->
    <div class="modal-overlay" id="names-modal" style="display: flex;">
        <div class="modal-box">
            <div class="modal-icon" style="font-size: 3rem; color: var(--accent); margin-bottom: 20px;">ID</div>
            <h2>Enregistrement</h2>
            <p style="color:var(--text-muted); margin-bottom: 20px;">Entrez les noms des joueurs pour commencer la partie.</p>
            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
                <input type="text" id="p1-name-input" class="input-field" placeholder="Nom Joueur 1 (NORD)" value="Abdel">
                <input type="text" id="p2-name-input" class="input-field" placeholder="Nom Joueur 2 (SUD)" value="Fadil">
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" id="start-game-btn">C'est parti !</button>
            </div>
        </div>
    </div>

    <!-- VICTORY MODAL -->
<div class="modal-overlay" id="victory-modal">
    <div class="modal-box">
        <div class="modal-icon" id="trophy-icon" style="font-size: 3rem; color: var(--gold); margin-bottom: 20px;">FIN</div>
        <h2 id="winner-text">Victoire !</h2>
        <div class="modal-score" id="winner-score">0 – 0</div>
        <div class="modal-actions">
            <button class="btn btn-gold" id="modal-restart-btn">↺ Rejouer</button>
            <a href="index.php" class="btn">← Menu</a>
        </div>
    </div>
</div>

<script src="js/songo-core.js"></script>
<script src="js/local-game.js"></script>
</body>
</html>
