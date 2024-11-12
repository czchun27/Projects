### Yipper API Request Details
Yipper handles get and post requests related to the yipper database and yips table for
information about yips (tweets but for dogs).

#### Endpoint 1: Get all yip data or yip data matching a given search term
**Request Format:** `/yipper/yips`
**Query Parameters:** `search` (optional)
**Request Type (both requests):** `GET`
**Returned Data Format:** JSON
**Description 1:** If the `search` parameter is not included in the request, gets the `id`, `name`, `yip`, `hashtag`, `likes` and `date` for all entries in the `yips` table and outputs JSON containing the information in descending order by `date`
**Example Request 1:** `/yipper/yips`
**Example Output 1:** (abbreviated)
```json
{
  "yips":[
    {
      "id": 25,
      "name": "Mister Fluffers",
      "yip": "It is sooooo fluffy I am gonna die",
      "hashtag": "fluff",
      "likes": 6,
      "date": "2020-07-07 03:48:28"
    },
    {
      "id": 24,
      "name": "Sir Barks a Lot",
      "yip": "Imagine if my name was sir barks a lot and I was meowing all day haha",
      "hashtag": "clown",
      "likes": 6,
      "date": "2020-07-06 00:55:08"
    },
    ...
  ]
}
```
**Description 2:** If the `search` parameter is included in the request, sends all the `id`s of the `yip`s matching the term passed in the `search` query parameter (ordered by the `id`s). A "match" is any `yip` that contains the `search` term in _any_ position
**Example Request 2:** `/yipper/yips?search=if`
**Example Output 2:**
```json
{
  "yips" : [
    {
      "id": 8
    },
    {
      "id": 24
    }
  ]
}
```
**Error Handling**
Since we use query parameters in a get request, no user errors will occur.
All errors are serverside 500 level errors.

#### Endpoint 2: Get yip data for a designated user
**Request Format:** `/yipper/user/:user`
**Query Parameters:** none.
**Request Type:** `GET`
**Returned Data Format:** JSON
**Description:** Gets the `name`, `yip`, `hashtag` and `date` for all the yips for a designated `user` ordered by the `date` in descending order
**Example Request:** `/yipper/user/Chewbarka`
**Example Output:**
```json
[
  {
    "name": "Chewbarka",
    "yip": "chewy or soft cookies. I chew them all",
    "hashtag": "largebrain",
    "date": "2020-07-09 22:26:38",
  },
  {
    "name": "Chewbarka",
    "yip": "Every snack you make every meal you bake every bite you take... I will be watching you.",
    "hashtag": "foodie",
    "date": "2019-06-28 23:22:21"
  }
]
```
**Error Handling**
User cannot cause an error, all errors are serverside 500 level errors.


#### Endpoint 3: Update the likes for a designated yip
**Request Format:** `/yipper/likes`
**Body Parameters:** `id`
**Request Type:** `POST`
**Returned Data Format:** plain text
**Description:** Updates the `likes` for a yip by incrementing the current value by 1 and responds with the new value.
**Example Request:** `/yipper/likes`
**Example Output:**
```
8
```
**Error Handling**
User cannot cause an error, all errors are serverside 500 errors

#### Endpoint 4: Add a new yip
**Request Format:** `/yipper/new`
**Body Parameters:** `name` and `full`
**Request Type:** `POST`
**Returned Data Format:** JSON
**Description:** Adds the new Yip information to the database and send back and output the JSON with the `id`, `name`, `yip`, `hashtag`, `likes` and `date` of the new yip. `date` will
default to the current date, and `id` auto increments.
**Example Request:** `/yipper/new`
**Example Output:**
```json
{
  "id": 528,
  "name": "Chewbarka",
  "yip": "love to yip allllll day long",
  "hashtag": "coolkids",
  "likes": 0,
  "date": "2020-09-09 18:16:18"
}
```
**Error Handling**
If the user is missing body parameters name or full, this causes
a 400 level clientside error. Otherwise, all other errors are serverside
500 level errors.