# Backend project - Northcoders House of Games API

A RESTful web API application which mimicks the basic functionality of the backend of a discussion website like reddit.

A running version is hosted [here: https://nc-games-project-kapppa-joe.herokuapp.com/api/](https://nc-games-project-kapppa-joe.herokuapp.com/api/ "Running version")

## Description

Built as a backend project to showcase what I have learned in [#Northcoders](https://northcoders.com/).

Here, we mimick a backend service of a discussion website for board game, where users can:

- post reviews for board games
- comments on each other's reviews
- vote up or vote down any review or comment

This webapp offers a RESTful API for accessing the reviews and comment.

By accessing the API, you can

- `GET` the reviews and comments,
- `POST` or `DELETE` a comment to a review, or
- by firing a `PATCH`, vote up or down a review

## Dependencies

This project is built upon the below resources:

- [Node JS](https://nodejs.org/) v16.4.2
- [PostgreSQL](https://www.postgresql.org/) v.12.8

## Node JS modules:

- "express": "^4.17.1",
- "pg": "^8.7.1",
- "pg-format": "^1.0.4"
- "dotenv": "^10.0.0",

## Install & Setup
