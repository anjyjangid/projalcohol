<!DOCTYPE html>
<html ng-app="AlcoholDelivery">

	<head>
		<style>
		.modal-open .navbar-fixed-top{
			width:calc(100% - 17px);
		}

		.checkouter-td-right-text{
			width:74%;
			float:left;
		}

		</style>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<title>Alcohol Delivery</title>

		<!-- Bootstrap -->
		<link href='https://fonts.googleapis.com/css?family=Work+Sans:400,300,600,700,800,500' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
		<link rel="stylesheet" type="text/css" href="css/owl.carousel.css">
		<link rel="stylesheet" type="text/css" href="css/owl.theme.css">
		<link rel="stylesheet" type="text/css" href="css/jquery.switchButton.css">
		<link rel="stylesheet" type="text/css" href="css/jquery.mCustomScrollbar.css">
		<link rel="stylesheet" type="text/css" href="css/jquery.bootstrap-touchspin.css">
		<link rel="stylesheet" type="text/css" href="css/screen-ui.css">
		<link rel="stylesheet" type="text/css" href="css/ui_responsive.css">
		<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->
	</head>
	<body>
		<div ui-view></div>
		<script type="text/javascript" src="js/jquery-1.11.3.min.js"></script>

    <script type="text/javascript" src="{{asset('bower_components/dropzone/dist/dropzone.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/bootstrap/dist/js/bootstrap.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular/angular.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular-route/angular-route.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular-cookies/angular-cookies.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('bower_components/angular-loading-bar/build/loading-bar.min.js')}}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-ui-router/release/angular-ui-router.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/oclazyload/dist/ocLazyLoad.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js') }}"></script>
    <!-- <script type="text/javascript" src="{{asset('bower_components/angular-owl-carousel/src/angular-owl-carousel.js')}}"></script> -->

		

    <script type="text/javascript" src="js/app.js"></script>
	</body>
</html>
