<?php
// setup.php
$dbType = getenv('DB_TYPE') ?: ($_ENV['DB_TYPE'] ?? ($_SERVER['DB_TYPE'] ?? 'mysql'));

// Force sqlite if we are on Render and no specific DB_HOST is provided
if (getenv('RENDER') && !getenv('DB_HOST')) {
    $dbType = 'sqlite';
}

$host     = getenv('DB_HOST') ?: 'localhost';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$dbname   = getenv('DB_NAME') ?: 'songo_db';

try {
    if ($dbType === 'sqlite') {
        $dbPath = __DIR__ . '/songo.sqlite';
        $pdo = new PDO("sqlite:$dbPath");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "<h1>SQLite Database ensured!</h1>";
    } else {
        // 1. Connect without dbname to create it
        $pdo = new PDO("mysql:host=$host", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "<h1>MySQL Database '$dbname' ensured!</h1>";

        // 2. Connect with dbname
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    }
    
    $sql = file_get_contents('schema.sql');
    if ($dbType === 'sqlite') {
        // Remove DB creation/selection
        $sql = preg_replace('/CREATE DATABASE IF NOT EXISTS.*;/i', '', $sql);
        $sql = preg_replace('/USE .*;/', '', $sql);
        // Convert Auto-increment
        $sql = preg_replace('/INT AUTO_INCREMENT PRIMARY KEY/i', 'INTEGER PRIMARY KEY AUTOINCREMENT', $sql);
        // Remove ENUMs (converted to VARCHAR in schema.sql already, but just in case)
        $sql = preg_replace('/ENUM\([^)]+\)/i', 'VARCHAR(255)', $sql);
        // Remove ON UPDATE
        $sql = preg_replace('/ON UPDATE CURRENT_TIMESTAMP/i', '', $sql);
    }
    
    // Split by ; for multiple statements
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    foreach ($queries as $query) {
        if ($query) $pdo->exec($query);
    }

    // Migration : Ajouter les colonnes de noms si elles n'existent pas
    try {
        $pdo->exec("ALTER TABLE games ADD COLUMN p1_name VARCHAR(100) DEFAULT 'Joueur 1'");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE games ADD COLUMN p2_name VARCHAR(100) DEFAULT 'Joueur 2'");
    } catch (Exception $e) {}
    
    echo "<h1>Tables Setup Successful!</h1>";
    echo "<p>The 'games' table has been created/updated.</p>";
    echo "<a href='../index.php'>Go to Game</a>";
} catch (PDOException $e) {
    echo "<h1>Database Setup Failed</h1>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>Make sure your MySQL server is running and credentials are correct.</p>";
}
?>
