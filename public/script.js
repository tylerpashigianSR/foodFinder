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
       var next_page_token = "";
       $scope.showClickToSeeMore = false;
       $scope.max_price = 3;
       $scope.keyword = null;
       $scope.validated = false;
       $scope.finalResults = {place:null,emails:null};

       $scope.submitEmail = function(){
         if($scope.email != ""){
           $scope.emailLockedIn = !$scope.emailLockedIn;
         }
         if($scope.emailLockedIn){
          $scope.finalResults = {place:null,emails:null};
          checkForGroup();
          $(document).ready(function () {
              $("html, body").animate({
                  scrollTop: $("#search").offset().top
              }, 1500);
          });
         }
       }

       var checkForGroup = function(){
         $http.get("http://localhost:3000/checkForGroup/" + $scope.email)
             .success(function (response){
                if(response.place == null){
                  $scope.searchForPlaces(false);
                }
                else{
                  $scope.finalResults.place = response.place;
                  $scope.finalResults.emails = response.emails;
                }
             });
       }

       $scope.searchForPlaces = function(showMoreClicked){
         $scope.showClickToSeeMore = false;
         var url = "";
         if(showMoreClicked == true){
           url = "http://localhost:3000/morePlaces/" + next_page_token + "/" + $scope.email;
         }
         else{
           $scope.places = [];
           if($scope.keyword == null | $scope.keyword == ""){
             url = "http://localhost:3000/places/" + "null/" + $scope.max_price + "/" + $scope.email;
           }
           else{
             url = "http://localhost:3000/places/" + $scope.keyword + "/" + $scope.max_price + "/" + $scope.email;
           }
         }
         $http.get(url)
             .success(function (response){
                $scope.places = response.results;
                next_page_token = response.next_page_token;
                if(next_page_token != null){
                  $scope.showClickToSeeMore = true;
                }
             });
       }

       $scope.add = function(index, place) {
         $http.get('/increaseCounter/' + place.place_id + '/' + $scope.email)
             .success(function (response){
               place.counter++;
               place.chosen = true;
               if(response.place != null){
                 $scope.finalResults.place = response.place;
                 $scope.finalResults.emails = response.emails;
               }
             });
       }

       $scope.remove = function(index, place) {
         $http.get('/decreaseCounter/' + place.place_id + '/' + $scope.email)
             .success(function (response){
               place.counter--;
               place.chosen = false;
             });
       }

   });

   foodFinder.controller('aboutController', function($scope, $http) {


   });
