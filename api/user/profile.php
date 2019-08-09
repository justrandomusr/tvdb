<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
        $query = queryDB($db, "SELECT userID, username, tvdb__Language.name AS language, profileDesc, avatar FROM tvdb__User
								   LEFT JOIN tvdb__Language ON tvdb__Language.langID = tvdb__User.langID
							   WHERE userID = ?", [$args["user_id"]]);
        $result = resultOrExit($query);
		
		$result["userID"] = intval($result["userID"]);
        
        // get top genres

        $query = queryDB($db, "SELECT tvdb__Genre.genreID, tvdb__Genre.name FROM tvdb__inList
							       JOIN tvdb__inGenre ON tvdb__inGenre.seriesID = tvdb__inList.seriesID
							       JOIN tvdb__Genre ON tvdb__Genre.genreID = tvdb__inGenre.genreID
							   WHERE tvdb__inList.userID = ?
							   GROUP BY tvdb__inGenre.genreID
							   ORDER BY COUNT(tvdb__inList.listID) DESC
							   LIMIT 5", [$args["user_id"]]);
		
        while($row = $query -> fetch(PDO::FETCH_ASSOC)) {
			$result["genres"][] = $row;
		}

        // get top rated series
        
		$query = queryDB($db, "SELECT tvdb__Series.seriesID, tvdb__Series.image, oname.value AS originalName, local.value AS name FROM tvdb__inList
							       JOIN tvdb__Series ON tvdb__Series.seriesID = tvdb__inList.seriesID
							       LEFT JOIN tvdb__String AS oname ON oname.type = 0 AND oname.objectID = tvdb__Series.seriesID AND oname.langID = tvdb__Series.langID
							       LEFT JOIN tvdb__String AS local ON local.type = 0 AND local.objectID = tvdb__Series.seriesID AND local.langID = ?
							   WHERE tvdb__inList.userID = ? AND tvdb__inList.state = 1
							   ORDER BY tvdb__inList.rating DESC
							   LIMIT 5", [$locale, $args["user_id"]]);
		
        $series = $query -> fetchAll(PDO::FETCH_ASSOC);
        
        foreach($series as &$entry) {
			$entry["seriesID"] = intval($entry["seriesID"]);
			$entry["name"] = emptyOrNull($entry["name"], $entry["originalName"]);
            $entry["originalName"] = ($entry["name"] === $entry["originalName"] ? NULL : $entry["originalName"]);
		}
		unset($entry);
		
		$result["series"] = $series;
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["user_id"]);
?>