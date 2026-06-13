<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'db.php';

try {
    // 1. Drop existing table to avoid any corruption
    $pdo->exec("DROP TABLE IF EXISTS games");

    // 2. Create the table manually with the exact SQL needed for SQLite
    $sql = "CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_key VARCHAR(50) UNIQUE NOT NULL,
        player1_id VARCHAR(50) DEFAULT NULL,
        player2_id VARCHAR(50) DEFAULT NULL,
        board_state TEXT NOT NULL,
        p1_score INT DEFAULT 0,
        p2_score INT DEFAULT 0,
        current_turn INT DEFAULT 1,
        status VARCHAR(20) DEFAULT 'waiting',
        winner INT DEFAULT NULL,
        last_move_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    $pdo->exec($sql);

    echo "<h1 style='color:green'>SUCCESS: Table 'games' creation forced!</h1>";
    echo "<p>SQLite database is now ready. <a href='../remote.php'>Go to Online Game</a></p>";

} catch (Exception $e) {
    echo "<h1 style='color:red'>FAILURE: Setup failed</h1>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
