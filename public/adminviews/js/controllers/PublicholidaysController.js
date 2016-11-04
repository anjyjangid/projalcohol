'use strict';

MetronicApp.controller('PublicholidaysController',['$rootScope', '$scope', '$timeout','$http','$state', '$filter', function($rootScope, $scope, $timeout,$http,$state,$filter) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_holidays')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageSidebarClosed = false;  		
		$rootScope.settings.layout.pageBodySolid = false;	
        $rootScope.holiday = {};
	});
	
    $scope.weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    $scope.ids = [];

    $scope.dow = [];

    //$scope.holiday = {};
    
    $scope.showList = function(){               
       $rootScope.holiday.allDay = 0;
    };  

    
    $scope.events = function (start, end, timezone, callback) {      
      var ds = Date.parse(start);
      var de = Date.parse(end);      
      $http.post('/adminapi/holiday/list',{start:ds,end:de}).success(function(events){
        callback(events);
        $scope.currentEvents = events;        
        $scope.pulicholidays = events.filter(function(hol){
            return (hol._id!='weekdayoff');
        });        
      }).error(function(){
        Metronic.alert({
            type: 'danger',
            icon: 'warning',
            message: 'Error in getting list',
            container: '#holidaycontainer',
            place: 'prepend',            
        });
      }); 
    };    

    $scope.calEventsExt = {
       color: '#2B3643',
       textColor: 'white',
       className:['mClass'],
       events: $scope.events
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        alert(date.id + ' was clicked ');
    };
    
    /* add custom event*/
    $scope.addEvent = function() {
      $scope.events.push({
        title: 'Open Sesame',
        start: new Date(y, m, 28),
        end: new Date(y, m, 29),
        className: ['openSesame']
      });
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
     
    $scope.uiConfig = {
      calendar:{
        //height: 400,
        editable: false,
        header:{
          left: 'today',
          center: 'title',
          right: 'prev,next'
        },
        eventClick: $scope.eventClick,        
        eventRender: $scope.eventRender,
        dayClick: $scope.dayClick,
        weekMode: 'fixed',
      }
    };    
    
    $scope.eventRender = function(event, element){        
        
        /*if(event._id == 'weekdayoff'){
            element.addClass("disabled");
        }*/

        /*element.find('div').append( "<h4 class='closeon pull-left'>&times;</h4>" );
        element.find(".closeon").click(function() {
           angular.element('#calendar').fullCalendar('removeEvents',event._id);
        });*/
        //console.log('RENDER');
    };

    $scope.eventClick = function(e){
        
        var ds = Date.parse(e.start);
        $scope.dt = ds;            
        $rootScope.holiday = e; 
        $rootScope.holiday.allDay = 1;

    }

    $scope.eventSources = [$scope.calEventsExt];    

    $scope.dayClick = function(e){        
        
        var ds = Date.parse(e);            
        var ex = $scope.holidayExist(ds);
        var wd = $filter('date')(ds, 'EEEE');
        var weekdayoff = $scope.isWeekoffexist(wd);        

        if(typeof ex[0] != 'undefined' || weekdayoff){  //HOLIDAY EXIST                            
            return false;            
        }else{              
            $scope.dt = ds;
            var nd = $filter('date')(ds, 'dd');
            var nm = $filter('date')(ds, 'MM');
            var ny = $filter('date')(ds, 'yyyy');            
            $rootScope.holiday = {
                title:'',
                start:ny+'-'+nm+'-'+nd,
                d:nd,
                m:nm,
                y:ny,
                allDay:1,
                repeat:0,
                timeStamp:ds
            }; 
            
        } 

    };

    $scope.holidayExist = function(et){
        var allevnents =  angular.element('#calendar').fullCalendar('clientEvents');
        return allevnents.filter(function(revent){            
            return (revent.timeStamp == et);
        });
    };

    $scope.addHoliday = function(){

        $scope.adderrors = [];

        if($rootScope.holiday._id){
            
            var postData = $rootScope.holiday;

            if($rootScope.holiday._id == 'weekdayoff'){
                postData = {
                    _id:'weekdayoff',
                    title:$rootScope.holiday.title,
                    dow:$rootScope.holiday.dow,
                    allDay:1
                };
            }

            $http.put('/adminapi/holiday/'+$rootScope.holiday._id,postData).success(function(events){                
                $rootScope.holiday.allDay = false;
                angular.element('#calendar').fullCalendar('refetchEvents');    
            }).error(function(errors){
                $scope.adderrors = errors;
            });
        }else{
            $http.post('/adminapi/holiday',$rootScope.holiday).success(function(events){
                $rootScope.holiday.allDay = false;
                angular.element('#calendar').fullCalendar('refetchEvents');                    
            }).error(function(errors){
                $scope.adderrors = errors;
            });
        }
    };

    $scope.removeHoliday = function(){

        if($rootScope.holiday._id){
            $http.delete('/adminapi/holiday/'+$rootScope.holiday._id).success(function(events){
                $rootScope.holiday.allDay = false;
                angular.element('#calendar').fullCalendar('refetchEvents');    
            }).error(function(errors){
                $scope.adderrors = errors;
            });
        }
    };

    $scope.addDays = function(key){        
        var keyExist = $rootScope.holiday.dow.indexOf(key);
        if(keyExist>-1){
            $rootScope.holiday.dow.splice(keyExist,1);    
        }else{
            $rootScope.holiday.dow.push(key);                
        }
    };

    $scope.isChecked = function(mkey){        
        var weekdayoff = $scope.getWeekly();
        if(weekdayoff){
            var keyExist = weekdayoff.dow.indexOf(mkey);
            return (keyExist < 0)?false:true;    
        }else{
            return false;
        }        
    };     

    $scope.isWeekoffexist = function(mkey){                
        var weekdayoff = $scope.getWeekly();
        var weekKey = $scope.weekdays.indexOf(mkey);
        if(weekdayoff){
            var keyExist = weekdayoff.dow.indexOf(weekKey);
            return (keyExist < 0)?false:true;    
        }else{
            return false;
        }
        
    };

    $scope.weeklyEdit = function(){
        var weekdayoff = $scope.getWeekly();
        //console.log(weekdayoff);
        var title = '';
        var dow = [];

        if(weekdayoff){            
            title = weekdayoff.title;
            dow = weekdayoff.dow;
        }
        $rootScope.holiday = {
            _id:'weekdayoff',
            title:title,
            dow:dow,
            allDay:1,
            repeat:0,
        };        
    };

    $scope.getWeekly = function(){
        var mevents =  angular.element('#calendar').fullCalendar('clientEvents');        
        var me = mevents.filter(function(hol,k){
            return (hol._id=='weekdayoff');
        });
        return me[0];
    }

    /*$scope.editEvent = function(eid){
        $("#calendar").fullCalendar.trigger('eventClick', eid);
    }*/

}]);