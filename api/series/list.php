<?php
    include "../.api.php";
	
    apiCall(function($args) use ($db, $locale) {
		$query_params = [$locale];
		
		$genre = emptyOrNull($_POST["genre"], false);
		$year = emptyOrNull(intval($_POST["year"]), false);
		
		if($genre) {
			$query_params[] = $genre;
		}
		if($year) {
			$query_params[] = $year;
		}
		
		$query = queryDB($db, "SELECT tvdb__Series.seriesID, tvdb__Series.image, ANY_VALUE(oname.value) AS originalName, ANY_VALUE(local.value) AS name
                               FROM ".($genre ? "tvdb__inGenre LEFT JOIN tvdb__Series ON tvdb__Series.seriesID = tvdb__inGenre.seriesID" : "tvdb__Series")."
                                   LEFT JOIN tvdb__String AS oname ON oname.type = 0 AND oname.objectID = tvdb__Series.seriesID AND oname.langID = tvdb__Series.langID
                                   LEFT JOIN tvdb__String AS local ON local.type = 0 AND local.objectID = tvdb__Series.seriesID AND local.langID = ?
                                   LEFT JOIN tvdb__inList ON tvdb__inList.seriesID = tvdb__Series.seriesID"
                               .($genre || $year ? " WHERE " : "").($genre ? "tvdb__inGenre.genreID = ?" : "").($year && $genre ? " AND " : "").($year ? "tvdb__Series.year = ?" : "")."
                               GROUP BY tvdb__Series.seriesID
                               ORDER BY AVG(tvdb__inList.rating) DESC", $query_params);
		
        $results = $query -> fetchAll(PDO::FETCH_ASSOC);
        
        foreach($results as &$result) {
			$result["seriesID"] = intval($result["seriesID"]);
			$result["name"] = emptyOrNull($result["name"], $result["originalName"]);
            $result["originalName"] = ($result["name"] === $result["originalName"] ? NULL : $result["originalName"]);
		}
		unset($result);
		
        echo(json_encode($results));  // return data as JSON
		
    }, METHOD_POST);
?>