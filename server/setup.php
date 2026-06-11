<?php
// setup.php
$host = 'localhost';
$username = 'root'; // Change if needed
$password = '';     // Change if needed
$dbname = 'songo_db';

try {
    // 1. Connect without dbname to create it
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<h1>Database '$dbname' ensured!</h1>";

    // 2. Connect with dbname
    $pdo->exec("USE `$dbname` "); // Just to be sure, though we specify it in next line
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    $sql = file_get_contents('schema.sql');
    $pdo->exec($sql);
    
    echo "<h1>Tables Setup Successful!</h1>";
    echo "<p>The 'games' table has been created/updated.</p>";
    echo "<a href='../index.php'>Go to Game</a>";
} catch (PDOException $e) {
    echo "<h1>Database Setup Failed</h1>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>Make sure your MySQL server is running and credentials are correct.</p>";
}
?>
