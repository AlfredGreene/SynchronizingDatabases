<?php

/*
input->'sync_date' - datum poslední synchronizace s serverem. 
output -> $arr - pole dotazu, posila se do javascriptu
do vystupniho pole se zapisujou data v pořadku: 1. index - počet dotazu, dvojice dotaz(sudý index) a pole parametrů (lichy index)
*/
	$sync_date = $_GET['sync_date'];
	include('app/connectDB.php');


	$prepared = $dbh -> prepare("SELECT * FROM queries WHERE date > ? ");			
	$prepared -> execute(array($sync_date));
		
	$num_rows = $prepared -> rowCount();

	$array = array();
	array_push($array, $num_rows);

	while($row = $prepared->fetch()){
		array_push($arr, $row[0]);
		$parameter = explode(',', $row[1]);
		array_push($array, $parameter);
		
		}

	echo json_encode($array);

