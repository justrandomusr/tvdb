<?php
    const METHOD_POST = "POST";
    const METHOD_GET = "GET";
	
	const LOCALE_ENGLISH = 1;
	
	const ROLE_NONE = 0;
	const ROLE_EDITOR = 1;
	
	const STATES = ["watching", "finished", "planned", "on_hold", "dropped"];
	const RELATION = ["prequel", "sequel", "alternative", "other"];
	
	$user_id = -1;
	$locale = LOCALE_ENGLISH;
	$role = ROLE_NONE;
	
	ini_set("display_errors", 1);
	error_reporting(E_ALL & ~E_NOTICE);

	// connect to database and initialize
    $db = new PDO('mysql:host=;dbname=', '', '');
    $db -> query('SET NAMES utf8');

	$query = queryDB($db, "SELECT userID, langID, role FROM tvdb__User WHERE auth = ?", [$_POST["token"] ?? ""]);  // get user's preferred locale if token valid
	if($query -> rowCount() === 1) {
		$res = $query -> fetch();
		$user_id = intval($res["userID"]);
		$locale = intval($res["langID"]);
		$role = intval($res["role"]);
	}
	
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST");
	header("Access-Control-Allow-Headers: X-Requested-With, Content-Type");


	/**
	 * API-related functions
	**/
	
	/**
	 * Prepare and execute a database query with given $params
	**/
    function queryDB($db, $query, Array $params = []) {
        $sql = $db -> prepare($query);
        $sql -> execute($params);
        return $sql;
    }
	
	/**
	 * Check if a single-result query has exactly one result and return it, else return empty JSON and exit
	**/
	function resultOrExit($query, String $result = "{}") {
		if($query -> rowCount() === 1) {
			return $query -> fetch(PDO::FETCH_ASSOC);  // return the first result as an associative array
		}
		else {
			exit($result);  // return empty JSON and exit
		}
	}
	
	/**
	 * API helper function, will run $callback and pass request data as well as request locale if all requirements are met and parameters in $required are given
	**/
    function apiCall(Callable $callback, $method, Array $required = []) {
		if($_SERVER["REQUEST_METHOD"] !== $method) {  // check for required request method
			echo("Error: Expected request method ".$method);
			return;
		}
		
		switch ($method) {  // $data contains the parameters passed for the specified request type
            case METHOD_GET:
                $data = $_GET;
                break;
            default:
                $data = $_POST;
        }

        foreach($required as $param) {  // check if $data contains all parameters in $required
            if(!isset($data[$param])) {
                echo("Error: Missing parameter \"".$param."\"");
                return;
            }
        }
		
		header("Content-Type: application/json");  // prepare returning a result to the client

        $callback($data);
    }
	
	/**
	 * If $var not empty and not null, return $var, else return $def
	**/
	function emptyOrNull($var, $def) {
		if(isset($var)) {
			return $var;
		}
		return $def;
	}
?>
