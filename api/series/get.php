<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
        $query = queryDB($db, "SELECT tvdb__Series.seriesID, tvdb__Series.langID, tvdb__Series.year, tvdb__Series.image, AVG(tvdb__inList.rating) AS rating FROM tvdb__Series
							       LEFT JOIN tvdb__inList ON tvdb__inList.seriesID = tvdb__Series.seriesID
							   WHERE tvdb__Series.seriesID = ?
							   GROUP BY tvdb__Series.seriesID", [$args["series_id"]]);
        $result = resultOrExit($query);
		
		$result["seriesID"] = intval($result["seriesID"]);
		$result["langID"] = intval($result["langID"]);
		$result["rating"] = floatval($result["rating"]);
		
		$query = queryDB($db, "SELECT langID, type, value FROM tvdb__String WHERE objectID = ? AND type IN (0, 1, 2) AND langID IN (?, ?)",
						 [$args["series_id"], $result["langID"], $locale]);
		
		$stringNames = ["name", "description", "summary"];
		
		while($row = $query -> fetch(PDO::FETCH_ASSOC)) {  // map returned data to its respective types
			if($row["langID"] == $result["langID"]) {
				$originalStrings[$stringNames[$row["type"]]] = $row["value"];
			}
			else {
				$localizedStrings[$stringNames[$row["type"]]] = $row["value"];
			}
		}
		
		// insert metadata in the user's preferred language
		$result["name"] = emptyOrNull($localizedStrings["name"], $originalStrings["name"]);
		$result["originalName"] = ($result["name"] === $originalStrings["name"] ? NULL : $originalStrings["name"]);
		$result["description"] = emptyOrNull($localizedStrings["description"], $originalStrings["description"]);
        $result["summary"] = emptyOrNull($localizedStrings["summary"], $originalStrings["summary"]);
        
        // get genres

        $query = queryDB($db, "SELECT tvdb__Genre.genreID, tvdb__Genre.name FROM tvdb__inGenre
                                   INNER JOIN tvdb__Genre ON tvdb__Genre.genreID = tvdb__inGenre.genreID
                               WHERE tvdb__inGenre.seriesID = ?", [$args["series_id"]]);
		
		$genres = $query -> fetchAll(PDO::FETCH_ASSOC);
		
		foreach($genres as &$genre) {
			$genre["genreID"] = intval($genre["genreID"]);
		}
		unset($genre);
        
        $result["genres"] = $genres;
		
		// get related series
		
		$query = queryDB($db, "SELECT tvdb__Series.seriesID, tvdb__Series.image, tvdb__related.relationType, oname.value AS originalName, local.value AS name
                               FROM tvdb__related
                                   INNER JOIN tvdb__Series ON tvdb__Series.seriesID = tvdb__related.seriesIDB
                                   LEFT JOIN tvdb__String AS oname ON oname.type = 0 AND oname.objectID = tvdb__Series.seriesID AND oname.langID = tvdb__Series.langID
                                   LEFT JOIN tvdb__String AS local ON local.type = 0 AND local.objectID = tvdb__Series.seriesID AND local.langID = ?
                               WHERE tvdb__related.seriesIDA = ?", [$locale, $args["series_id"]]);
        
        $relations = [];

        while($related = $query -> fetch(PDO::FETCH_ASSOC)) {
			$related["seriesID"] = intval($related["seriesID"]);
			$related["name"] = emptyOrNull($related["name"], $related["originalName"]);
            $related["originalName"] = ($related["name"] === $related["originalName"] ? NULL : $related["originalName"]);
			
			$relations[RELATION[$related["relationType"]]][] = &$related;
			
			unset($related["relationType"]);
			unset($related);  // value is copied to the array and then dereferenced
		}
		
		$result["relations"] = $relations;
		
		// get all episodes
		
		$query = queryDB($db, "SELECT episodeID, number, link, oname.value AS originalName, local.value AS name FROM tvdb__Episode
							       LEFT JOIN tvdb__String AS oname ON oname.type = 3 AND oname.objectID = tvdb__Episode.episodeID AND oname.langID = ?
							       LEFT JOIN tvdb__String AS local ON local.type = 3 AND local.objectID = tvdb__Episode.episodeID AND local.langID = ?
							   WHERE seriesID = ? ORDER BY number ASC", [$result["langID"], $locale, $args["series_id"]]);
		
		$episodes = $query -> fetchAll(PDO::FETCH_ASSOC);;
		
		foreach($episodes as &$episode) {
			$episode["episodeID"] = intval($episode["episodeID"]);
			$episode["name"] = emptyOrNull($episode["name"], $episode["originalName"]);
			$episode["originalName"] = ($episode["name"] === $episode["originalName"] ? NULL : $episode["originalName"]);
			$episode["number"] = floatval($episode["number"]);
		}
		unset($episode);
		
		usort($episodes, function($a, $b) {
			return $a["number"] > $b["number"] ? 1 : -1;
		});
		
		$result["episodes"] = $episodes;
		
		// get all characters
		
		$query = queryDB($db, "SELECT tvdb__Character.characterID, tvdb__Character.image, tvdb__Character.birthday, oname.value AS originalName, local.value AS name
							   FROM tvdb__acts
								   JOIN tvdb__Character ON tvdb__Character.characterID = tvdb__acts.characterID
								   LEFT JOIN tvdb__String AS oname ON oname.type = 5 AND oname.objectID = tvdb__Character.characterID AND oname.langID = ?
								   LEFT JOIN tvdb__String AS local ON local.type = 5 AND local.objectID = tvdb__Character.characterID AND local.langID = ?
							   WHERE seriesID = ?", [$result["langID"], $locale, $args["series_id"]]);
		
		$characters = $query -> fetchAll(PDO::FETCH_ASSOC);
		
		foreach($characters as &$character) {
			$character["characterID"] = intval($character["characterID"]);
			$character["name"] = emptyOrNull($character["name"], $character["originalName"]);
			$character["originalName"] = ($character["name"] === $character["originalName"] ? NULL : $character["originalName"]);
		}
		unset($character);
		
		$result["characters"] = $characters;
		
		// get view counts, etc.
		
		$query = queryDB($db, "SELECT state, COUNT(listID) AS amount FROM tvdb__inList
							   WHERE seriesID = ?
							   GROUP BY state", [$args["series_id"]]);
		
		$stats = [];
		
		
		while($stat = $query -> fetch(PDO::FETCH_ASSOC)) {
			$stats[STATES[$stat["state"]]] = intval($stat["amount"]);
		}
		
		$result["stats"] = $stats;
		
		
        echo(json_encode($result));  // return data as JSON
		
    }, METHOD_POST, ["series_id"]);
?>