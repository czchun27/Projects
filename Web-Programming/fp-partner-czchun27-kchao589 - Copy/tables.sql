CREATE TABLE courselist (
	"dept"	TEXT,
	"short"	TEXT,
	"name"	TEXT,
	"instructor"	TEXT DEFAULT TBA,
	"credits"	INTEGER,
	"prerequisites"	TEXT DEFAULT none,
	"courseDesc"	TEXT,
	"room"	TEXT DEFAULT TBA,
	"time"	TEXT DEFAULT TBA,
	"numStudents"	INTEGER DEFAULT 25,
	"capacity"	INTEGER DEFAULT 50
);

CREATE TABLE "courses" (
	"id"	INTEGER,
	"short"	TEXT,
	"status"	INTEGER
);

CREATE TABLE "degrees" (
	"name"	TEXT,
	"courselist"	TEXT,
	"credits"	INTEGER,
	"advisor"	TEXT
);

CREATE TABLE "transactions" (
	"id"	INTEGER,
	"short"	TEXT,
	"action"	INTEGER,
	"date"	DATETIME DEFAULT (datetime('now', 'localtime')),
  "confirmation"	TEXT
);

CREATE TABLE "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"user"	TEXT,
	"pass"	TEXT,
	"degree"	TEXT,
	"currUser"	INTEGER DEFAULT 0,
);