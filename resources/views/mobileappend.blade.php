<!DOCTYPE html>
<html ng-app="MobileApp">
	<head>
		<base href="/">
		<meta charset="utf-8">
		<meta name="fragment" content="!">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="title" content="@{{meta.title}}">
		<meta name="description" content="@{{meta.description}}">
		<meta name="image" content="{{url()}}@{{meta.img}}">
		<meta name="keywords" content="@{{meta.keyword}}">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<title ng-bind="meta.title"></title>

		<!-- Bootstrap -->
		<link href='https://fonts.googleapis.com/css?family=Work+Sans:400,300,600,700,800,500' rel='stylesheet' type='text/css'>
		<link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
		
		<link rel="stylesheet" href="css/all.css">

		<!-- Angular Material style sheet -->
		<link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.css">

		<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->

		<link rel="shortcut icon" href="images/favicon.ico"/>
	</head>

	<body ng:class="{'loadingpayment':loadingmsg}" ng-cloak>
    	<div ng-spinner-bar class="page-spinner-bar">
			<div class="bounce1"></div>
			<div class="bounce2"></div>
			<div class="bounce3"></div>
		</div>
    	<div class="loader"></div>
    	<div ng-bind="loadingmsg" ng-show="loadingmsg" class="ldmsg" align="center"></div>

    	<div id="wrapper">
	        <div id="page-content-wrapper">
	        	<!-- Views Section Start -->
	        	<div ui-view></div>
	        	<!-- Views Section End -->
			</div>
		</div>
	</body>

	<style type="text/css">
		.device_card_section{
			min-height: 383px;
		}

		.innerpagemargintop{
		    margin-top: 99px;
		}

		.christmas-mainouter{
			background-color: #FFF;
		}

		.divider{
			padding-top: 10px;
		}

		.div_please_choose_time_text{
			background-color: lightgray;
			border-radius: 6px;
			color: #000;
			font-family: Work Sans;
			font-size: 14px;
			padding: 11px;
			text-align: center;
			width: 100%;
		}

		.checkouterlastdiv{
			float: none;
			text-align: center;
		}

		.checkoutmiddletable{
			float: none;
		}

		.checkoutcheckoutnowbutton2{
			text-align: center;
			width: 100%;
		}

		.availablecards span{
			font-weight: 500;
		}

		.availablecards table{
			margin-top: 9px;
		}
	</style>

	<script type="text/javascript" src="js/jquery-1.11.3.min.js"></script>
	<script type="text/javascript" src="{{ asset('bower_components/bootstrap/dist/js/bootstrap.min.js') }}"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js"></script>
	<script type="text/javascript" src="{{ asset('bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js') }}"></script>
	<script src="{{ asset('assets/global/plugins/angularjs/angular-sanitize.min.js') }}" type="text/javascript"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-route/angular-route.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-cookies/angular-cookies.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-ui-router/release/angular-ui-router.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/sweetalert2/dist/sweetalert2.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/ngSweetAlert2/SweetAlert.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/es6-promise/es6-promise.min.js') }}"></script>
	<!-- Angular Material requires Angular.js Libraries -->
	<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-animate.min.js"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-aria.min.js"></script>
	<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-messages.min.js"></script>
	<!-- Angular Material Library -->
	<script src="http://ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.js"></script><script src="{{ asset('js/owl.carousel.min.js') }}"></script>

	<script type="text/javascript" src="js/mobileapp.js"></script>



	<!--<script type="text/javascript" src="js/build/all.js"></script>

	<script type="text/javascript" src="js/jquery-1.11.3.min.js"></script>
	<script type="text/javascript" src="{{ asset('bower_components/bootstrap/dist/js/bootstrap.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular/angular.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js') }}"></script>
    <script src="{{ asset('assets/global/plugins/angularjs/angular-sanitize.min.js') }}" type="text/javascript"></script>
    <script src="{{ asset('assets/global/plugins/jquery.pulsate.min.js') }}" type="text/javascript"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-route/angular-route.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-cookies/angular-cookies.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-ui-router/release/angular-ui-router.min.js') }}"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/SVG-Morpheus/0.1.8/svg-morpheus.js"></script>

    <script type="text/javascript" src="{{asset('js/morpher.js')}}"></script>

    <script type="text/javascript" src="https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.js"></script>


    <script type="text/javascript" src="{{ asset('bower_components/angular-animate/angular-animate.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-aria/angular-aria.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-messages/angular-messages.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js')}}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/ng-scrollbars/dist/scrollbars.min.js')}}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-material/angular-material.min.js') }}"></script>

	<script src="{{ asset('js/owl.carousel.min.js') }}"></script>
    <script type="text/javascript" src="js/app.js"></script>
    <script type="text/javascript" src="js/controller.js"></script>
    <script type="text/javascript" src="js/alcoholServices.js"></script>
    <script type="text/javascript" src="js/alcoholCart.js"></script>
    <script type="text/javascript" src="js/cartFactories.js"></script>
    <script type="text/javascript" src="js/alcoholWishlist.js"></script>
    <script type="text/javascript" src="js/alcoholCartDirective.js"></script>
    <script type="text/javascript" src="js/directive.js"></script>
    <script src="{{ asset('bower_components/v-accordion/dist/v-accordion.js') }}"></script>-->
</html>