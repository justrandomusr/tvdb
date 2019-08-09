<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $role) {
		if($role < ROLE_EDITOR) {
			exit("{\"success\": false, \"error\": \"Insufficient Permissions\"}");
		}
		
		$result = ["success" => false];
		
		$query = queryDB($db, "DELETE FROM tvdb__related WHERE seriesIDA = ? AND seriesIDB = ?", [$args["series_id_a"], $args["series_id_b"]]);
		$query = queryDB($db, "DELETE FROM tvdb__related WHERE seriesIDA = ? AND seriesIDB = ?", [$args["series_id_b"], $args["series_id_a"]]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["series_id_a", "series_id_b"]);
?>