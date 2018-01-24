"use strict";
// API Example with no caching at all
const express = require("express");
const app = express();
const fetch = require("node-fetch");

const apikey = process.env.DATAGOVAPIKEY;

app.get("/schools", (req, resp) => {
  let terms = req.query.name;
  fetch(
    "https://api.data.gov/ed/collegescorecard/v1/schools?api_key=" +
      apikey +
      "&school.name=" +
      terms +
      "&fields=school.name,location.lon,location.lat&per_page=100"
  )
    .then(res => res.json())
    .then(json => {
      resp.send(json);
    })
    .catch(err => {
      console.error(err);
      resp.send(202);
    });
});

app.listen(3000);
