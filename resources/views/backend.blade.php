<!DOCTYPE html>
<!-- 
Template Name: Metronic - Responsive Admin Dashboard Template build with Twitter Bootstrap 3.3.4
Version: 4.0.1
Author: KeenThemes
Website: http://www.keenthemes.com/
Contact: support@keenthemes.com
Follow: www.twitter.com/keenthemes
Like: www.facebook.com/keenthemes
Purchase: http://themeforest.net/item/metronic-responsive-admin-dashboard-template/4021469?ref=keenthemes
License: You must have a valid license purchased only from themeforest(the above link) in order to legally use the theme for your project.
-->
<!--[if IE 8]> <html lang="en" class="ie8 no-js" data-ng-app="MetronicApp"> <![endif]-->
<!--[if IE 9]> <html lang="en" class="ie9 no-js" data-ng-app="MetronicApp"> <![endif]-->
<!--[if !IE]><!-->
<html lang="en" data-ng-app="MetronicApp">
<!--<![endif]-->
<!-- BEGIN HEAD -->
<head>
<title data-ng-bind="'Admin Alcohol Delivery | ' + $state.current.data.pageTitle"></title>
<meta charset="utf-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<meta http-equiv="Content-type" content="text/html; charset=utf-8">
<meta content="" name="description"/>
<meta content="" name="author"/>
<!-- BEGIN GLOBAL MANDATORY STYLES -->
<link href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700&subset=all" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/global/plugins/font-awesome/css/font-awesome.min.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/global/plugins/simple-line-icons/simple-line-icons.min.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css') }}" rel="stylesheet" type="text/css"/>

<link rel="stylesheet" type="text/css" href="{{ asset('bower_components/angular-material/angular-material.min.css') }}"/>

<link href="{{ asset('assets/global/plugins/bootstrap/css/bootstrap.min.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/global/plugins/uniform/css/uniform.default.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css') }}" rel="stylesheet" type="text/css"/>
<meta name="_token" content="{{ csrf_token() }}">
<!-- END GLOBAL MANDATORY STYLES -->


<!-- END GLOBAL MANDATORY STYLES -->
<!-- BEGIN PAGE LEVEL STYLES -->
<link href="{{ asset('assets/admin/pages/css/login.css') }}" rel="stylesheet" type="text/css"/>
<!-- END PAGE LEVEL SCRIPTS -->
<!-- BEGIN THEME STYLES -->

<link href="{{ asset('bower_components/sweetalert2/dist/sweetalert2.css') }}" rel="stylesheet" type="text/css"/>


<!-- DOC: To use 'rounded corners' style just load 'components-rounded.css' stylesheet instead of 'components.css' in the below style tag -->
<link href="{{ asset('assets/global/css/components-md.css') }}" id="style_components" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/global/css/plugins-md.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/admin/layout/css/layout.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('assets/admin/layout/css/themes/darkblue.css') }}" rel="stylesheet" type="text/css" id="style_color"/>
<link href="{{ asset('assets/admin/layout/css/custom.css') }}" rel="stylesheet" type="text/css"/>
<link href="{{ asset('css/admincustom.css') }}" rel="stylesheet" type="text/css"/>
<!-- END THEME STYLES -->
<link rel="shortcut icon" href="images/favicon.ico"/>
</head>
<!-- END HEAD -->
<!-- BEGIN BODY -->
<!-- DOC: Apply "page-header-fixed-mobile" and "page-footer-fixed-mobile" class to body element to force fixed header or footer in mobile devices -->
<!-- DOC: Apply "page-sidebar-closed" class to the body and "page-sidebar-menu-closed" class to the sidebar menu element to hide the sidebar by default -->
<!-- DOC: Apply "page-sidebar-hide" class to the body to make the sidebar completely hidden on toggle -->
<!-- DOC: Apply "page-sidebar-closed-hide-logo" class to the body element to make the logo hidden on sidebar toggle -->
<!-- DOC: Apply "page-sidebar-hide" class to body element to completely hide the sidebar on sidebar toggle -->
<!-- DOC: Apply "page-sidebar-fixed" class to have fixed sidebar -->
<!-- DOC: Apply "page-footer-fixed" class to the body element to have fixed footer -->
<!-- DOC: Apply "page-sidebar-reversed" class to put the sidebar on the right side -->
<!-- DOC: Apply "page-full-width" class to the body element to have full width page without the sidebar menu -->
<body ng-controller="AppController" class="page-md login page-header-fixed page-sidebar-closed-hide-logo page-quick-sidebar-over-content page-on-load" ng-class="{'page-container-bg-solid': settings.layout.pageBodySolid, 'page-sidebar-closed': settings.layout.pageSidebarClosed}">

	<!-- BEGIN PAGE SPINNER -->
	<div ng-spinner-bar class="page-spinner-bar">
		<div class="bounce1"></div>
		<div class="bounce2"></div>
		<div class="bounce3"></div>
	</div>
	<!-- END PAGE SPINNER -->
	<div ui-view></div>

	<!-- BEGIN JAVASCRIPTS(Load javascripts at bottom, this will reduce page load time) -->

	<!-- BEGIN CORE JQUERY PLUGINS -->
	<!--[if lt IE 9]>
	<script src="{{ asset('assets/global/plugins/respond.min.js') }}"></script>
	<script src="{{ asset('assets/global/plugins/excanvas.min.js') }}"></script> 
	<![endif]-->
	<script src="{{ asset('assets/global/plugins/jquery.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/jquery-migrate.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/bootstrap/js/bootstrap.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/jquery-slimscroll/jquery.slimscroll.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/jquery.blockui.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/jquery.cokie.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/uniform/jquery.uniform.min.js') }}" type="text/javascript"></script>	
	<script src="{{ asset('assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js') }}" type="text/javascript"></script>
	<!-- END CORE JQUERY PLUGINS -->

	<script src="{{ asset('assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/select2/select2.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/datatables/all.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/scripts/datatable.js') }}" type="text/javascript"></script>
	

	<!-- BEGIN CORE ANGULARJS PLUGINS -->
	<script src="{{ asset('assets/global/plugins/angularjs/angular.min.js') }}" type="text/javascript"></script>	
	<script src="{{ asset('assets/global/plugins/angularjs/angular-sanitize.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/angularjs/angular-cookies.min.js') }}" type="text/javascript"></script>

	<script src="{{ asset('assets/global/plugins/angularjs/angular-touch.min.js') }}" type="text/javascript"></script>	
	<script src="{{ asset('assets/global/plugins/angularjs/plugins/angular-ui-router.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/plugins/angularjs/plugins/ocLazyLoad.min.js') }}" type="text/javascript"></script>
	
	<script src="{{ asset('assets/global/plugins/angularjs/plugins/ui-bootstrap-tpls.min.js') }}" type="text/javascript"></script>
	
	<!-- ISSUE IN TABS -->
	<!-- <script src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js') }}" type="text/javascript"></script> -->
	<!-- ISSUE IN TABS -->

	<script type="text/javascript" src="{{ asset('bower_components/angular-animate/angular-animate.js') }}"></script>

	<script type="text/javascript" src="{{ asset('bower_components/angular-aria/angular-aria.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-messages/angular-messages.min.js') }}"></script>	
	<script type="text/javascript" src="{{ asset('bower_components/angular-material/angular-material.min.js') }}"></script>		
		
	<!-- SWEET ALERT SCRIPT -->
	<script src="{{ asset('bower_components/sweetalert2/dist/sweetalert2.min.js') }}" type="text/javascript"></script>
	<script src="{{ asset('bower_components/ngSweetAlert2/SweetAlert.js') }}" type="text/javascript"></script>

	<script src="{{ asset('bower_components/es6-promise/promise.min.js') }}" type="text/javascript"></script>
	
	<script src="{{ asset('js/angular-slugify.js') }}" type="text/javascript"></script>


	<!-- END CORE ANGULARJS PLUGINS -->
	<!-- <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyAO1xAu1wBu7NZOqNBn9aoYg-RVstm60jc&libraries=places"></script>
    <script type="text/javascript" src="https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.js"></script> -->
    
	<!-- BEGIN APP LEVEL ANGULARJS SCRIPTS -->
	<script src="{{ asset('adminviews/js/app.js') }}" type="text/javascript"></script>
	<script src="{{ asset('adminviews/js/directives.js') }}" type="text/javascript"></script>
	<script src="{{ asset('adminviews/js/orderService.js') }}" type="text/javascript"></script>
	<!-- END APP LEVEL ANGULARJS SCRIPTS -->

	<!-- BEGIN APP LEVEL JQUERY SCRIPTS -->
	<script src="{{ asset('js/general.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/global/scripts/metronic.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/admin/layout/scripts/layout.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/admin/layout/scripts/quick-sidebar.js') }}" type="text/javascript"></script>
	<script src="{{ asset('assets/admin/layout/scripts/demo.js') }}" type="text/javascript"></script>  
	<script src="{{ asset('assets/admin/pages/scripts/login.js') }}" type="text/javascript"></script>
	<!-- END APP LEVEL JQUERY SCRIPTS -->

	

	<script src="{{ asset('js/angular-storage.js') }}" type="text/javascript"></script>

	<script src="{{ asset('assets/global/plugins/datatables/all.min.js') }}" type="text/javascript"></script>

	<!-- FULL CALENDER -->

	<link rel="stylesheet" href="{{ asset('bower_components/fullcalendar/dist/fullcalendar.css') }}"/>
	
	
	<script type="text/javascript" src="{{ asset('bower_components/moment/min/moment.min.js') }}"></script>	
	<script type="text/javascript" src="{{ asset('bower_components/angular-ui-calendar/src/calendar.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/fullcalendar/dist/fullcalendar.min.js') }}"></script>
	
	<!-- FULL CALENDER -->

	<script type="text/javascript">
		/* Init Metronic's core jquery plugins and layout scripts */
		function getCookie(c_name) {
	        if(document.cookie.length > 0) {
	            c_start = document.cookie.indexOf(c_name + "=");
	            if(c_start != -1) {
	                c_start = c_start + c_name.length + 1;
	                c_end = document.cookie.indexOf(";", c_start);
	                if(c_end == -1) c_end = document.cookie.length;
	                return unescape(document.cookie.substring(c_start,c_end));
	            }
	        }
	        return "";
	    }

		$(document).ready(function() {   
			Metronic.init(); // Run metronic theme
			Metronic.setAssetsPath('{{ asset("assets") }}/'); // Set the assets folder path
			//Layout.init();			
		});

		window.onload = function(){
			Layout.init();
		}

		
        $( document ).ajaxComplete(function(e,res) {
		  if(res.status==401){    
		    window.location.hash = '#/logout'    
		  }  
		});
	    
		
	</script>
	<!-- END JAVASCRIPTS -->
</body>
<!-- END BODY -->
</html>