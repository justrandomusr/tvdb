<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
		$query = queryDB($db, "SELECT tvdb__User.userID, username, avatar FROM tvdb__User
								   LEFT JOIN tvdb__inList ON tvdb__inList.userID = tvdb__User.userID
							   GROUP BY tvdb__User.userID
							   ORDER BY COUNT(tvdb__inList.listID) DESC");
		
        $results = $query -> fetchAll(PDO::FETCH_ASSOC);
        
        foreach($results as &$result) {
			$result["userID"] = intval($result["userID"]);
		}
		unset($result);
		
        echo(json_encode($results));  // return data as JSON
		
    }, METHOD_POST);
?>