<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'db.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        case 'ping':
            echo json_encode(['pong' => true, 'time' => date('c')]);
            break;

        case 'create':
            $key          = bin2hex(random_bytes(4)); // 8-char hex key
            $initialBoard = json_encode(array_fill(0, 14, 4));
            $stmt = $pdo->prepare(
                "INSERT INTO games (game_key, board_state, current_turn, status) VALUES (?, ?, 1, 'waiting')"
            );
            $stmt->execute([$key, $initialBoard]);
            // Creator is SUD (player_role = 1), who plays first (turn = 1)
            echo json_encode(['success' => true, 'game_key' => $key, 'player_role' => 1]);
            break;

        case 'join':
            $key  = strtolower(trim($_GET['key'] ?? ''));
            $stmt = $pdo->prepare("SELECT * FROM games WHERE game_key = ?");
            $stmt->execute([$key]);
            $game = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($game) {
                if ($game['status'] !== 'waiting') {
                    echo json_encode(['success' => false, 'error' => 'Partie déjà en cours ou terminée.']);
                } else {
                    $upd = $pdo->prepare("UPDATE games SET status = 'playing' WHERE game_key = ?");
                    $upd->execute([$key]);
                    // Joiner is NORD (player_role = 0)
                    echo json_encode(['success' => true, 'player_role' => 0]);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'Partie non trouvée. Vérifiez la clé.']);
            }
            break;

        case 'get_state':
            $key  = strtolower(trim($_GET['key'] ?? ''));
            $stmt = $pdo->prepare("SELECT * FROM games WHERE game_key = ?");
            $stmt->execute([$key]);
            $game = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($game) {
                echo json_encode(['success' => true, 'game' => $game]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Partie introuvable.']);
            }
            break;

        case 'move':
            $data      = json_decode(file_get_contents('php://input'), true);
            $key       = strtolower(trim($data['key'] ?? ''));
            $board     = $data['boardState'] ?? [];
            $scores    = $data['scores']     ?? [0, 0];
            $turn      = intval($data['turn']   ?? 1);
            $status    = $data['status']         ?? 'playing';
            $winner    = isset($data['winner']) && $data['winner'] !== null ? intval($data['winner']) : null;

            $stmt = $pdo->prepare(
                "UPDATE games
                 SET board_state = ?, p1_score = ?, p2_score = ?,
                     current_turn = ?, status = ?, winner = ?
                 WHERE game_key = ?"
            );
            $stmt->execute([
                json_encode($board),
                $scores[0],
                $scores[1],
                $turn,
                $status,
                $winner,
                $key
            ]);
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['success' => false, 'error' => "Action inconnue: '$action'"]);
    }

} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
?>
