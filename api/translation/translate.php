<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $role) {
		if($role < ROLE_EDITOR) {
			exit("{\"success\": false, \"error\": \"Insufficient Permissions\"}");
		}
		
		$result = ["success" => false];
		
		if(!empty($args["value"])) {  // only allow actual translations, no empty stubs
			$query = queryDB($db, "INSERT INTO tvdb__String (langID, objectID, type, value) VALUES (?, ?, ?, ?)
								   ON DUPLICATE KEY UPDATE value = ?", [$args["language_id"], $args["object_id"], $args["object_type"], $args["value"], $args["value"]]);
			
			if($query -> rowCount() > 0) {
				$result["success"] = true;
			}
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["language_id", "object_id", "object_type", "value"]);
?>