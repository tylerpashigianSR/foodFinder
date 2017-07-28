var express = require('express');
var router = express.Router();
var request = require('request');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'munchmatesalerts@gmail.com',
    pass: 'munchmates123'
  }
});
const groupMatchMinimum = 2;
var chosenRestaurants = {};
var formedGroups = []; //consist of lists of key:place_id, values: emails

router.get('/checkForGroup/:email', function(req,res){
  var alreadyInFormedGroup = false;
  for(var i = 0; i < formedGroups.length; i++){
    var index = formedGroups[i].emails.indexOf(req.params.email);
    if(index >= 0){
      alreadyInFormedGroup = true;
      request("https://maps.googleapis.com/maps/api/place/details/json?placeid="
        + formedGroups[i].place_id + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
        function(error, response, body) {
          res.send({place:response,emails:formedGroups[i].emails});
      });
      break;
    }
  }
  if(!alreadyInFormedGroup){
    res.send({place:null,emails:null});
  }
});

router.get('/places/:keyword/:max_price/:email', function(req,res){
  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&rankby=distance&type=restaurant&opennow=true&maxprice=" +
            req.params.max_price + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ";
  if(req.params.keyword != "null"){
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8885,-87.6354&rankby=distance&type=restaurant&opennow=true&maxprice=" +
              req.params.max_price + "&keyword=" + req.params.keyword + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ";
  }
  request(url,function(error, response, body) {
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

router.get('/increaseCounter/:place_id/:email', function(req, res) {
  var groupFound = false;
  if (chosenRestaurants[req.params.place_id] == null) {
    chosenRestaurants[req.params.place_id] = [req.params.email];
  }
  else {
    if(chosenRestaurants[req.params.place_id].indexOf(req.params.email) < 0){
      //user's email is not in the list for this restaurant
      chosenRestaurants[req.params.place_id].push(req.params.email);
      //now check to see if a group has been filled
      if(chosenRestaurants[req.params.place_id].length >= groupMatchMinimum){

        groupFound = true;
        var emails = chosenRestaurants[req.params.place_id];
        chosenRestaurants[req.params.place_id] = [];
        removeEmailsFromAllLists(emails);

        //send emails
        var mailOptions = {
          from: 'munchmatesalerts@gmail.com',
          to: emails.join(),
          subject: 'Your MunchMates have been found!',
          text: 'That was easy!'
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        formedGroups.push({place_id:req.params.place_id,emails:emails});

        request("https://maps.googleapis.com/maps/api/place/details/json?placeid="
          + req.params.place_id + "&key=AIzaSyCXyqmOpSzVX0R85aM-p7jEHKU1SPD1_TQ",
          function(error, response, body) {
            res.send({place:response,emails:emails});
        });
      }
    }
  }
  if(!groupFound){
    res.send({place:null,emails:null});
  }
  console.log(chosenRestaurants);
});

router.get('/decreaseCounter/:place_id/:email', function(req, res) {
  if (chosenRestaurants[req.params.place_id] != null) {
    var index = chosenRestaurants[req.params.place_id].indexOf(req.params.email);
    if(index >= 0){
      chosenRestaurants[req.params.place_id].splice(index, 1);
    }
  }
  console.log(chosenRestaurants);
  res.send("removed. all good");
});

function removeEmailsFromAllLists(emails){
  for (var key in chosenRestaurants) { //look at each restaurant
    for(var i = 0; i < emails.length; i++){ //for each email to be removed
      var index = chosenRestaurants[key].indexOf(emails[i]);
      if(index >= 0){
        chosenRestaurants[req.params.place_id].splice(index, 1);
      }
    }
  }
}

function processResults(body, email){
    var results = JSON.parse(body).results;
    for(var i = 0; i < results.length; i++){
       results[i].distanceFromOffice = distance(41.8885,-87.6354,results[i].geometry.location.lat,results[i].geometry.location.lng);
       results[i].dollarSigns = priceLevelToDollarSigns(results[i].price_level);
       if(chosenRestaurants[results[i].place_id] == null){
          results[i].counter = 0;
          results[i].chosen = false;
       }
       else{
          results[i].counter = chosenRestaurants[results[i].place_id].length;
          if(chosenRestaurants[results[i].place_id].indexOf(email) >= 0){
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
