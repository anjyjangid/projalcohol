'use strict';

MetronicApp.controller('PublicholidaysController',['$rootScope', '$scope', '$timeout','$http','$state', function($rootScope, $scope, $timeout,$http,$state) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_holidays')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageSidebarClosed = false;  		
		$rootScope.settings.layout.pageBodySolid = false;	
	});		
	
	var today = new Date();
        var m = today.getMonth();
        var y = today.getFullYear();
        var d = today.getDate();

	/*$scope.eventSources = [{ 
        	title: 'Event directly added',
            start: new Date(y, m, 28),
            end: new Date(y, m, 28),
            className: ['openSesame'],
            allDay:true
    }];*/

	$scope.uiConfig = {
      calendar:{        
        editable: false,
        header:{
          //left: 'month basicWeek basicDay agendaWeek agendaDay',
          //center: 'title',
          right: 'today prev,next'
        },
        //dayClick: $scope.addEvent,
        //eventDrop: $scope.alertOnDrop,
        //eventResize: $scope.alertOnResize
      }
    };

    $scope.addNewevent = function(){
    	
    	var today = new Date();
        var m = today.getMonth();
        var y = today.getFullYear();
        var d = today.getDate();
        var object = { 
        	title: 'Event directly added',
            start: new Date(y, m, 28),
            end: new Date(y, m, 28),
            className: ['openSesame']
        };
        $scope.eventSources.push(object);
    	   	
    }
}]);