SELECT DISTINCT F1.origin_city AS city
FROM [dbo].[Flights] AS F1 JOIN
(SELECT origin_city, MAX(actual_time) AS time FROM [dbo].[Flights] GROUP BY origin_city) F2
ON F1.origin_city = F2.origin_city AND F1.actual_time = F2.time
WHERE F1.actual_time < 240 AND F1.canceled = 0
ORDER BY F1.origin_city;