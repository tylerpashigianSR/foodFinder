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
       $scope.users = {
         restaurants: []
       };
       var next_page_token = "";
       $scope.showClickToSeeMore = false;
       $scope.max_price = 4;
       $scope.keyword = null;
       $http.get("http://localhost:3000/places")
           .success(function (response){
              console.log(response);
              $scope.places = response.firstTwentyResults;
              next_page_token = response.next_page_token;
              if(next_page_token != null){
                $scope.showClickToSeeMore = true;
              }
           });

       $scope.searchWithParameters = function(){
         if($scope.keyword == null | $scope.keyword == ""){
           $http.get("http://localhost:3000/places/" + $scope.max_price)
               .success(function (response){
                  console.log(response);
                  $scope.places = response.firstTwentyResults;
                  next_page_token = response.next_page_token;
                  if(next_page_token != null){
                    $scope.showClickToSeeMore = true;
                  }
               });
         }
         else{
           $http.get("http://localhost:3000/places/" + $scope.keyword + "/" + $scope.max_price)
               .success(function (response){
                  console.log(response);
                  $scope.places = response.firstTwentyResults;
                  next_page_token = response.next_page_token;
                  if(next_page_token != null){
                    $scope.showClickToSeeMore = true;
                  }
               });
           }
       }

       $scope.showMoreClicked = function(){
         $scope.showClickToSeeMore = false;
         $http.get("http://localhost:3000/more_places/" + next_page_token)
             .success(function (response){
                console.log(response);
                $scope.places = $scope.places.concat(response.nextTwentyResults);
                next_page_token = response.next_page_token;
                if(next_page_token != null){
                  $scope.showClickToSeeMore = true;
                }
             });
       }

       $scope.add = function(placeName) {
         $scope.users.restaurants.push(placeName);
       }

       $scope.remove = function(index) {
         $scope.users.restaurants.splice(index, 1);
       }

   });
