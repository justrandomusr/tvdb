<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $role) {
		if($role < ROLE_EDITOR) {
			exit("{\"success\": false, \"error\": \"Insufficient Permissions\"}");
		}
		
		$result = ["success" => false];
		
		$relationType2 = intval($args["relation_type"]);
		
		if($relationType2 == 0) {
			$relationType2 = 1;
		}
		else if($relationType2 == 1) {
			$relationType2 = 0;
		}
		
		
		$query = queryDB($db, "INSERT INTO tvdb__related (seriesIDA, seriesIDB, relationType) VALUES (?, ?, ?)", [$args["series_id_a"], $args["series_id_b"], $args["relation_type"]]);
		$query = queryDB($db, "INSERT INTO tvdb__related (seriesIDA, seriesIDB, relationType) VALUES (?, ?, ?)", [$args["series_id_b"], $args["series_id_a"], $relationType2]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["series_id_a", "series_id_b", "relation_type"]);
?>