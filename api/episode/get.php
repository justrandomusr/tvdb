<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
        $query = queryDB($db, "SELECT * FROM tvdb__Episode WHERE episodeID = ?", [$args["episode_id"]]);
        $result = resultOrExit($query);
        
		$result["episodeID"] = intval($result["episodeID"]);
		$result["number"] = floatval($result["number"]);
		
        // get basic series metadata

        $series_language = LOCALE_ENGLISH;

        $query = queryDB($db, "SELECT tvdb__Series.seriesID, tvdb__Series.langID, tvdb__Series.image, oname.value AS originalName, local.value AS name
                               FROM tvdb__Series
                                   LEFT JOIN tvdb__String AS oname ON oname.type = 0 AND oname.objectID = tvdb__Series.seriesID AND oname.langID = tvdb__Series.langID
                                   LEFT JOIN tvdb__String AS local ON local.type = 0 AND local.objectID = tvdb__Series.seriesID AND local.langID = ?
                               WHERE tvdb__Series.seriesID = ?", [$locale, $result["seriesID"]]);
        
        $series = resultOrExit($query);

		$series["name"] = emptyOrNull($series["name"], $series["originalName"]);
		$series["originalName"] = ($series["name"] === $series["originalName"] ? NULL : $series["originalName"]);
		$series_language = $series["langID"];
		unset($series["langID"]);
		
		$result["series"] = $series;

        unset($result["seriesID"]);

        // populate with (localized) strings
        
		$query = queryDB($db, "SELECT langID, type, value FROM tvdb__String WHERE objectID = ? AND type IN (3, 4) AND langID IN (?, ?)",
						 [$args["episode_id"], $series_language, $locale]);
		
		$stringNames = ["name", "description"];
		
		while($row = $query -> fetch(PDO::FETCH_ASSOC)) {  // map returned data to its respective types
			if($row["langID"] == $series_language) {
				$originalStrings[$stringNames[$row["type"] - 3]] = $row["value"];
			}
			else {
				$localizedStrings[$stringNames[$row["type"] - 3]] = $row["value"];
			}
		}
		
		// insert metadata in the user's preferred language
		$result["name"] = emptyOrNull($localizedStrings["name"], $originalStrings["name"]);
		$result["originalName"] = ($result["name"] === $originalStrings["name"] ? NULL : $originalStrings["name"]);
		$result["description"] = emptyOrNull($localizedStrings["description"], $originalStrings["description"]);
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["episode_id"]);
?>