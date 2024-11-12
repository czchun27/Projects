PRAGMA foreign_keys=ON;

/*
2a.
*/

CREATE TABLE InsuranceCo (
    name TEXT PRIMARY KEY,
    phone INT);

CREATE TABLE Vehicle (
    licensePlate TEXT PRIMARY KEY,
    ssn INT REFERENCES Person,
    name TEXT REFERENCES InsuranceCo,
    maxLiability REAL,
    year INT);
    
CREATE TABLE Person (
    name TEXT,
    ssn INT PRIMARY KEY);
    
CREATE TABLE Driver (
    driverID INT,
    ssn INT PRIMARY KEY REFERENCES Person);
    
CREATE TABLE Truck (
    licensePlate TEXT PRIMARY KEY REFERENCES Vehicle,
    ssn INT REFERENCES ProfessionalDriver,
    capacity INT);

CREATE TABLE NonProfessionalDriver (
    ssn INT PRIMARY KEY REFERENCES Person);
    
CREATE TABLE ProfessionalDriver (
    ssn INT PRIMARY KEY REFERENCES Person,
    medicalHistory text);
    
CREATE TABLE Car (
    licensePlate TEXT PRIMARY KEY REFERENCES Vehicle,
    make TEXT);

CREATE TABLE Drives (
    ssn INT REFERENCES NonProfessionalDriver,
    licensePlate TEXT REFERENCES Car);

/*
2b.
The insures relationship is represented by the Vehicle table, NOT a separate Insures table.
This is because the insures relationship is a many-to-one relationship, where InsuranceCo can insure many
vehicles, but each vehicle can only be insured by at most one InsuranceCo. Therefore, it makes sense that the 
vehicles table could simply store the name of insurance co and the maxLiability
*/

/*
2c.
The drives relationship is a many-to-many relationship, so it must have a separate table for its relationship.
The operates relationship is a many-to-one relationship, where a truck can only be operated by one driver,
but a driver can operate many trucks. Therefore, we can simply add a foreign key from ProfessionalDriver
to the Truck table to implement this relationship. For the drives relationship we need to have a table Drives
with foreign keys from Car and NonProfessionalDriver, since a car can be driven by many drivers and a driver
can drive many cars.
*/