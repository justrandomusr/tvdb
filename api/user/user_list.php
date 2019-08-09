<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
        $query = queryDB($db, "SELECT tvdb__Series.seriesID, tvdb__Series.image, oname.value AS originalName, local.value AS name, tvdb__inList.progress, tvdb__inList.rating, tvdb__inList.state, COUNT(tvdb__Episode.episodeID) AS episodes
							   FROM tvdb__inList
							       JOIN tvdb__Series ON tvdb__Series.seriesID = tvdb__inList.seriesID
								   LEFT JOIN tvdb__Episode ON tvdb__Episode.seriesID = tvdb__inList.seriesID
							       LEFT JOIN tvdb__String AS oname ON oname.type = 0 AND oname.objectID = tvdb__Series.seriesID AND oname.langID = tvdb__Series.langID
							       LEFT JOIN tvdb__String AS local ON local.type = 0 AND local.objectID = tvdb__Series.seriesID AND local.langID = ?
							   WHERE tvdb__inList.userID = ?
							   GROUP BY tvdb__inList.listID", [$locale, $args["user_id"]]);
		$entries = [];
		
        
        while($entry = $query -> fetch(PDO::FETCH_ASSOC)) {
			$entry["progress"] = intval($entry["progress"]);
			$entry["rating"] = isset($entry["rating"]) ? floatval($entry["rating"]) : NULL;
			$entry["seriesID"] = intval($entry["seriesID"]);
			$entry["episodes"] = intval($entry["episodes"]);
			
			$entry["name"] = emptyOrNull($entry["name"], $entry["originalName"]);
            $entry["originalName"] = ($entry["name"] === $entry["originalName"] ? NULL : $entry["originalName"]);
			
			$entries[STATES[$entry["state"]]][] = &$entry;
			
			unset($entry["state"]);
			unset($entry);  // value is copied to the array and then dereferenced
		}
		
        echo(json_encode($entries));  // return data as JSON
		
    }, METHOD_POST, ["user_id"]);
?>