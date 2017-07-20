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
       // create a message to display in our view
       $scope.message = 'Everyone come and see how good I look!';
       $scope.places = [];

       $http.get("http://localhost:3000/places")
           .success(function (response){
             console.log(response);
              $scope.places = response;
       });

       $scope.print = function() {
         console.log("Hello, World!");
       }

   });
