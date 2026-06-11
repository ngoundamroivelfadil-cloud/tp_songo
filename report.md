# Rapport de Projet : Jeu de Songo
**Auteur :** Ngoufo GANGNIMAZE
**Date :** 10 Juin 2026

## 1. Fonctionnement du Jeu
Le Songo est un jeu de semailles stratégique pratiqué par les populations Ekang au Cameroun, au Gabon et en Guinée Équatoriale. Il se joue sur un tablier composé de deux rangées de 7 cases. Chaque case contient initialement 5 graines, pour un total de 70 graines.

### Objectif
L'objectif est de capturer un maximum de graines. Le premier joueur atteignant 40 graines remporte la partie.

### Déroulement d'un tour
1. Le joueur choisit une case dans son propre camp.
2. Il ramasse toutes les graines de cette case.
3. Il les sème une à une dans les cases suivantes, en suivant une boucle anti-horaire.
4. **Cas particulier (> 13 graines) :** Si la case choisie contient plus de 13 graines, le joueur fait un tour complet (en sautant sa propre case de départ). Passé ce tour complet, les graines restantes sont semées **exclusivement** dans le camp adverse.

## 2. Principe des Règles Particulières
Le Songo se distingue par des règles complexes de capture et de solidarité :

- **Captures :** On capture uniquement dans le camp adverse si la dernière graine tombe dans une case contenant 1, 2 ou 3 graines (donc 2, 3 ou 4 après le semis). La capture peut être "en chaîne" vers l'arrière si les cases précédentes remplissent aussi les conditions.
- **Règle de la Première Case (Pit 1) :** La première case de l'adversaire est protégée. On ne peut pas y capturer 2-4 graines si le semis s'y termine, sauf si elle fait partie d'une chaîne initiée plus loin. Cependant, si le semis y aboutit après un tour complet, on capture exactement 1 graine.
- **Solidarité :** Si l'adversaire n'a plus de graines, le joueur est obligé de jouer un coup qui lui en apporte.
- **Anti-Famine :** Il est interdit de vider totalement le camp de l'adversaire par une capture. Si un coup devait laisser l'adversaire sans aucune graine, la capture est annulée.
- **Fin de partie :** La partie s'arrête quand un joueur atteint 40 graines, ou s'il y a moins de 10 graines sur le plateau (les graines restantes vont alors à celui dans le camp duquel elles se trouvent).

## 3. Algorithmes Principaux

### Algorithme de Semis (Distribution)
```pseudo
Fonction Distrubuer(caseDepart, nbGraines):
    Vider(caseDepart)
    positionActuelle = caseDepart
    Tant que nbGraines > 0:
        positionActuelle = CaseSuivante(positionActuelle)
        Si positionActuelle != caseDepart: // On saute la case de départ
            AjouterGraine(positionActuelle)
            nbGraines = nbGraines - 1
    Si nbGraines == 0:
        VerifierCaptures(positionActuelle)
```

### Algorithme de Capture
```pseudo
Fonction VerifierCaptures(derniereCase):
    Si !DansCampAdverse(derniereCase) Retourner
    Si derniereCase == PremiereCaseAdverse:
        GérerRègleSpécialeCase1()
        Retourner

    Tant que DansCampAdverse(derniereCase) ET (Graines(derniereCase) entre 2 et 4):
        Si SimulationViderVideraitToutLeCamp(): Break
        Capturer(derniereCase)
        derniereCase = CasePrecedente(derniereCase)
```

## 4. Organisation du Code

Le projet est structuré pour maximiser la réutilisation de la logique métier entre les versions locale et distante.

### Architecture des Fichiers
- **Logic Métier (`js/songo-core.js`)** : Classe `SongoCore` encapsulant toutes les règles (semis, captures, fin de partie). C'est le moteur du jeu.
- **Interface Locale (`local.php` / `js/local-game.js`)** : Gère l'affichage DOM et les interactions pour deux joueurs sur le même navigateur.
- **Interface Distante (`remote.php` / `js/remote-game.js`)** : Utilise l'API Fetch (Ajax) pour synchroniser l'état du jeu avec un serveur distant.
- **Backend (`server/`)** : 
  - `game_api.php` : Point d'entrée pour les requêtes Ajax (Actions: create, join, move, get_state).
  - `db.php` : Gestion de la persistance via MySQL.
- **Accueil (`index.php`)** : Point d'entrée principal du projet.

### Technologie utilisée
- **Frontend** : HTML5, CSS3 Moderne (Flexbox/Grid), JavaScript ES6.
- **Backend** : PHP 7.4+.
- **Base de données** : MySQL (Table `games` stockant le plateau sous forme JSON).
- **Communication** : JSON via Ajax.
