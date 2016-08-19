<?php
/* 
	input parameter -> stringed array - pole dotazů které se provedou (prvni index - počet dotazu. Pak dvojice: dotaz(sudý index) a pole parametrů(lichý index))
	Do tabulky queries(query, param, date) ve vzdalené databazi se zapišou tý stejny dotazy s aktualni datou v sekundech
	
*/
	$array = json_decode(str_replace('\\', '', $_POST['queries']));
		
	include('app/connectDB.php');

	$sql = "INSERT INTO queries(query, param, date) VALUES(?, ?, ?)";
	
	

	for($i = 1; $i <= $array[0] * 2; $i++){
		$param = array(); //for INSERT INTO QUERY

		$prepared = $dbh->prepare($array[$i]);
		array_push($param, $array[$i]);
		$i++;
		$prepared->execute($array[$i]);		//querying database
		
		array_push($param, implode(",", $array[$i])); 
		array_push($param, time())	;
		$prepared = $dbh->prepare($sql);  
		$prepared->execute($param);  //INSERT into queries(query, param, date)
	}
		