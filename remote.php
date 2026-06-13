<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Songho – En Ligne</title>
    <link rel="icon" type="image/svg+xml" href="logo.svg">
    <meta name="description" content="Jouez au Songo en ligne avec un adversaire à distance.">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="container">

    <!-- HEADER -->
    <header>
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="logo.svg" alt="Logo" style="height: 40px; width: auto;">
            <h1>SONGHO ONLINE</h1>
        </div>
        <div class="controls-top">
            <a href="index.php" class="btn">← Menu</a>
        </div>
    </header>

    <!-- SETUP SCREEN -->
    <div id="setup-screen" class="setup-container">
        <div class="setup-card">
            <h3>Créer une partie</h3>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
                Créez une nouvelle partie et partagez la clé à votre adversaire.
            </p>
            <input type="text" id="p_name_create" class="input-field" placeholder="Votre Nom (ex: Abdel)" style="margin-bottom:12px;">
            <button class="btn btn-primary" id="btn-create" style="width:100%; padding:14px; font-size:1rem;">
                ✚ Créer une partie
            </button>
        </div>

        <div class="setup-card">
            <h3>Rejoindre une partie</h3>
            <input type="text" id="p_name_join" class="input-field" placeholder="Votre Nom (ex: Fadil)" style="margin-bottom:12px;">
            <input type="text" id="input-key" class="input-field"
                   placeholder="Entrez la clé de partie (ex: a1b2c3d4)"
                   autocomplete="off" autocapitalize="none"
                   spellcheck="false">
            <button class="btn btn-gold" id="btn-join" style="width:100%; padding:14px; font-size:1rem;">
                → Rejoindre
            </button>
        </div>

        <div style="text-align:center; margin-top:16px;">
            <div class="connection-status" style="justify-content:center;" id="server-status">
                <div class="status-dot" id="server-dot"></div>
                <span id="server-status-text">Vérification du serveur...</span>
            </div>
        </div>
    </div>

    <!-- GAME SCREEN -->
    <div id="game-screen" style="display:none;">

        <!-- Key + status -->
        <div class="game-info-bar" style="margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
                <div class="status-msg" id="status-msg">En attente...</div>
                <div class="connection-status">
                    <div class="status-dot waiting" id="conn-dot"></div>
                    <span id="remote-status">Connexion...</span>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:0.75rem; color:var(--text-muted);">Clé :</span>
                <span id="display-key" style="font-family:'JetBrains Mono'; font-weight:700; color:var(--gold); font-size:1.1rem; letter-spacing:0.15em;">—</span>
                <button class="btn btn-secondary" onclick="copyKey()" style="padding:6px 12px; font-size:0.75rem;">📋 Copier</button>
            </div>
        </div>

        <!-- Game Layout -->
        <div class="game-layout">
            <!-- Nord -->
            <div class="side-panel" id="player0-card">
                <div class="player-avatar">P1</div>
                <span class="label-side">Nord (J1)</span>
                <div class="score-side" id="score0">0</div>
                <span class="label-side">Graines</span>
            </div>

            <!-- Board -->
            <div class="songo-board" id="board">
                <div class="territory-label" style="color:var(--north);">↑ NORD — Joueur 1</div>
                <div class="territory north">
                    <div class="hole" data-index="0" id="hole-0"><span class="hole-label">N1</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                    <div class="hole" data-index="1" id="hole-1"><span class="hole-label">N2</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                    <div class="hole" data-index="2" id="hole-2"><span class="hole-label">N3</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                    <div class="hole" data-index="3" id="hole-3"><span class="hole-label">N4</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                    <div class="hole" data-index="4" id="hole-4"><span class="hole-label">N5</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                    <div class="hole" data-index="5" id="hole-5"><span class="hole-label">N6</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                    <div class="hole" data-index="6" id="hole-6"><span class="hole-label">N7</span><span class="seed-count">4</span><div class="seeds-visual"></div></div>
                </div>
                <div class="board-divider"></div>
                <div class="territory south">
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

            <!-- Sud -->
            <div class="side-panel" id="player1-card" style="border-color:var(--gold); box-shadow:var(--glow-gold);">
                <div class="player-avatar">P2</div>
                <span class="label-side">Sud (J2)</span>
                <div class="score-side" id="score1">0</div>
                <span class="label-side">Graines</span>
            </div>
        </div>

        <!-- History -->
        <div class="bottom-panels">
            <div class="panel">
                <h3>Historique</h3>
                <ul id="history-list"><li>En attente de la partie...</li></ul>
            </div>
            <div class="panel">
                <h3>Votre rôle</h3>
                <div class="last-move-display">
                    <p id="display-player" style="color:var(--text); font-weight:700; font-size:1rem;">Rôle : ...</p>
                    <p style="margin-top:8px; font-size:0.8rem;" id="remote-hint">En attente de l'adversaire...</p>
                </div>
            </div>
        </div>

        <div style="text-align:center; margin-top:20px;">
            <button class="btn btn-danger" onclick="location.reload()">✕ Quitter la partie</button>
        </div>

        <div style="margin-top: 40px; padding: 20px; text-align: center; border-top: 1px solid var(--border); opacity: 0.5; font-size: 0.8rem;">
            <p>Réalisé par : MOUNBEKET NGOUNDAM V ABDEL FADIL | Université de Yaoundé I | Licence 2 Cameroun</p>
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
            <a href="remote.php" class="btn btn-gold">↺ Nouvelle partie</a>
            <a href="index.php" class="btn">← Menu</a>
        </div>
    </div>
</div>

<script src="js/songo-core.js"></script>
<script src="js/remote-game.js"></script>
</body>
</html>
