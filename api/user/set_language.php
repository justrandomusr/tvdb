<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $user_id) {
		$result = ["success" => false];
		
		$query = queryDB($db, "UPDATE tvdb__User SET langID = ? WHERE userID = ?", [$args["language"], $user_id]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["language"]);
?>