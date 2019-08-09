<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
		$query = queryDB($db, "SELECT * FROM tvdb__Language");
		
        $results = $query -> fetchAll(PDO::FETCH_ASSOC);
		
		foreach($results as &$result) {
			$result["langID"] = intval($result["langID"]);
		}
		unset($result);
		
        echo(json_encode($results));  // return data as JSON
		
    }, METHOD_POST);
?>