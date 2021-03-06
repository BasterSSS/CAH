<?php
session_start();
if(!isset($_SESSION['login']) || $_SESSION['login']==false){
    echo "0";
    exit();
} 
require_once('../connect_users.php');
$id = $_POST['id'];
$nick = $_SESSION['user'];
$kick = $_POST['kick'];
$last_change = floor(microtime(true) * 1000);
$dsn = "mysql:host=".$host.";dbname=".$db_name;
$pdo = new PDO($dsn, $db_user, $db_password);
$pdo->SetAttribute(PDO::ATTR_EMULATE_PREPARES, false);
$pdo->SetAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); 
try{
    $pdo->beginTransaction();
    $sql = "SELECT * FROM lobby WHERE lobby_id = :id AND owner = '$nick'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id'=>$id]);
    if($stmt->rowCount()==0){
        echo "0";
        exit();
    }
    $row = $stmt->fetch();
    $players_in_lobby = $row['players_in_lobby'];
    $round_started = $row['round_started'];
    $reset = $row['reset'];
    $game_started = $row['game_started'];
    $sql = "UPDATE cards_in_lobby SET owner = NULL, choosen = NULL WHERE lobby_id = :id AND owner = '$kick'";
    $stmt=$pdo->prepare($sql);
    $stmt->execute(['id'=>$id]);
    $sql  = "DELETE FROM cardsShuffled WHERE owner = '$nick'";
    $stmt= $pdo->prepare($sql);
    $stmt->execute();
    $sql = "SELECT * FROM players_in_lobby WHERE nick = '$kick' AND lobby_id = :id AND chooser = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id'=>$id]);
    if($stmt->rowCount()!=0){
        $player = $stmt->fetch();
        $player_id = $player['ID'];
        $sql = "UPDATE players_in_lobby SET chooser = 1 WHERE lobby_id = :id AND ID > $player_id AND afk = 0 LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id'=>$id]);
        if($stmt->rowCount()==0){
            $sql = "UPDATE players_in_lobby SET chooser = 1 WHERE lobby_id = :id AND afk = 0 LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id'=>$id]);
        }
        $sql = "UPDATE players_in_lobby SET chooser = 0 WHERE lobby_id = :id AND ID = $player_id LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id'=>$id]);
        $sql = "UPDATE cards_in_lobby SET choosen = NULL, owner = NULL WHERE owner = (SELECT nick FROM players_in_lobby WHERE chooser = 1 AND lobby_id = '$id') AND choosen IS NOT NULL";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }
    $sql = "DELETE FROM players_in_lobby WHERE nick = :kick AND lobby_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['kick'=>$kick, 'id'=>$id]);
    if($round_started == 0 && $reset == 1){
        $sql  = "UPDATE lobby SET round_started = 1 WHERE lobby_id = :id";
        $stmt= $pdo->prepare($sql);
        $stmt->execute(['id'=>$id]);
    }
    $sql = "UPDATE lobby SET players_in_lobby = players_in_lobby - 1, last_change_players = '$last_change' WHERE lobby_id = '$id'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $pdo->commit();
    if($players_in_lobby>3 && $round_started == 1){
        $sql = "SELECT * FROM cards_in_lobby WHERE choosen = 1 AND color = 'white' AND lobby_id = '$id'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        if($stmt->rowCount()==$players_in_lobby-2){
            $sql = "INSERT INTO cardsShuffled (value, owner, choosen, lobby_id) SELECT value, owner, choosen, lobby_id FROM cards_in_lobby WHERE lobby_id=:id AND choosen IS NOT NULL AND color = 'white' ORDER BY owner DESC, choosen ASC, RAND()";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['id'=>$id]);
            $sql = "UPDATE  lobby SET round_started = 0, reset = 0 WHERE lobby_id = :id";
            $stmt= $pdo->prepare($sql);
            $stmt->execute(['id'=>$id]);
            $new_time = floor(microtime(true) * 1000);
            $sql = "UPDATE lobby SET last_change_round = '$new_time' WHERE lobby_id = '$id'";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
        }
    }
}
catch(PDOException $e){
    $pdo->rollBack();
    $error_message = $e->getMessage();
    echo $error_message;

}
