SELECT DISTINCT C.name AS carrier
FROM [dbo].[Carriers] AS C
WHERE C.cid IN 
	(SELECT F.carrier_id
	FROM [dbo].[Flights] AS F
	WHERE F.origin_city = 'Seattle WA'
	AND F.dest_city = 'New York NY')
ORDER BY C.name;