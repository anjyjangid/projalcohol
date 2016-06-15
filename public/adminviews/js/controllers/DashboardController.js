'use strict';

MetronicApp.controller('DashboardController', function($rootScope, $scope, $http, $timeout) {

    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_dashboard'));
		$rootScope.settings.layout.pageBodySolid = false;
    	$rootScope.settings.layout.pageSidebarClosed = false;
    });   

    $scope.stats = {
        totalProducts:0,
        totalOrder:0,
        avgOrders:0
    };

    $http.get('/adminapi/admin/stats').then(function(response){
        $scope.stats = response.data;
    });

    // set sidebar closed and body solid layout mode
    $scope.addInventry = function(id,mnum){
    	
        $scope.notify = {
            time:30,
            sms:1,
            mail:1,
            numDisable:false,
            loading:false,            
            oid:id
        };

        $scope.notify.oid = id;

        if(mnum == 0){
            $scope.notify.sms = 0;
            $scope.notify.numDisable = true;
        }

        $('#notify').find('.alert').remove();

        $('#notify').modal('show');
    }

    $scope.sendNotification = function(){
        $scope.notify.loading = true;        
        $http.post('/adminapi/admin/notify',$scope.notify).then(function(res){
            $scope.notify.loading = false;            
            
            var st = '';

            if($scope.notify.mail){
                if(!res.data.mailsent){
                    Metronic.alert({
                        type: 'danger',
                        icon: 'warning',
                        message: 'Could not send mail, please try again.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5                
                    });
                }else{
                    Metronic.alert({
                        type: 'success',
                        icon: 'check',
                        message: 'Mail has been sent successfully.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5
                    });
                }
            }

            if($scope.notify.sms){
                if(!res.data.smssent){
                    Metronic.alert({
                        type: 'danger',
                        icon: 'warning',
                        message: 'Could not send SMS, please try again.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5
                    });
                }else{
                    Metronic.alert({
                        type: 'success',
                        icon: 'check',
                        message: 'SMS has been sent successfully.',
                        container: '#notify .portlet-body',
                        place: 'prepend',
                        reset: false,
                        closeInSeconds:5                
                    });
                }
            }            
        },function(erres){            
            $scope.notify.loading = false;
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: erres.data.message,
                container: '#notify .portlet-body',
                place: 'prepend'
            });
        });
    }
});

MetronicApp.controller('ProductInventoryController', function($rootScope, $scope, $http, $timeout) {
    $scope.product = {};
    $scope.errors = [];
    $scope.update = function(){
        $http.post("/admin/product/updateinventory", $scope.product, {
                
        }).error(function(data, status, headers) {            
            $scope.errors = data;            
        })
        .success(function(response) {               
            $scope.errors = []; 
            reloadGrid(); 
        });
    }
});