"use strict";
// API example with in-memory caching
const express = require("express");
const app = express();
const fetch = require("node-fetch");

const apikey = process.env.DATAGOVAPIKEY;

let cache = {};

app.get("/schools", (req, resp) => {
  let terms = req.query.name;
  let result = cache[terms];
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
        cache[terms] = json;
        resp.send(json);
      })
      .catch(err => {
        console.error(err);
        resp.send(202);
      });
  }
  return;
});

app.listen(3000);
