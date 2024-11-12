CREATE TABLE Caregivers (
    Username varchar(255),
    Salt BINARY(16),
    Hash BINARY(16),
    PRIMARY KEY (Username)
);

CREATE TABLE Availabilities (
    Time date,
    Username varchar(255) REFERENCES Caregivers,
    PRIMARY KEY (Time, Username)
);

CREATE TABLE Vaccines (
    Name varchar(255),
    Doses int,
    PRIMARY KEY (Name)
);

CREATE TABLE Patients (
    PUsername varchar(255),
    Salt BINARY(16),
    Hash BINARY(16),
    PRIMARY KEY (PUsername)
);

CREATE TABLE Appointments (
	AppId int,
	Time date,
	PUsername varchar(255) REFERENCES Patients NOT NULL,
	Username varchar(255) REFERENCES Caregivers NOT NULL,
	Name varchar(255) REFERENCES Vaccines NOT NULL, 
	PRIMARY KEY (AppId),
);