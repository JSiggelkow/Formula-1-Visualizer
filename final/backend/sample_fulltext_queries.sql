-- Full-Text Search Examples for Driver Bio Content
-- These queries demonstrate natural language search capabilities on the 'about' field

-- Example 1: Search for drivers with "championship" or "world champion" in their bio
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    MATCH(about) AGAINST ('championship world champion' IN NATURAL LANGUAGE MODE) as relevance_score,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('championship world champion' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC;

SELECT 
    driverId,
    forename,
    surname,
    nationality,
    MATCH(about) AGAINST ('retired' IN NATURAL LANGUAGE MODE) as relevance_score,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('retired' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC;

-- Example 2: Search for drivers from specific teams/constructors mentioned in their bio
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    MATCH(about) AGAINST ('McLaren Ferrari Mercedes' IN NATURAL LANGUAGE MODE) as relevance_score,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('McLaren Ferrari Mercedes' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC;

-- Example 3: Boolean search for drivers who raced in Formula One AND won races
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('+Formula +One +won +races' IN BOOLEAN MODE);

-- Example 4: Search across names and bio content simultaneously
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    MATCH(forename, surname, about) AGAINST ('Hamilton championship' IN NATURAL LANGUAGE MODE) as relevance_score,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(forename, surname, about) AGAINST ('Hamilton championship' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC;

-- Example 5: Find drivers with specific career achievements
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    MATCH(about) AGAINST ('debut retirement career victory' IN NATURAL LANGUAGE MODE) as relevance_score,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('debut retirement career victory' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC;

-- Example 6: Search with wildcards and exclusions (Boolean mode)
-- Find drivers who raced but exclude test drivers
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('+racing +driver -test -reserve' IN BOOLEAN MODE);

-- Example 7: Phrase search for exact matches
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    LEFT(about, 200) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('"Formula One World Championship"' IN BOOLEAN MODE);

-- Example 8: Natural language search with minimum relevance threshold
SELECT 
    driverId,
    forename,
    surname,
    nationality,
    MATCH(about) AGAINST ('British racing driver championship' IN NATURAL LANGUAGE MODE) as relevance_score,
    LEFT(about, 300) as bio_preview
FROM drivers 
WHERE MATCH(about) AGAINST ('British racing driver championship' IN NATURAL LANGUAGE MODE)
  AND MATCH(about) AGAINST ('British racing driver championship' IN NATURAL LANGUAGE MODE) > 0.1
ORDER BY relevance_score DESC;