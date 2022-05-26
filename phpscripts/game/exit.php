<?php
session_start();
$nick = $_SESSION['user'];
ignore_user_abort(true);
$last_change = floor(microtime(true) * 1000);
ini_set('display_errors','0');
$_SESSION['game']= false;
try{
    require_once('../connect_users.php');
    $dsn = "mysql:host=".$host.";dbname=".$db_name;
    $pdo = new PDO($dsn, $db_user, $db_password);
    $pdo->SetAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $pdo->SetAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->beginTransaction();
    $sql = "SELECT * FROM players_in_lobby WHERE nick = '$nick'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $row = $stmt->fetch();
    $lobby_id = $row['lobby_id'];
    $sql = "SELECT * FROM lobby WHERE lobby_id = '$lobby_id'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $row = $stmt->fetch();
    $owner = $row['owner'];
    $last_change_players = floor(microtime(true) * 1000);;
    $last_change_lobby = $row['last_change'];
    $abs = abs($last_change_players - $last_change_lobby);
    $sql = "DELETE FROM players_in_lobby WHERE nick = '$nick'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $sql = "UPDATE lobby SET players_in_lobby = players_in_lobby-1 WHERE lobby_id = '$lobby_id'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $sql = "UPDATE lobby SET last_change_players = '$last_change' WHERE lobby_id = '$lobby_id'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();  
    $sql = "UPDATE cards_in_lobby SET owner = NULL WHERE lobby_id = :id AND owner = '$nick'";
    $stmt=$pdo->prepare($sql);
    $stmt->execute(['id'=>$lobby_id]);
    $sql = "SELECT * FROM players_in_lobby WHERE nick = '$nick' AND lobby_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id'=>$id]);
    $sql = "SELECT * FROM players_in_lobby WHERE lobby_id = '$lobby_id' LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $row = $stmt->fetch();
    if($stmt->rowCount()!=0){
        if($nick==$owner){
            if($abs>3000){
                $new_owner = $row['nick'];
                $sql = "UPDATE lobby SET owner = '$new_owner' WHERE lobby_id = '$lobby_id'";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
        }
    }
    $pdo->commit();
}
catch(PDOException $e){
    $pdo->rollBack();
    $error_message = $e->getMessage();
}