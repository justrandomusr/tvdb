<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale, $user_id) {
		$result = ["success" => false];
		
		$query = queryDB($db, "INSERT INTO tvdb__inList (userID, seriesID, state) VALUES (?, ?, ?)", [$user_id, $args["series_id"], 2]);
		
		if($query -> rowCount() > 0) {
			$result["success"] = true;
			
			$query = queryDB($db, "SELECT tvdb__Series.seriesID, tvdb__Series.image, oname.value AS originalName, local.value AS name, tvdb__inList.progress, tvdb__inList.rewatched, tvdb__inList.rating, COUNT(tvdb__Episode.episodeID) AS episodes
								   FROM tvdb__inList
									   JOIN tvdb__Series ON tvdb__Series.seriesID = tvdb__inList.seriesID
									   LEFT JOIN tvdb__Episode ON tvdb__Episode.seriesID = tvdb__inList.seriesID
									   LEFT JOIN tvdb__String AS oname ON oname.type = 0 AND oname.objectID = tvdb__Series.seriesID AND oname.langID = tvdb__Series.langID
									   LEFT JOIN tvdb__String AS local ON local.type = 0 AND local.objectID = tvdb__Series.seriesID AND local.langID = ?
								   WHERE tvdb__inList.userID = ? AND tvdb__inList.seriesID = ?", [$locale, $user_id, $args["series_id"]]);
							   
			$entry = resultOrExit($query, json_encode($result));
			
			$entry["progress"] = intval($entry["progress"]);
			$entry["rewatched"] = intval($entry["rewatched"]);
			$entry["rating"] = isset($entry["rating"]) ? floatval($entry["rating"]) : NULL;
			$entry["seriesID"] = intval($entry["seriesID"]);
			$entry["episodes"] = intval($entry["episodes"]);
			
			$entry["name"] = emptyOrNull($entry["name"], $entry["originalName"]);
			$entry["originalName"] = ($entry["name"] === $entry["originalName"] ? NULL : $entry["originalName"]);
			
			$result["entry"] = $entry;
		}
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["series_id"]);
?>