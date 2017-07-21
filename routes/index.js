var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/places/:max_price', function(req,res){
  request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&rankby=distance&type=restaurant&opennow=true&maxprice=" +
            req.params.max_price + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
   function(error, response, body) {
     var results = processResults(body);
     var next_page_token = JSON.parse(body).next_page_token;
     res.send({results : results, next_page_token : next_page_token});
  });
});

router.get('/places/:keyword/:max_price', function(req,res){
  request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&rankby=distance&type=restaurant&opennow=true&maxprice=" +
            req.params.max_price + "&keyword=" + req.params.keyword + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
   function(error, response, body) {
     var results = processResults(body);
     var next_page_token = JSON.parse(body).next_page_token;
     res.send({results : results, next_page_token : next_page_token});
  });
});

router.get('/more_places/:next_page_token', function(req,res){
    var next_page_token = req.params.next_page_token;
    request("https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=" + next_page_token + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
     function(error, response, body) {
       var results = processResults(body);
       var next_page_token = JSON.parse(body).next_page_token;
       res.send({results : results, next_page_token : next_page_token});
    });
});

function processResults(body){
    var results = JSON.parse(body).results;
    for(var i = 0; i < results.length; i++){
       results[i].distanceFromOffice = distance(41.8885,-87.6354,results[i].geometry.location.lat,results[i].geometry.location.lng);
       results[i].dollarSigns = priceLevelToDollarSigns(results[i].price_level);
       results[i].counter = 0;
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
