-- Part 4a.
CREATE TABLE Sales (
    name TEXT,
    discount TEXT,
    month VARCHAR(3),
    price int);

-- Part 4b.
/* 
Functional Dependency
name -> price
There are no duplicate names, but there are duplicate prices, so price is dependent
on name.
*/
SELECT DISTINCT name, price 
FROM Sales 
ORDER BY name;

/*
Functional Dependency
month -> discount
There are no duplicate months, but there are duplicate discounts, so
discount is dependent on month 
*/
SELECT DISTINCT month, discount
FROM Sales
ORDER BY month;


/*
Nonexistent Functional Dependency
discount -> name
This is not a functional dependency because the same discount value
yields different names, so the name is not dependent on the discount
*/
SELECT DISTINCT name, discount
FROM Sales
ORDER BY discount;

-- Part 4c.
/*
S(name, discount, month, price) =
S1(_name_, price), S2(name, discount, month) =
S3(_month_, discount), S4(name, month)
S1, S3, S4 are BCNF
*/

CREATE TABLE Sales1 (
    name TEXT PRIMARY KEY,
    price int);
    
CREATE TABLE Sales3 (
    month VARCHAR(3) PRIMARY KEY,
    discount TEXT);
    
CREATE TABLE Sales4 (
    name TEXT REFERENCES Sales1,
    month VARCHAR(3) REFERENCES Sales3);
    
-- Part 4d.

-- 36 rows
INSERT INTO Sales1
SELECT DISTINCT name, price
FROM Sales;

-- 12 rows
INSERT INTO Sales3
SELECT DISTINCT month, discount
FROM Sales;

-- 426 rows
INSERT INTO Sales4
SELECT name, month
FROM Sales;