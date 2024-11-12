# courses API Documentation
The courses API is designed to read from and write to the courses database to run the course selection site. This includes retrieving
degree information, handling user logins, and retrieving user information. This funcionality is
essential to the function of the course selector website

## Get Courses: /get/courselist
**Request Format:** /courses/get/courselist

**Query Parameters:** search (optional)

**Request Type:** GET request

**Returned Data Format**: JSON object

**Description 1:** Gets the contents of the courselist table in the courses database. Sends the course list as a JSON object. Courses are ordered alphabetically by the short key.

**Example Request:** /courses/get/courselist

**Example Response: (abbreviated)**
```
[
  {
    "dept": "craft",
    "short": "ART100",
    "name": "Art",
    "instructor": "Art Istic",
    "credits": 4,
    "prerequisites": "none",
    "courseDesc": "Basic drawing and painting",
    "room": "TBA",
    "time": "TBA",
    "numStudents": 37,
    "capacity": 50
  },
  {
    "dept": "craft",
    "short": "CER101",
    "name": "Ceramics",
    "instructor": "Clay Bowl",
    "credits": 4,
    "prerequisites": "none",
    "courseDesc": "Creating with clay",
    "room": "TBA",
    "time": "TBA",
    "numStudents": 30,
    "capacity": 50
  }
  ..........
]
```
**Description 2:** Gets the contents of the courselist table in the courses database WHERE the search query if a part of the
course full name. Sends the course list as a JSON object. Courses are ordered alphabetically by the short key.

**Example Request:** /courses/get/courselist?search="Art"

**Example Response: (abbreviated)**
```
[
  {
    "dept": "craft",
    "short": "ART100",
    "name": "Art",
    "instructor": "Art Istic",
    "credits": 4,
    "prerequisites": "none",
    "courseDesc": "Basic drawing and painting",
    "room": "TBA",
    "time": "TBA",
    "numStudents": 37,
    "capacity": 50
  }
]
```
**Error Handling:**
Any errors are 500 level and send text responses, as the user is never able to manipulate this endpoint.


## Get Course: /get/courselist/:course
**Request Format:** /courses/get/courselist/:course

**Request Type:** GET request

**Returned Data Format**: JSON object

**Description:** Finds the course by the given "short" parameter in the courselist table in the courses database. Sends that course as a JSON object.

**Example Request:** /courses/get/courselist/WW100

**Example Response:**
```
{
  "dept": "craft",
  "short": "WW100",
  "name": "Introduction to Wood Working",
  "instructor": "Wood Chuck",
  "credits": 5,
  "prerequisites": "none",
  "courseDesc": "Learn the basics to woodworking with carving techniques.",
  "room": "TBA",
  "time": "TBA",
  "numStudents": 25,
  "capacity": 50
}
```
**Error Handling:**
Any errors are 500 level and send text responses, as the user is never able to manipulate this endpoint, so the parameter will never be incorrect.

## Get Course: /courselist/filter/:filter
**Request Format:** /courses/courselist/filter/:filter

**Request Type:** GET request

**Returned Data Format**: JSON object

**Description:** Returns courses that have the same "dept" parameter. An alternative filter option returns courses that are not at full capacity.

**Example Request:** /courses/courselist/filter/write

**Example Response:**
```
{
  "dept": "write",
  "short": "CWR",
  "name": "Creative Writing",
  "instructor": "Stor E. Bord",
  "credits": 4,
  "prerequisites": "none",
  "courseDesc": "Fun, creative story writing",
  "room": "TBA",
  "time": "TBA",
  "numStudents": 17,
  "capacity": 50
}
```
**Example Request:** /courses/courselist/filter/available

**Example Response:**
```
{
    "dept": "tech",
    "short": "YTB101",
    "name": "Intro Video Making",
    "instructor": "Ed Itor",
    "credits": 4,
    "prerequisites": "none",
    "courseDesc": "Learn the basics of recording and editing",
    "room": "TBA",
    "time": "TBA",
    "numStudents": 44,
    "capacity": 50
  }
```
**Error Handling:**
Any errors are 500 level and send text responses, as the user is never able to manipulate this endpoint.

## Get Course: /get/degreereq/:degree
**Request Format:** /courses/get/degreereq/:degree

**Request Type:** GET request

**Returned Data Format**: JSON object

**Description:** Finds the degree by the given "short" parameter in the degrees table in the courses database.
Returns the degree info in a JSON object

**Example Request:** /courses/get/degreereq/WW

**Example Response:**
```
{
  "name": "Wood Working",
  "short": "WW"
  "req-courses": ["WW100", "WW150", "DE250", "WW300", ....]
  "total-creds": 70
  "advisor": "Joe Dohn"
}
```
**Error Handling:**
Any errors are 500 level and send text responses, as the user is never able to manipulate this endpoint.

## Get User: /get/user
**Request Format:** /courses/get/user

**Request Type:** GET request

**Returned Data Format**: JSON object

**Description:** Finds the current user in the users table and returns their info in a JSON object

**Example Request:** /courses/get/user

**Example Response:**
```
{
  "id": 1,
  "user": "NewUser",
  "pass": "1234",
  "degree": "Crafts",
  "currUser": 1
}
```
**Error Handling:**
Any errors are 500 level and send text responses, as the user is never able to manipulate this endpoint.

## Get User Courses: /get/userCourses/:userid
**Request Format:** /courses/get/userCourses/:userid

**Request Type:** GET request

**Returned Data Format**: JSON object

**Description:** Finds the user by the given userid and returns all of their courses from the courses table.
Sends the user's courses as a JSON object

**Example Request:** /courses/get/userCourses/1

**Example Response: (abbreviated)**
```
[
  {
    "id": 1,
    "short": "ART100",
    "status": 0
    "recordNum": 1
  },
  {
    "id": 1,
    "short": "CUL100",
    "status": 1
    "recordNum": 5
  },
  ..........
]
```
**Error Handling:**
Any errors are 500 level and send text responses, as the user is never able to manipulate this endpoint.

## Get User Transactions: /get/transactions/:userid
**Request Format:** /courses/get/transactions/:userid

**Request Type:** GET request

**Returned Data Format**: JSON object

**Description:** Finds the user by the given userid and returns all of their transactions from the transactions table.
Sends the user's transactions ordered by most recent as a JSON object

**Example Request:** /courses/get/transactions/1

**Example Response: (abbreviated)**
```
[
  {
    "id": 1,
    "short": "ART100",
    "action": 0
    "confirmation": "#1522586"
  },
  {
    "id": 1,
    "short": "CUL100",
    "action": 1
    "confirmation": "#1533465"
  },
  ..........
]
```
**Error Handling:**
Any errors are 500 level and send text responses, as the user is never able to manipulate this endpoint.

## Login User: /courses/login
**Request Format:** /courses/login

**Request Type:** POST request

**Returned Data Format**: plain text

**Description:** If the user exists in the users table of courses DB, set them as the current user

**Example Request:** /courses/login with body parameters "user" and "pass" as strings

**Example Response:**
```
Logged in successfully.
```
**Error Handling:**
400 level errors if either one or both login credentials incorrect/missing, otherwise 500 level errors for serverside. All errors send text responses.


## Login User: /courses/logout
**Request Format:** /courses/logout

**Request Type:** POST request

**Returned Data Format**: plain text

**Description:** If a user is logged in according to users table, logs out current user

**Example Request:** /courses/logout no parameters needed

**Example Response:**
```
Logged out successfully.
```
**Error Handling:**
500 level errors for serverside.


## Add Course: /courses/add
**Request Format:** /courses/add

**Request Type:** POST request

**Returned Data Format**: JSON object

**Description:** Adds the an entry to the courses table associating
the course with the user's id. Also adds an entry to the transactions table to record the add transaction

**Example Request:** /courses/add with parameters "course" (string) and "id" (int)

**Example Response:**
```
"Added Course"
```
**Error Handling:**
Missing body params result in a 400 level Client Error. Any
other errors are 500 level. All errors send text responses.


## Remove Course: /courses/remove
**Request Format:** /courses/remove

**Request Type:** POST request

**Returned Data Format**: JSON object

**Description:** Remove the selected course from the courses table where the course is associated with user's id.
Also add a drop transaction to the transactions table to record the transaction

**Example Request:** /courses/remove with parameters "course" (string) and "id" (int)

**Example Response:**
```
"Dropped Course"
```
**Error Handling:**
Missing parameters result in a 400 level client error. Other errors are 500 level. All errors send text responses