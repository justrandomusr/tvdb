<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $role) {
		if($role < ROLE_EDITOR) {
			exit("{\"success\": false, \"error\": \"Insufficient Permissions\"}");
		}
		
		$result = ["success" => false];
		
		$query = queryDB($db, "DELETE FROM tvdb__Character WHERE characterID = ?", [$args["character_id"]]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["character_id"]);
?>