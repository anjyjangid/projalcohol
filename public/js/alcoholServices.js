AlcoholDelivery.service('SocialSharingService', ['$rootScope', '$window', '$http', '$q', '$mdToast', function ($rootScope, $window, $http, $q, $mdToast) {

	this.shareFb = function(shareData){

		var defer = $q.defer();

		var shareParams = {

			method: 'feed',
			picture : "http://54.169.107.156/images/ad_logo.png",
			href: "http://54.169.107.156",
			name:"Alcoholdelivery Fb Order Sharing",
			caption : "Alcoholdelivery",
			description:"Hello Friends i have made a purchase on alcoholdelivery",
			// message: 'Message you want to show',
			// link: 'http://link-you-want-to-show',

		};
		
		shareParams = angular.merge({}, shareParams, shareData);		

		FB.ui(shareParams, function(response){

			if (response && !response.error_message) {

				defer.resolve("added success fully");

			} else {

				defer.reject("added success fully");

			}

		});

		return defer.promise;
	}

}]);