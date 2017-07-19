var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/places', function(req,res){
  //location is hardcoded to Merchandise Mart
  request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&type=restaurant&rankby=distance&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
   function(error, response, body) {
     var places = JSON.parse(body).results;
     res.send(places);
  });
});

module.exports = router;
