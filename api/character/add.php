<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $role) {
		if($role < ROLE_EDITOR) {
			exit("{\"success\": false, \"error\": \"Insufficient Permissions\"}");
		}
		
		$result = ["success" => false];
		
		$query = queryDB($db, "INSERT INTO tvdb__Character (birthday, image) VALUES(?, ?)", [$args["birthday"], $args["image"]]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
			$result["characterID"] = $db -> lastInsertId();
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["birthday", "image"]);
?>