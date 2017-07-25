var express = require('express');
var router = express.Router();
var request = require('request');

var chosenRestaurants = {};

router.get('/places/:max_price/:email', function(req,res){
  request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&rankby=distance&type=restaurant&opennow=true&maxprice=" +
            req.params.max_price + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
   function(error, response, body) {
     var results = processResults(body, req.params.email);
     var next_page_token = JSON.parse(body).next_page_token;
     res.send({results : results, next_page_token : next_page_token});
  });
});

router.get('/places/:keyword/:max_price/:email', function(req,res){
  request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&rankby=distance&type=restaurant&opennow=true&maxprice=" +
            req.params.max_price + "&keyword=" + req.params.keyword + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
   function(error, response, body) {
     var results = processResults(body, req.params.email);
     var next_page_token = JSON.parse(body).next_page_token;
     res.send({results : results, next_page_token : next_page_token});
  });
});

router.get('/morePlaces/:next_page_token/:email', function(req,res){
    var next_page_token = req.params.next_page_token;
    request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=" + next_page_token + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
     function(error, response, body) {
       var results = processResults(body, req.params.email);
       var next_page_token = JSON.parse(body).next_page_token;
       res.send({results : results, next_page_token : next_page_token});
    });
});

router.get('/increaseCounter/:id/:email', function(req, res) {
  if (chosenRestaurants[req.params.id] == null) {
    chosenRestaurants[req.params.id] = [req.params.email];
  } else {
    if(chosenRestaurants[req.params.id].indexOf(req.params.email) < 0){
      chosenRestaurants[req.params.id].push(req.params.email);
    }
  }
  console.log(chosenRestaurants);
  res.send("all good");
});

router.get('/decreaseCounter/:id/:email', function(req, res) {

  if (chosenRestaurants[req.params.id] != null) {
    var index = chosenRestaurants[req.params.id].indexOf(req.params.email);
    if(index >= 0){
      chosenRestaurants[req.params.id].splice(index, 1);
    }
  }
  console.log(chosenRestaurants);
  res.send("removed. all good");
});

function processResults(body, email){
    var results = JSON.parse(body).results;
    for(var i = 0; i < results.length; i++){
       results[i].distanceFromOffice = distance(41.8885,-87.6354,results[i].geometry.location.lat,results[i].geometry.location.lng);
       results[i].dollarSigns = priceLevelToDollarSigns(results[i].price_level);
       if(chosenRestaurants[results[i].id] == null){
          results[i].counter = 0;
          results[i].chosen = false;
       }
       else{
          results[i].counter = chosenRestaurants[results[i].id].length;
          var index = chosenRestaurants[results[i].id].indexOf(email);
          if(index >= 0){
            results[i].chosen = true;
          }
       }
    }
    return results;
}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;
  // multiply by 0.62 to get to miles
  return 0.62*(12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
}

function priceLevelToDollarSigns(priceLevel) {
  switch(priceLevel) {
    case 1:
        return "$";
    case 2:
        return "$$";
    case 3:
        return "$$$";
    case 4:
        return "$$$$";
    default:
        return "";
  }
}

module.exports = router;
