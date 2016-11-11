'use strict';

MetronicApp.controller('SaleController',[
	'$rootScope', '$scope', '$timeout','$http', 'sweetAlert',
	function($rootScope, $scope, $timeout,$http, sweetAlert) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_discounts')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  

    $scope.removeSale = function(sId){
    	
		sweetAlert.swal({
			title: "Are you sure?",   
			text: "Your will not be able to recover it!",   
			type: "warning",   
			showCancelButton: true,   
			confirmButtonColor: "#DD6B55",   
			confirmButtonText: "Yes, remove !",
			closeOnConfirm: false,
			closeOnCancel: false

		}).then(function(isConfirm) {
			if (isConfirm) {
				$http.delete('adminapi/sale/'+sId).success(function(res){
					sweetAlert.swal("Deleted!", res.message, "success");
					grid.getDataTable().ajax.reload();
				}).error(function(res){
					sweetAlert.swal("Failed!", res.message, "error");
				});
			}
		});

    };

}]); 

MetronicApp.controller('SaleFormController',[
	'$rootScope','$scope','$http','$stateParams','saleModel', 
	function($rootScope,$scope,$http,$stateParams,saleModel) {
	
	$scope.itemlist = [];

	$scope.searching = false;
	$scope.isupdate = false;
	$scope.errors = {};

	$scope.sale = {	
		actionType:1,
		discountType:1,
		type:0,
		status:1,
		saleProductId:[],
		saleProductDetail:[],
		saleCategoryId:[],
		saleCategoryDetail:[],
		actionProductId:[],
		actionProductDetail:[]
	};


	$scope.saleOptions = [{key:0,value:'Name tag'},{key:1,value:'Sale tag'}];

	$scope.statusOptions = [{key:1,value:'Enable'},{key:0,value:'Disable'}];

	$scope.actionOptions = [{key:1,value:'Free Gift'},{key:2,value:'Discount'}];

	$scope.discountOptions = [{key:1,value:'Fix Amount'},{key:2,value:'% of Amount'}];

	// angular.promotion = $scope.promotion;
	
	if($stateParams.saleId){

		$scope.isupdate = true;

		saleModel.getSale($stateParams.saleId).success(function(response){									
			
			$scope.sale = response;

		}).error(function(data, status, headers){
						
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Promotion not found',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });

		});
	}

	$scope.store = function(){
		
		var data = $scope.sale;
		
		if($stateParams.saleId){

			saleModel.update(data,$stateParams.saleId).success(function(response){

			}).error(function(data, status, headers){
				$scope.errors = data;
			});

		}else{
			saleModel.store(data).success(function(response){

			}).error(function(data, status, headers){

				$scope.errors = data;

			});	
		}
		//POST DATA WITH FILES
		
	}

	$scope.addItem = function(p,currentIdObj,currentDetailObj){
		p.added = true;		
		
		//EMPTY THE OBJ SO THAT USER CANNOT ADD MORE THAN 1 PRODUCT
		if($scope.searchType == 'offerproduct'){
			currentDetailObj.splice(0,1);
			currentIdObj.splice(0,1);
		}

		currentDetailObj.push(angular.copy(p));				
		currentIdObj.push(angular.copy(p._id));
	};

	$scope.searchItem = function($event,searchType){

		var qry = $event.currentTarget.value;
		if(qry.length>=3){
			$scope.searching = true;
			saleModel.searchItem(qry,searchType).success(function(response){
				$scope.itemlist = response;
				$scope.searching = false;
			});
		}else{
			$scope.itemlist = [];
		}
	};
	
	$scope.removeItem = function(index,idObj,detailObj){
		detailObj.splice(index,1);
		idObj.splice(index,1);
	}

	$scope.checkItem = function(currentIdObj){

		if(!$scope.itemlist) return [];	

		return $scope.itemlist.filter(function(item){
			angular.forEach(currentIdObj, function (pro) {
				if  (pro === item._id) {
					item.added = true;
				}else if($scope.searchType == 'offerproduct'){
					item.added = false;
				}
			});
			return item;
		});
	}

	$scope.clearSearch = function(searchType,currentIdObj,currentDetailObj){
		
		if(searchType == 'product' || searchType == 'offerproduct'){
			$scope.popTitle = 'product';
		}else{
			$scope.popTitle = 'category';
		}

		$scope.searchType = searchType;
		$scope.currentIdObj = currentIdObj;
		$scope.currentDetailObj = currentDetailObj;
		$scope.searchbox = '';
		$scope.itemlist = [];
	}


	$scope.moveItem = function(items, from, to) {
        angular.forEach(items,function(item,key){
        	var idx = from.indexOf(item);
          if (idx != -1) {
              from.splice(idx, 1);
              to.push(item);      
          }
        });        
    };
    
    $scope.moveAll = function(from, to) {
        angular.forEach(from, function(item) {
            to.push(item);
        });
        from.length = 0;
    };
    
    $scope.selectedItems = ['Red wine','b','c'];
    $scope.availableItems = [1,2,3];

    $scope.checkAdd = function(p){

    	var flg = false;

    	if($scope.sale.type == 0 && !p.added){
			flg = true;    		
    	}

    	if($scope.searchType != 'offerproduct' && p.sale==null && !p.added){
    		flg = true;
    	}

    	if($scope.searchType == 'offerproduct' && !p.added){
    		flg = true;
    	}

    	return flg;    	
    };

    $scope.inSale = function(p){

    	var sid = '';

    	if(p.sale!=null){
    		sid = p.sale._id['$id'];
    	}

    	return $scope.sale.type == 1 && $scope.searchType != 'offerproduct' && sid!=$stateParams.saleId && $scope.type ==1;

    };

    $scope.removeSaleImage = function(){    	
    	$scope.sale.coverImage = {source:''};
    }

}]);
