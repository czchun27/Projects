SELECT F3.stop3 AS city
FROM
	(SELECT dest_city AS stop3
	FROM [dbo].[Flights]
	WHERE dest_city != 'Seattle WA'
	AND origin_city != 'Seattle WA') F3
WHERE F3.stop3 NOT IN
	(SELECT F2.dest_city AS stop2
	FROM [dbo].[Flights] AS F1
	JOIN [dbo].[Flights] AS F2
	ON F1.dest_city = F2.origin_city
	WHERE F1.origin_city = 'Seattle WA')
GROUP BY F3.stop3
ORDER BY F3.stop3;