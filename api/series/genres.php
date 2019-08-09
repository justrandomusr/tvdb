<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
		$query = queryDB($db, "SELECT * FROM tvdb__Genre");
		
        $results = $query -> fetchAll(PDO::FETCH_ASSOC);
		
		foreach($results as &$result) {
			$result["genreID"] = intval($result["genreID"]);
		}
		unset($result);
		
        echo(json_encode($results));  // return data as JSON
		
    }, METHOD_POST);
?>