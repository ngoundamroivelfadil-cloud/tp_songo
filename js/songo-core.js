/**
 * Songo Core Game Logic
 * Implements the Ekang/Ewondo/Bulu rules of Songo
 */

class SongoCore {
    constructor() {
        this.board = new Array(14).fill(4); // 0-6 North, 7-13 South (counter-clockwise)
        this.scores = [0, 0]; // Index 0: North, Index 1: South
        this.turn = 1; // 0: Player 1 (North/NORD), 1: Player 2 (South/SUD)
        this.status = 'playing'; // 'playing', 'finished', 'draw'
        this.winner = null;
        this.log = [];
    }

    reset() {
        this.board = new Array(14).fill(4);
        this.scores = [0, 0];
        this.turn = 1; // Start with South (customizable)
        this.status = 'playing';
        this.winner = null;
        this.log = ["Début de la partie"];
    }

    /**
     * Executes a move from the given hole index
     * @param {number} holeIndex 0-13
     * @returns {object} result of the move
     */
    move(holeIndex) {
        if (this.status !== 'playing') return { error: 'Game finished' };
        
        const validMoves = this.getValidMoves(this.turn);
        if (!validMoves.includes(holeIndex)) {
            if (this.isTerritoryEmpty(1 - this.turn)) {
                return { error: 'Solidarité obligatoire ! Vous devez nourrir l\'adversaire.' };
            }
            return { error: 'Coup invalide' };
        }
        
        if (this.board[holeIndex] === 0) return { error: 'Hole is empty' };

        const playerIndex = this.turn;
        const seeds = this.board[holeIndex];
        this.board[holeIndex] = 0;

        const path = this.getPlayerPath(playerIndex);
        let idxInPath = path.indexOf(holeIndex);
        let seedsToDistribute = seeds;

        // Part 1: First full lap (13 holes excluding the source)
        // If seeds <= 13, it's just this part.
        // If seeds > 13, we do one full lap of the board (all holes EXCEPT source)
        
        let lapsDone = 0;
        let positionsInLap = 0;

        while (seedsToDistribute > 0) {
            idxInPath = (idxInPath + 1) % 14;
            const boardIdx = path[idxInPath];

            // Rule: skip the starting hole
            if (boardIdx === holeIndex) continue;

            // Rule > 13: "continuera la distribution exclusivement dans le camp adverse"
            // This happens AFTER the first full lap of the board.
            // A full lap of the board excluding the source is 13 pits.
            if (seeds > 13 && (seeds - seedsToDistribute) >= 13) {
                // If we are back in our own territory, we skip and go to opponent's first hole
                if (this.isInOwnTerritory(boardIdx, playerIndex)) {
                    continue; 
                }
            }

            // Normal distribution or restricted distribution (opponent only)
            this.board[boardIdx]++;
            seedsToDistribute--;

            if (seedsToDistribute === 0) {
                const captured = this.harvest(boardIdx, playerIndex, seeds);
                if (captured > 0) {
                    this.log.push(`${playerIndex === 0 ? 'Nord' : 'Sud'} capture ${captured} graines`);
                }
            }
        }

        this.log.push(`${playerIndex === 0 ? 'Nord' : 'Sud'} joue du trou ${holeIndex % 7 + 1}`);

        this.checkEndGame();
        if (this.status === 'playing') {
            this.turn = 1 - this.turn;
            // Solidarity check: if opponent territory is empty
            if (this.isTerritoryEmpty(this.turn)) {
                if (!this.canProvideSolidarity(1 - this.turn)) {
                    this.finishGame(); // Famine end
                }
            }
        }

        return { board: [...this.board], scores: [...this.scores], turn: this.turn };
    }

    getPlayerPath(playerIndex) {
        // Absolute indices: 0-6 North (left to right), 7-13 South (right to left for loop)
        // Wait, standard Songo loop:
        // North P1: 6->5->4->3->2->1->0 (own) then 7->8->9->10->11->12->13 (opp)
        // South P2: 13->12->11->10->9->8->7 (own) then 0->1->2->3->4->5->6 (opp)
        // Let's re-verify the indices in UI:
        // P1 (North): Hole 1 (idx 0), 2 (1), ... 7 (6)
        // P2 (South): Hole 7 (idx 13), 6 (12), ... 1 (7)
        // So path for P1 starts from his pits to opponent pits.
        if (playerIndex === 0) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        } else {
            return [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
        }
    }

    isValidHole(holeIndex) {
        if (this.turn === 0) return holeIndex >= 0 && holeIndex <= 6;
        return holeIndex >= 7 && holeIndex <= 13;
    }

    isInOwnTerritory(boardIdx, playerIndex) {
        if (playerIndex === 0) return boardIdx >= 0 && boardIdx <= 6;
        return boardIdx >= 7 && boardIdx <= 13;
    }

    /**
     * Get all valid moves for a player, respecting Solidarity
     */
    getValidMoves(playerIndex) {
        const start = playerIndex === 0 ? 0 : 7;
        const possibleMoves = [];
        const feedingMoves = [];

        const opponentEmpty = this.isTerritoryEmpty(1 - playerIndex);

        for (let i = start; i < start + 7; i++) {
            if (this.board[i] > 0) {
                possibleMoves.push(i);
                
                // Check if this move feeds the opponent
                if (opponentEmpty) {
                    const seeds = this.board[i];
                    const path = this.getPlayerPath(playerIndex);
                    const posInPath = path.indexOf(i);
                    const distanceToOpponent = 7 - (posInPath % 7);
                    if (seeds >= distanceToOpponent) {
                        feedingMoves.push(i);
                    }
                }
            }
        }

        // If opponent is empty, we MUST feed them if possible
        if (opponentEmpty && feedingMoves.length > 0) {
            return feedingMoves;
        }

        return possibleMoves;
    }

    harvest(lastIdx, playerIndex, initialSeeds) {
        const opponentTerritory = playerIndex === 0 ? [7, 8, 9, 10, 11, 12, 13] : [0, 1, 2, 3, 4, 5, 6];
        const opponentFirstHole = opponentTerritory[0];

        // Rule: Only harvest in opponent territory
        if (!opponentTerritory.includes(lastIdx)) return;

        // Rule: First hole of opponent (pit 1)
        // "la prise de 2, 3 ou 4 graines ne se fait pas dans la première case adverse si la distribution s'y termine."
        // "Toutefois, si elle est incluse dans une prise à la chaîne, ses graines peuvent être prises."
        // "Si la distribution se termine dans la première case de l'adversaire après au moins 1 tour complet... capture d'une seule graine."
        
        let captureCountAtEnd = this.board[lastIdx];
        
        // Handle pit 1 termination specially
        if (lastIdx === opponentFirstHole) {
            // Rule: "Si la distribution se termine dans la première case de l'adversaire après au moins 1 tour complet... capture d'une seule graine."
            // 1 tour complet = distance > 13
            if (initialSeeds > 13) {
                this.scores[playerIndex]++;
                this.board[lastIdx]--;
                this.log.push(`Nord capture 1 graine au Trou 1 (Tour Complet)`);
                return 1;
            }
            // Sinon, aucune capture au Trou 1 si c'est la fin de distribution normale (non-chaînée)
            return 0;
        }

        // Chained harvesting (backward)
        const path = this.getPlayerPath(playerIndex);
        let currPathIdx = path.indexOf(lastIdx);
        
        let hypotheticalBoard = [...this.board];
        let totalCaptured = 0;
        let chainIndices = [];

        while (currPathIdx >= 7) { // Only opponent territory (indices 7-13 in path)
            const bIdx = path[currPathIdx];
            if (hypotheticalBoard[bIdx] >= 2 && hypotheticalBoard[bIdx] <= 4) {
                totalCaptured += hypotheticalBoard[bIdx];
                hypotheticalBoard[bIdx] = 0;
                chainIndices.push(bIdx);
            } else {
                break;
            }
            currPathIdx--;
        }

        // Rule: Anti-famine (don't empty the camp)
        const opponentStillHasSeeds = opponentTerritory.some(idx => hypotheticalBoard[idx] > 0);
        
        if (totalCaptured > 0 && opponentStillHasSeeds) {
            this.scores[playerIndex] += totalCaptured;
            chainIndices.forEach(idx => this.board[idx] = 0);
            return totalCaptured;
        }
        return 0;
    }

    isTerritoryEmpty(playerIndex) {
        const start = playerIndex === 0 ? 0 : 7;
        for (let i = start; i < start + 7; i++) {
            if (this.board[i] > 0) return false;
        }
        return true;
    }

    /**
     * Solidarity rule: feed the opponent if they are empty
     */
    canProvideSolidarity(playerIndex) {
        const ownStart = playerIndex === 0 ? 0 : 7;
        const oppStart = playerIndex === 0 ? 7 : 0;
        const path = this.getPlayerPath(playerIndex);
        
        // We need to check if any of our holes can send seeds to the opponent
        // And if we can, we MUST play the one that sends the most if we can send >= 7
        // But here we just check if it's POSSIBLE.
        for (let i = ownStart; i < ownStart + 7; i++) {
            const seeds = this.board[i];
            if (seeds > 0) {
                const posInPath = path.indexOf(i);
                const distanceToOpponent = 7 - (posInPath % 7);
                if (seeds >= distanceToOpponent) return true;
            }
        }
        return false;
    }

    checkEndGame() {
        const totalSeeds = 56; // 14 holes * 4 seeds
        const winThreshold = Math.floor(totalSeeds / 2) + 1;

        if (this.scores[0] >= winThreshold) {
            this.status = 'finished';
            this.winner = 0;
        } else if (this.scores[1] >= winThreshold) {
            this.status = 'finished';
            this.winner = 1;
        } else {
            const totalOnBoard = this.board.reduce((a, b) => a + b, 0);
            if (totalOnBoard < 6) { // Less than 6 seeds remaining
                this.finishGame();
            }
        }
    }

    finishGame() {
        this.scores[0] += this.board.slice(0, 7).reduce((a, b) => a + b, 0);
        this.scores[1] += this.board.slice(7, 14).reduce((a, b) => a + b, 0);
        this.board.fill(0);
        this.status = 'finished';
        if (this.scores[0] > this.scores[1]) this.winner = 0;
        else if (this.scores[1] > this.scores[0]) this.winner = 1;
        else if (this.scores[0] === this.scores[1]) this.status = 'draw';
    }

}

if (typeof module !== 'undefined') {
    module.exports = SongoCore;
}
