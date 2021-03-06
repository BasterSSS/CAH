<?php
ini_set('display_errors','0');
session_start();
require_once ('connect_users.php');
if(!isset($_SESSION['login']) || $_SESSION['login']==false){
    echo "0";
    exit();
}
$nick = $_SESSION['user'];
$color = $_GET['color'];
$text = $_GET['value'];
$deck_code = $_GET['deck_code'];

if($color=="white" && empty($text)){
	echo "0";
	exit();
}
if($color == "black"){
	$count_space = 	substr_count($text, ' ___');
	if($count_space == 0 || $count_space > 3) {
	echo "0";
	exit();
	}
	$count = 	substr_count($text, ' ____');
	if($count != 0) {
	echo "0";
	exit();
	}
	if($color == "white" && strlen($text)> 170){
		echo "0";
		exit();
	}
	if($color == "black" && strlen($text)> 200){
		echo "0";
		exit();
	}
}
try{
	$dsn = "mysql:host=".$host.";dbname=".$db_name;
	$pdo = new PDO($dsn, $db_user, $db_password);
	$pdo->SetAttribute(PDO::ATTR_EMULATE_PREPARES, false);
	$pdo->SetAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
	$sql = "SELECT * FROM decks WHERE BINARY deck_code = :deck_code AND BINARY author = '$nick'";
	$stmt = $pdo->prepare($sql);
	$stmt->execute(['deck_code'=>$deck_code]);
	$row = $stmt->fetch();
	if($stmt->rowCount()==0){
		header('Location: index.php');	
		exit();
	}
	$pdo->beginTransaction();
	if($color=="white"){
		$sql = "INSERT INTO cards (deck_code, value, color) VALUES (:deck_code, :text, 'white')";
		$stmt = $pdo->prepare($sql);
		$stmt->execute(['deck_code'=>$deck_code, 'text' => $text]);
		$sql = "UPDATE decks SET white_cards = white_cards + 1 WHERE BINARY deck_code = :deck_code";
		$stmt = $pdo->prepare($sql);
		$stmt->execute(['deck_code'=>$deck_code]);
	}
	else{
		$sql = "INSERT INTO cards (deck_code, value, color, blank_space) VALUES (:deck_code, :text, 'black', $count_space)";
		$stmt = $pdo->prepare($sql);
		$stmt->execute(['deck_code'=>$deck_code, 'text' => $text]);
		$sql = "UPDATE decks SET black_cards = black_cards + 1 WHERE BINARY deck_code = :deck_code";
		$stmt = $pdo->prepare($sql);
		$stmt->execute(['deck_code'=>$deck_code]);
	}
	$sql = "SELECT ID FROM cards WHERE BINARY deck_code = :deck_code ORDER BY `cards`.`ID` DESC LIMIT 1";
	$stmt = $pdo->prepare($sql);
	$stmt->execute(['deck_code'=>$deck_code]);
	$ID = $stmt->fetch();
	echo $ID['ID'];
	$pdo->commit();
	
}
catch(PDOException $e){
	$pdo->rollBack();
	$error_message = $e->getMessage();
	echo $error_message;
}
