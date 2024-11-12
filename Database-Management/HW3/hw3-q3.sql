SELECT F1.origin_city, ISNULL(F2.cnt*1.0/count(F1.origin_city)*100, 0) AS percentage
FROM [dbo].[Flights] AS F1 LEFT JOIN
(SELECT origin_city, count(fid) AS cnt 
FROM [dbo].[Flights] 
WHERE actual_time < 90 AND canceled = 0
GROUP BY origin_city) F2
ON F1.origin_city = F2.origin_city
WHERE F1.canceled = 0
GROUP BY F1.origin_city, F2.cnt
ORDER BY percentage, F1.origin_city;