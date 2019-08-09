<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db) {
		$query = queryDB($db, "SELECT value FROM tvdb__String
							   WHERE langID = ? AND objectID = ? AND type = ?", [$args["language_id"], $args["object_id"], $args["object_type"]]);
		
        $result = resultOrExit($query, "{\"value\": null}");
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["language_id", "object_id", "object_type"]);
?>