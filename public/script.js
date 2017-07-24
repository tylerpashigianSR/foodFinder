var foodFinder = angular.module('foodFinder', ['ngRoute']);

   // configure our routes
   foodFinder.config(function($routeProvider) {
       $routeProvider

           // route for the home page
           .when('/', {
               templateUrl : 'home.html',
               controller  : 'mainController'
           })

           // route for the about page
           .when('/about', {
               templateUrl : 'about.html',
               controller  : 'aboutController'
           })
   });

   // create the controller and inject Angular's $scope
   foodFinder.controller('mainController', function($scope, $http) {
       $scope.date = new Date();
       $scope.places = [];
       $scope.emailLockedIn = false;
       $scope.email = "";
       $scope.users = {
         restaurants : []
       };

       var next_page_token = "";
       $scope.showClickToSeeMore = false;
       $scope.max_price = 3;
       $scope.keyword = null;

       $scope.searchForPlaces = function(showMoreClicked){
         $scope.showClickToSeeMore = false;
         var url = "";
         if(showMoreClicked == true){
           url = "http://localhost:3000/more_places/" + next_page_token;
         }
         else{
           $scope.places = [];
           if($scope.keyword == null | $scope.keyword == ""){
             url = "http://localhost:3000/places/" + $scope.max_price;
           }
           else{
             url = "http://localhost:3000/places/" + $scope.keyword + "/" + $scope.max_price;
           }
         }
         $http.get(url)
             .success(function (response){
                console.log(response);

                //check to see if the user has selected any of these places already
                for(var i = 0; i < response.results.length; i++){
                  var placeAlreadySelected = false;
                  for(var j = 0; j < $scope.users.restaurants.length; j++ ){
                    if($scope.users.restaurants[j].name == response.results[i].name){
                      placeAlreadySelected = true;
                      break;
                    }
                  }
                  if(!placeAlreadySelected){
                    $scope.places.push(response.results[i]);
                  }
                }
                next_page_token = response.next_page_token;
                if(next_page_token != null){
                  $scope.showClickToSeeMore = true;
                }
             });
       }

       $scope.add = function(index, place) {

         $http.get('/increaseCounter/' + place.id)
             .success(function (response){
                console.log("Success");
             });

         $scope.places[index].counter += 1;
         $scope.users.restaurants.push(place);
         $scope.places.splice(index, 1);
         console.log($scope.users.restaurants);
       }

       $scope.remove = function(index, place) {

       $http.get('/decreaseCounter/' + place.id)
           .success(function (response){
              console.log("Success");
           });

         $scope.users.restaurants[index].counter -= 1;
         $scope.places.splice($scope.users.index, 0, place);
         $scope.users.restaurants.splice(index, 1);
         console.log($scope.places[0].counter);
       }

       init = function(){
         $scope.searchForPlaces(false);
       }

       init();

   });
