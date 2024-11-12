SELECT DISTINCT F1.origin_city, F1.dest_city, F1.actual_time AS time 
FROM [dbo].[Flights] AS F1 JOIN
(SELECT origin_city, MAX(actual_time) AS time FROM [dbo].[Flights] GROUP BY origin_city) F2
ON F1.origin_city = F2.origin_city AND F1.actual_time = F2.time
ORDER BY F1.origin_city, F1.dest_city;