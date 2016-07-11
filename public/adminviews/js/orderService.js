MetronicApp.service('alcoholCart',['$http', '$q', 'alcoholCartItem', 'alcoholCartPackage',function($http, $q, alcoholCartItem, alcoholCartPackage){

	this.init = function(){

		this.$cart = {

			products : {},
			packages : [],			
			nonchilled : false,
			delivery : {

				type : null,
				charges : null,
				address : null,
				contact : null,
				instruction : null,
				leaveatdoor : false,
				instructions : null,

			},
			service : {
				express : {
					status : false,
					charges : null
				},
				smoke : {
					status : false,
					charges : null
				},
				delivery : {
					free : false,
					charges : null,
					mincart : null,
				},
			},
			discount : {
				nonchilled : {
					status : false,
					exemption : null
				}
			},
			timeslot : {
					datekey:false,
					slotkey:false,
					slug:"",
					slotslug:""
				},
		};

	}

	this.$restore = function(storedCart){

	}

}])

.factory('alcoholCartItem', ['$rootScope', '$log', function ($rootScope, $log){

	var product = function(){

	};

	return product;
}])

.factory('alcoholCartPackage', ['$rootScope', '$log', function ($rootScope, $log){

	var package = function(){

	};

	return package;
}])

.service('alcoholStore', ['$http', 'alcoholCart', '$q', 'sweetAlert', function ($http, alcoholCart, $q, sweetAlert) {

	return {

		init : function (){

			return $q(function(resolve,reject){

				$http.get("/adminapi/order").success(function(response){

					if(!response.isUnprocessed){

						alcoholCart.$restore(response.cart);
						resolve();

					}else{

						sweetAlert.swal({

							title: "There is a un-processed cart ?",
							text: "Do want to continue with them!",
							type: "warning",
							showCancelButton: true,   
							confirmButtonColor: "#DD6B55",   
							confirmButtonText: "Yes, i want to continue !",
							closeOnConfirm: false,
							closeOnCancel: false

						}).then(

							function(isConfirm) {

								if (isConfirm) {

									alcoholCart.$restore(response.cart);
									resolve();

								} else {

									$http.get("/adminapi/order/newcart").success(function(newCartRes){
										alcoholCart.$restore(newCartRes.cart);
										resolve();
									})

								}
							}
						);

					}												

				})

			})

		}

	}
}]);