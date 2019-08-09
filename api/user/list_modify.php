<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $user_id) {
		$result = ["success" => false];
		
		if(in_array($args["field"], ["state", "progress", "rating", "rewatched"])) {
			$query = queryDB($db, "UPDATE tvdb__inList SET ".$args["field"]." = ? WHERE seriesID = ? AND userID = ?", [$args["value"], $args["series_id"], $user_id]);
			
			if($query -> rowCount() > 0) {
				$result["success"] = true;
			}
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["series_id", "field", "value"]);
?>