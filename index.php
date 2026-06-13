<?php header('ngrok-skip-browser-warning: true'); ?><!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Songho - Jeu de Stratégie Traditionnel</title>
    <link rel="icon" type="image/svg+xml" href="logo.svg">
    <meta name="description"
        content="Jouez au Songo/Songho, jeu de stratégie traditionnel Ewondo/Bulu. Mode local, VS ordinateur ou en ligne.">
    <link rel="stylesheet" href="css/style.css">
    <style>
        /* Particle canvas */
        #particles {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            opacity: 0.4;
        }

        .menu-page {
            position: relative;
            z-index: 1;
        }
    </style>
</head>

<body>
    <canvas id="particles"></canvas>
    <div class="menu-page container">

        <div class="menu-hero">
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 12px;">
                <img src="logo.svg" alt="Logo" style="height: 80px; width: auto; border-radius: 8px;">
                <div style="text-align: left;">
                    <div
                        style="font-size:1.1rem; letter-spacing:0.4em; text-transform:uppercase; color:var(--text-muted); font-weight:600;">
                        Jeu Traditionnel
                    </div>
                    <h1>SONGHO</h1>
                </div>
            </div>
            <p class="subtitle">
                Un jeu de semaille et de stratégie ancestral.
                Capturez les graines de votre adversaire et remportez la victoire.
            </p>
        </div>

        <div class="menu-cards">
            <!-- Local PvP -->
            <a href="local.php" class="menu-card primary" id="btn-local">
                <div class="menu-card-icon">PVP</div>
                <h3>Local PvP</h3>
                <p>Deux joueurs, un seul écran. Affrontez votre adversaire en face à face.</p>
                <span class="badge">Prêt à jouer</span>
            </a>

            <!-- VS Computer -->
            <a href="local.php?vs=computer" class="menu-card" id="btn-computer">
                <div class="menu-card-icon">CPU</div>
                <h3>VS Ordinateur</h3>
                <p>Entraînez-vous contre l'IA et maîtrisez les règles du Songo.</p>
                <span class="badge"
                    style="background:rgba(123,94,167,0.15);color:var(--accent-2);border-color:rgba(123,94,167,0.3);">IA
                    embarquée</span>
            </a>

            <!-- Online -->
            <a href="remote.php" class="menu-card gold" id="btn-online">
                <div class="menu-card-icon">WEB</div>
                <h3>En Ligne</h3>
                <p>Créez une partie et partagez la clé à votre adversaire pour jouer à distance.</p>
                <span class="badge"
                    style="background:rgba(240,180,41,0.15);color:var(--gold);border-color:rgba(240,180,41,0.3);">Multijoueur</span>
            </a>
        </div>

        <!-- Mini board preview -->
        <div style="max-width:600px; width:100%; margin-bottom:40px;">
            <div class="songo-board" style="padding:20px;">
                <div class="territory-label" style="color:var(--north); font-size:0.6rem; letter-spacing:0.15em;">NORD —
                    Joueur 1</div>
                <div class="territory" id="preview-north" style="gap:8px;"></div>
                <div class="board-divider"></div>
                <div class="territory" id="preview-south" style="gap:8px;"></div>
                <div class="territory-label" style="color:var(--south); font-size:0.6rem; letter-spacing:0.15em;">SUD —
                    Joueur 2</div>
            </div>
        </div>

        <div class="menu-footer">
            <p style="color:var(--text-muted); line-height:1.8;">
                Réalisé par : <strong>MOUNBEKET NGOUNDAM V ABDEL FADIL</strong><br>
                Université de Yaoundé I &nbsp;|&nbsp; Licence 2 Cameroun &nbsp;|&nbsp; 2025
            </p>
        </div>
    </div>

    <script>
        // --- Particle background ---
        (function () {
            const canvas = document.getElementById('particles');
            const ctx = canvas.getContext('2d');
            let particles = [];
            function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
            resize(); window.addEventListener('resize', resize);
            for (let i = 0; i < 60; i++) {
                particles.push({
                    x: Math.random() * innerWidth,
                    y: Math.random() * innerHeight,
                    r: Math.random() * 2 + 0.5,
                    dx: (Math.random() - 0.5) * 0.3,
                    dy: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(79,156,249,${p.opacity})`;
                    ctx.fill();
                    p.x += p.dx; p.y += p.dy;
                    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
                });
                requestAnimationFrame(draw);
            }
            draw();
        })();

        // --- Preview Board ---
        (function () {
            const seeds = [4, 4, 4, 4, 4, 4, 4];
            function makeTerritory(containerId, indices, reversed) {
                const container = document.getElementById(containerId);
                (reversed ? [...indices].reverse() : indices).forEach((n, i) => {
                    const hole = document.createElement('div');
                    hole.className = 'hole';
                    hole.style.cssText = 'cursor:default; pointer-events:none;';
                    const count = document.createElement('span');
                    count.className = 'seed-count';
                    count.style.fontSize = '1rem';
                    count.textContent = seeds[i];
                    hole.appendChild(count);
                    container.appendChild(hole);
                });
            }
            makeTerritory('preview-north', [0, 1, 2, 3, 4, 5, 6], false);
            makeTerritory('preview-south', [13, 12, 11, 10, 9, 8, 7], false);
        })();
    </script>
</body>

</html>


