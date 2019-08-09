<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
		$query = queryDB($db, "SELECT tvdb__Character.characterID, tvdb__Character.image, ANY_VALUE(oname.value) AS originalName, ANY_VALUE(local.value) AS name
                               FROM tvdb__Character
                                   LEFT JOIN (
                                       SELECT tvdb__acts.characterID, el.langID FROM tvdb__acts
                                       LEFT JOIN tvdb__Series AS el ON el.seriesID = tvdb__acts.seriesID
                                   ) AS tvdb__Series ON tvdb__Series.characterID = tvdb__Character.characterID
                                   LEFT JOIN tvdb__String AS oname ON oname.type = 5 AND oname.objectID = tvdb__Character.characterID AND oname.langID = IFNULL(tvdb__Series.langID, 1)
                                   LEFT JOIN tvdb__String AS local ON local.type = 5 AND local.objectID = tvdb__Character.characterID AND local.langID = ?
                               GROUP BY tvdb__Character.characterID", [$locale]);
		
        $results = $query -> fetchAll(PDO::FETCH_ASSOC);
        
        foreach($results as &$result) {
			$result["characterID"] = intval($result["characterID"]);
			$result["name"] = emptyOrNull($result["name"], $result["originalName"]);
            $result["originalName"] = ($result["name"] === $result["originalName"] ? NULL : $result["originalName"]);
		}
		unset($result);
		
        echo(json_encode($results));  // return data as JSON
		
    }, METHOD_POST);
?>