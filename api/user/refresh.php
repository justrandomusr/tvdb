<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db) {
		$auth = bin2hex(random_bytes(18));
		
		$query = queryDB($db, "UPDATE tvdb__User SET auth = ?
							   WHERE auth = ?", [$auth, $args["token"]]);
		
        $query = queryDB($db, "SELECT userID, auth, username, langID, role, avatar FROM tvdb__User
							   WHERE auth = ?", [$auth]);  // if token was valid the auth column should now have the value of $auth
        $result = resultOrExit($query, "{\"success\": false}");
		
		$result["userID"] = intval($result["userID"]);
		$result["langID"] = intval($result["langID"]);
		$result["role"] = intval($result["role"]);
		$result["success"] = true;
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["token"]);
?>