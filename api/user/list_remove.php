<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $user_id) {
		$result = ["success" => false];
		
		$query = queryDB($db, "DELETE FROM tvdb__inList WHERE seriesID = ? AND userID = ?", [$args["series_id"], $user_id]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["series_id"]);
?>