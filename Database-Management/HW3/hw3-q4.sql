SELECT DISTINCT F2.dest_city AS city
	FROM [dbo].[Flights] AS F1
	JOIN [dbo].[Flights] AS F2
	ON F1.dest_city = F2.origin_city
	WHERE F1.origin_city = 'Seattle WA'
	AND F2.dest_city != 'Seattle WA'
	AND F2.dest_city NOT IN
		(SELECT dest_city AS stop1
		FROM [dbo].[Flights]
		WHERE origin_city = 'Seattle WA')
GROUP BY F2.dest_city
ORDER BY F2.dest_city;