<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $role) {
		if($role < ROLE_EDITOR) {
			exit("{\"success\": false, \"error\": \"Insufficient Permissions\"}");
		}
		
		$result = ["success" => false];
		
		$query = queryDB($db, "INSERT INTO tvdb__Episode (seriesID, number, link) VALUES(?, ?, ?)", [$args["series_id"], $args["number"], $args["link"]]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
			$result["episodeID"] = $db -> lastInsertId();
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["series_id", "number", "link"]);
?>