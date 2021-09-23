# Backend project - Northcoders House of Games API

A RESTful web API application which provides some basic functionality of the backend of a discussion website like reddit.

A running version is hosted here: [https://nc-board-gamers.herokuapp.com/api/](https://nc-board-gamers.herokuapp.com/api/ "Hosted version")

## Description

Built as a backend project to showcase what I have learned in [#Northcoders](https://northcoders.com/) so far.

Here, we mimick the backend service of a discussion website for board games lovers, where users can:

- post reviews for their favourite board games
- comments on each other's reviews
- vote up or vote down any review or comment

This webapp offers a RESTful API for accessing the reviews and comment.

By accessing the API, you can

- `GET` the reviews and comments,
- `POST` or `DELETE` a comment to a review, or
- by sending a `PATCH`, vote up or vote down a review

## Dependencies

- [Node JS](https://nodejs.org/) : v16.4.2
- [PostgreSQL](https://www.postgresql.org/) : v.12.8

#### Node JS modules:

- "express": "^4.17.1"
- "pg": "^8.7.1"
- "pg-format": "^1.0.4"
- "dotenv": "^10.0.0"

#### Dev dependencies:

- "jest": "^27.2.0"
- "jest-sorted": "^1.0.12"
- "nodemon": "^2.0.12"
- "supertest": "^6.1.6"
- "express-list-endpoints": "^6.0.0"

## Installation & Setup

Before install, ensure you have got Node.js and PostgreSQL in your local machine.

- [Node JS](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

Then, clone the repo to your local machine by running:

```shell
git clone https://github.com/kapppa-joe/backend-project-nc-games.git
```

To install the dependencies :

```shell
cd backend-project-nc-games
npm i
```

If you want to install the dev dependencies as well, run this instead:

```shell
npm i --production=false
```

### Setup the environment database

Before starting the server, you need to setup the environment variables, create and seed the postgreSQL database. To do that, run the below command:

```shell
echo "PGDATABASE=nc_games" > .env.development
echo "PGDATABASE=nc_games_test" > .env.test
npm run setup-dbs
npm run seed
```

### Running test

The project is built with a TDD (Test Driven Development) approach.
Unit test for each feature of the server is provided in test folder `__test__`. The testing framework is [Jest](https://jestjs.io/).

To run the tests, simply call the test script:

```shell
npm test app
```

You can also bring up a local server at localhost:9090 by:

```shell
npm run dev
```

---

## Example

A running version of this webapp is hosted here:

[https://nc-board-gamers.herokuapp.com/api/](https://nc-board-gamers.herokuapp.com/api/ "Hosted version")

The root /api/ endpoint serves a list of all available endpoints, as well as a brief description of what each endpoint does.

An example response of the API:

GET: `https://nc-board-gamers.herokuapp.com/api/reviews?sort_by=title&order=asc&p=2&limit=5`

Server Response:

```json
{
  "reviews": [
    {
      "owner": "grumpy19",
      "title": "Monopoly",
      "review_id": 20,
      "category": "strategy",
      "review_img_url": "https://images.pexels.com/photos/1314435/pexels-photo-1314435.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      "created_at": "2020-09-13T15:14:20.877Z",
      "votes": 3,
      "comment_count": 2
    },
    {
      "owner": "tickle122",
      "title": "Nova Luna; Freak out in a moonage daydream, oh yeah!",
      "review_id": 17,
      "category": "strategy",
      "review_img_url": "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
      "created_at": "1970-01-10T02:56:38.400Z",
      "votes": 6,
      "comment_count": 3
    },
    {
      "owner": "happyamy2016",
      "title": "Occaecat consequat officia in quis commodo.",
      "review_id": 12,
      "category": "roll-and-write",
      "review_img_url": "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      "created_at": "2020-09-13T15:19:28.077Z",
      "votes": 8,
      "comment_count": 1
    }
  ],
  "total_count": 24
}
```

---

### A little TODOs for myself:

- Implement the below when have time:
  - [x] PATCH /api/comments/:comment_id
  - [ ] POST /api/reviews
  - [ ] POST /api/categories
  - [ ] DELETE /api/reviews/:review_id
  - [ ] pagination for GET /api/reviews/:review_id/comments
  - [ ] ... maybe a `search` query for reviews and comments?
