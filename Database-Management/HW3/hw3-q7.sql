SELECT DISTINCT C.name AS carrier
FROM [dbo].[Flights] AS F JOIN
[dbo].[Carriers] AS C
ON F.carrier_id = C.cid
WHERE F.origin_city = 'Seattle WA'
AND F.dest_city = 'New York NY'
ORDER BY C.name;