
	var MessageApp = angular.module('MessageApp', ['ngRoute'])
    
    // routeProvider Code
	.config(function($routeProvider) {
		$routeProvider
			.when('/', {
                templateUrl : 'pages/login.html',
                controller  : 'loginController'				
			})
			.when('/register', {
				templateUrl : 'pages/register.html',
				controller  : 'registerController'
			})
            .when('/compose', {
				templateUrl : 'pages/composeMessage.html',
				controller  : 'composeController'
			})
            .when('/userprofile', {
				templateUrl : 'pages/userprofile.html',
				controller  : 'updateController'
			})
            .when('/sent', {
				templateUrl : 'pages/sentMessages.html',
				controller  : 'sentController'
			})
            .when('/received', {
				templateUrl : 'pages/receivedMessages.html',
				controller  : 'receivedController'
			})
            .otherwise({
                redirectTo: '/'
            });            
	})
    // routeProvider Code

    //HTTP Service Code
    .factory('myHTTPService', function($http) {
      var promise;
      var myService = {
        async: function() {
          if ( !promise ) {
            promise = $http.get('userprofile.json').then(function (response) {
                return response.data;
            });
          }
          return promise;
        }
      };
      return myService;
    })
    //HTTP Service Code

    //LocalStorageFactory Code
    .factory("LocalStorageFactory", function($window) {
        return {
            setData: function(val) {
                $window.localStorage && $window.localStorage.setItem('userProfile_Messages', val);
                return this;
            },
            getData: function() {
                return $window.localStorage && $window.localStorage.getItem('userProfile_Messages');
            }
        };
    })
    //LocalStorageFactory Code    
    
    // mainController Code
    .controller('mainController', function(LocalStorageFactory,myHTTPService,$window,$scope,$rootScope){
        this.logout = function(){
          $window.location.href = '../index.html';  
        };
        $rootScope.loggedin =  false;
        $rootScope.fn_load = $scope.fn_load = function () {
                if(LocalStorageFactory.getData()=== null){
                    myHTTPService.async().then(function(d) {
                        LocalStorageFactory.setData(angular.toJson(d));
                        $rootScope.wholeData = angular.fromJson(LocalStorageFactory.getData());
                    });
                }
                else{
                    $rootScope.wholeData = angular.fromJson(LocalStorageFactory.getData());
                }
        };
	})
	// mainController Code
        
    // loginController Code
    .controller("loginController", function($location, $rootScope, $scope) {
        $rootScope.login_error_message = "";
        this.clickButton = function() {
            if($rootScope.wholeData === null){
                $rootScope.fn_load();
            }
            $scope.flag = false;
            $scope.loop = true;
            angular.forEach($rootScope.wholeData[0], function (value, index) {
                if($scope.loop){
                    if($rootScope.wholeData[0][index].Username === $scope.username &&
                      $rootScope.wholeData[0][index].Password === $scope.password){
                        $scope.flag = true;
                        if($scope.flag){
                            $rootScope.login_error_message = "";
                            $rootScope.loggedin = true;
                            $rootScope.loggedin_userindex = index;
                            $rootScope.loggedin_username = $rootScope.wholeData[0][index].Username;
                            $location.path( "/userprofile" );
                            $scope.loop = false;
                        }                    
                    }  
                }
            });
            if(!$scope.flag){
                $rootScope.login_error_message = "Not a valid user";
            }            
        };
    })
    // loginController Code
    
    // registerController Code
	.controller('registerController', function(LocalStorageFactory,$scope,$rootScope) {
        this.submitDetails = function() { 
            $rootScope.fn_load();
            $rootScope.register_error_message ="";
            $scope.flag = true;
            angular.forEach($rootScope.wholeData[0], function (value, index) {
                // if the user already exits
                if($rootScope.wholeData[0][index].Username === $scope.username &&
                  $rootScope.wholeData[0][index].Password === $scope.password){
                    $rootScope.register_error_message = "User Already Exists!";
                    $scope.username="";
                    $scope.flag = false;
                }         
            });
            if($scope.flag){
                var obj = {
                        "Username" : $scope.username,
                        "Password" : $scope.password,
                        "Firstname" : $scope.firstname,
                        "Lastname" : $scope.lastname,
                        "Email" : $scope.email,
                        "Phone" : $scope.phone,
                        "Location" : $scope.location
                    };
                $rootScope.wholeData[0].push(obj);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
                $rootScope.register_error_message = "Succesfully Saved the information!";
            }        
        }
    })
    // registerController Code
    
    // updateController Code
	.controller('updateController', function($scope,$rootScope, LocalStorageFactory) {
        $scope.update_load = function () {
            $rootScope.fn_load();
            $rootScope.update_error_message = "";
            //pre filling the form
             $scope.username = $rootScope.wholeData[0][$rootScope.loggedin_userindex].Username;
             $scope.password = $rootScope.wholeData[0][$rootScope.loggedin_userindex].Password;
             $scope.firstname= $rootScope.wholeData[0][$rootScope.loggedin_userindex].Firstname;
             $scope.lastname = $rootScope.wholeData[0][$rootScope.loggedin_userindex].Lastname;
             $scope.email = $rootScope.wholeData[0][$rootScope.loggedin_userindex].Email;
             $scope.phone = $rootScope.wholeData[0][$rootScope.loggedin_userindex].Phone;
             $scope.location = $rootScope.wholeData[0][$rootScope.loggedin_userindex].Location;
        };
        this.updateDetails = function() {  
            $scope.flag = true;
            angular.forEach($rootScope.wholeData[0], function (value, index) {
                // if the user already exits
                if($rootScope.wholeData[0][index].Username === $scope.username && index != $rootScope.loggedin_userindex){
                    $rootScope.update_error_message = "User Already Exists!";
                    $scope.username="";
                    //$scope.password="";
                    $scope.flag = false;
                }         
            });
            if($scope.flag){
                var obj = {
                        "Username" : $scope.username,
                        "Password" : $scope.password,
                        "Firstname" : $scope.firstname,
                        "Lastname" : $scope.lastname,
                        "Email" : $scope.email,
                        "Phone" : parseInt($scope.phone),
                        "Location" : $scope.location
                    };
                $rootScope.wholeData[0].splice($rootScope.loggedin_userindex,1); 
                $rootScope.wholeData[0].splice($rootScope.loggedin_userindex,0,obj);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
                $rootScope.update_error_message = "Succesfully Updated the information!";
            }
        };
    })
    // updateController Code
    
    // receivedController Code
    .controller('receivedController', function($scope,$rootScope,filterFilter,LocalStorageFactory) {
        $scope.message_load = function () {   
            $scope.userName = $rootScope.loggedin_username;
            $scope.messageData = $rootScope.wholeData[1];
            $scope.receivedArray = filterFilter(this.messageData, { recipient: $scope.userName});
            this.showMessageDetails = function(x){
                $scope.mainIndex = $scope.messageData.indexOf($scope.receivedArray[x]);
                $scope.specificDescription = $scope.receivedArray[x].description;
                $scope.replyArray = $scope.receivedArray[x].reply;
            };
            this.deleteMessageDetails = function(x){
                //$scope.selectedIndex = x;
                $scope.receivedArray.splice(x,1);
                $rootScope.wholeData[1].splice($scope.mainIndex,1);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
            };
            this.deleteReply = function(x){
                $scope.replyArray.splice(x,1);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
            };   
            this.addReply = function(){
                $scope.replyArray.push($scope.reply);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
                $scope.reply="";
            }
        };        
    })
    // receivedController Code
    
    // sentController Code
    .controller('sentController', function($scope,$rootScope,filterFilter,LocalStorageFactory) {
        $scope.message_load = function () {   
            $scope.userName = $rootScope.loggedin_username;
            $scope.messageData = $rootScope.wholeData[1];
            $scope.sentArray = filterFilter(this.messageData, { sender: $scope.userName})
            this.showMessageDetails = function(x){
                $scope.mainIndex = $scope.messageData.indexOf($scope.sentArray[x]);
                $scope.specificDescription = $scope.sentArray[x].description;
                $scope.replyArray = $scope.sentArray[x].reply;
            };
            this.deleteMessageDetails = function(x){
                $scope.sentArray.splice(x,1);
                $rootScope.wholeData[1].splice($scope.mainIndex,1);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
            };
            this.deleteReply = function(x){
                $scope.replyArray.splice(x,1);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
            };   
            this.addReply = function(){
                $scope.replyArray.push($scope.reply);
                LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
                $scope.reply="";
            }
        };        
    })
    // sentController Code
    
    // composeController Code
    .controller('composeController', function($scope,$rootScope,LocalStorageFactory) {
        $scope.message_load = function(){
            $scope.new_message_error = "";
            $scope.recipientList = [];
            $scope.importanceLevels = ["1","2","3","4","5"];
            angular.forEach($rootScope.wholeData[0], function (value, index) {
                if(index != $rootScope.loggedin_userindex)
                {
                    $scope.recipientList.push($rootScope.wholeData[0][index].Username);
                }
            });            
        };
        this.sendMessage = function () {   
            $rootScope.fn_load();
            $scope.userName = $rootScope.loggedin_username;
            $scope.senderIndex = $rootScope.loggedin_userindex;
            $scope.messageData = $rootScope.wholeData[1];            
            var obj = {
                "recipient": $scope.user,
                "recipient_img": "http://simpleicon.com/wp-content/uploads/user1.png",
                "sender": $rootScope.loggedin_username,
                "sender_img": "http://simpleicon.com/wp-content/uploads/user1.png",
                "title": $scope.title,
                "description": $scope.message,
                "created_at": new Date(),
                "important": $scope.imp,
                "reply":[]
            }
            $rootScope.wholeData[1].push(obj);
            LocalStorageFactory.setData(angular.toJson($rootScope.wholeData));
            $scope.new_message_error = "Successfully Sent!";
            $scope.user = "";
            $scope.title = "";
            $scope.message = "";
            $scope.imp = "";
        };     
    })
    // composeController Code