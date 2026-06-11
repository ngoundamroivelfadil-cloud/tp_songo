<?php
/**
 * Configuration de la Base de Données
 * Utilise les variables d'environnement pour l'hébergement distant
 */
$host     = getenv('DB_HOST') ?: 'localhost';
$dbname   = getenv('DB_NAME') ?: 'songo_db';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Si nous sommes sur le serveur, on renvoie du JSON pour l'API
    if (strpos($_SERVER['REQUEST_URI'], 'game_api.php') !== false) {
        header('Content-Type: application/json');
        die(json_encode([
            'success' => false, 
            'error' => 'Erreur de connexion base de données.'
        ]));
    }
    // Sinon affichage simple
    die("Erreur de connexion : " . $e->getMessage());
}
?>
