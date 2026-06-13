CREATE DATABASE IF NOT EXISTS songo_db;
USE songo_db;

CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_key VARCHAR(50) UNIQUE NOT NULL,
    player1_id VARCHAR(50) DEFAULT NULL,
    player2_id VARCHAR(50) DEFAULT NULL,
    p1_name VARCHAR(100) DEFAULT 'Joueur 1',
    p2_name VARCHAR(100) DEFAULT 'Joueur 2',
    board_state TEXT NOT NULL,
    p1_score INT DEFAULT 0,
    p2_score INT DEFAULT 0,
    current_turn INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'waiting',
    winner INT DEFAULT NULL,
    last_move_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
