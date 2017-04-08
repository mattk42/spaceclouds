# Spaceclouds

## About
This is a very early stage project mean to help organize the open space sessions for DevOpsDays Denver 2017. This will allow users to submit their topics through a browser interface, the server will aggregate all of the suggestions and send the current state of the poll back to the clients through a websocket connection. The clients will then generate a continually updating wordcloud as the polling continues.

## Requirements
NodeJS
Redis

## How to run it
1. Start your redis server
2. export REDIS_URL=<connection string>
3. run node server.js
