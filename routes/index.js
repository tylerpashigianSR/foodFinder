var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/places', function(req,res){
  request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&radius=400&type=restaurant&maxprice=3&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
   function(error, response, body) {
     var firstTwentyResults = JSON.parse(body).results;
     var next_page_token = JSON.parse(body).next_page_token;
     res.send({firstTwentyResults : firstTwentyResults, next_page_token : next_page_token});
  });
});

router.get('/places/:next_page_token', function(req,res){
    var next_page_token = req.params.next_page_token;
    request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=" + next_page_token + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
     function(error, response, body) {
       var nextTwentyResults = JSON.parse(body).results;
       var next_page_token = JSON.parse(body).next_page_token;
       res.send({nextTwentyResults : nextTwentyResults, next_page_token : next_page_token});
    });
});

module.exports = router;
