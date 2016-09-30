'use strict';

MetronicApp.controller('StocksController',['$rootScope', '$scope', '$timeout','$http', 'sweetAlert'
, function($rootScope, $scope, $timeout,$http,sweetAlert) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_products')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;
    
    $scope.selected = {};

    $scope.reset = function() {
        $scope.selected = {};
    }

    $scope.generatePO = function () {
        for (var i in $scope.selected)
            if(!$scope.selected[i])
                delete $scope.selected[i];

        var products = Object.keys($scope.selected);

        var promise;
        if(products.length==0)
            promise = sweetAlert.swal({
                title: "Are you sure?",
                text: "Purchase order for all required products will be generated",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, Generate!",
                closeOnConfirm: false,
                closeOnCancel: false
            })
            .then(generatePoRequest)
        else
            promise = generatePoRequest(true);

        function generatePoRequest(isConfirm) {
            return $http.post('/adminapi/stocks/generate-po', { products: products });
        }

        promise.then(function(res) {

            if(res.data.success==1 && res.data.products>0)
                Metronic.alert({
                    type: 'success',
                    icon: 'check-circle',
                    message: "PO Generated for "+res.data.products+" products",
                    container: '#info-message',
                    place: 'prepend',
                    closeInSeconds: 10
                });
            else if(res.data.success==1)
                throw new Error("No product is low on stock");
            else if(res.data.success===0)
                Metronic.alert({
                    type: 'info',
                    icon: 'warning',
                    message: "Failed to generate PO for some products",
                    container: '#info-message',
                    place: 'prepend',
                    closeInSeconds: 3
                });
            else
                throw new Error("Failed to generate PO");

            orderGrid.getDataTable().ajax.reload();
        })
        .catch(function(err){
            if(err=="cancel")
                return;
            Metronic.alert({
                type: 'danger',
                icon: 'exclamation-circle',
                message: err.message || "Internal server error!",
                container: '#info-message',
                place: 'prepend',
                closeInSeconds: 10
            });
        })
    };
}]); 