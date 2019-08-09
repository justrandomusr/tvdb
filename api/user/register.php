<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db) {
		$result = ["success" => false];
		
		if(!empty($args["username"]) && !empty($args["pass"])) {  // only allow actual translations, no empty stubs
			$query = queryDB($db, "INSERT INTO tvdb__User (username, passHash) VALUES (?, ?)", [$args["username"], hash("sha512", $args["pass"])]);
			
			if($query -> rowCount() > 0) {
				$result["success"] = true;
			}
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["username", "pass"]);
?>