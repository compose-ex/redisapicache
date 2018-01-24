"use strict";
// API Example with Redis as a Cache

const express = require("express");
const app = express();
const { URL } = require("url");
const redis = require("redis");
const fetch = require("node-fetch");

const apikey = process.env.DATAGOVAPIKEY;

let connectionString = process.env.COMPOSE_REDIS_URL;

if (connectionString === undefined) {
  console.error("Please set the COMPOSE_REDIS_URL environment variable");
  process.exit(1);
}

let client = null;

if (connectionString.startsWith("rediss://")) {
  client = redis.createClient(connectionString, {
    tls: { servername: new URL(connectionString).hostname }
  });
} else {
  client = redis.createClient(connectionString);
}

app.get("/schools", (req, resp) => {
  let terms = req.query.name;
  client.get("schools/" + terms, (err, result) => {
    if (result != null) {
      console.log("Cache hit for " + terms);
      resp.send(result);
    } else {
      console.log("Cache missed for " + terms);
      fetch(
        "https://api.data.gov/ed/collegescorecard/v1/schools?api_key=" +
          apikey +
          "&school.name=" +
          terms +
          "&fields=school.name,location.lon,location.lat&per_page=100"
      )
        .then(res => res.json())
        .then(json => {
          client.setex("schools/" + terms, 300, JSON.stringify(json));
          resp.send(json);
        })
        .catch(err => {
          console.error(err);
          resp.send(202);
        });
    }
  });
  return;
});

app.listen(3000);
