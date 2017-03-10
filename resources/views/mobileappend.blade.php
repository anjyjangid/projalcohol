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

	        	<!-- Header Start -->
				<top-menu>
					<nav tscroll class="navbar navbar-default navbar-fixed-top ">
						<div class="main-header-botm-cover">
							<div class="container">
								<div class="btm10" id="headcontainer">
									<div class="searchtop again21">
										<a class="search_icon"></a>
										<a ng-click="searchbar(0); openSearch=!openSearch" class="search_close">&times;</a>
									</div>
									<div ng-click="openMenu()" class="menu-icon">
										<span class="line"></span>
										<span class="line"></span>
										<span class="line"></span>
									</div>
								</div>

								<!-- LOGO START -->
								<div class="logoss">
									<div class="logos-inner-cover">
										<a ui-sref="mainLayout.index">
											<div class="logo-top-img-main">
												<svg id="icon" version="1.1" id="Layer_1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" x="0px" y="0px" enable-background="new 0 0 171 76" xml:space="preserve" viewBox="0 0 171 76">
													<g display="none" id="question">
														<path fill="rgb(62,45,24)" d="M110.9,27l-1.3-2.7c-0.7-1.4-2.3-2.1-3.7-1.5c-0.3-0.2-0.6-0.2-0.9-0.1l-0.9,0.4c-0.3,0.1-0.5,0.4-0.5,0.7
														l-8.5,4c-2.3-1.5-5.3-1.9-8-0.6l-14.9,6.9l0,0l-7.9,3.7c-4,1.9-5.7,6.7-3.7,10.8c1.9,4,6.7,5.9,10.7,4L83,47.1l0,0L94,42
														c2.5-1.2,4.1-3.4,4.6-6l8.8-4.1c0.2,0.1,0.5,0.1,0.8,0l0.9-0.4c0.3-0.1,0.4-0.4,0.5-0.6C110.9,30.1,111.5,28.5,110.9,27z"/>
													</g>
													<g display="block" id="answer">
														<path fill="rgb(62,45,24)" d="M34.1,39.7c0.8-0.6,1.8-1.3,3-2c-0.3-0.9-0.5-1.9-0.6-2.8c-0.2-2,0.2-4.7,5.5-7.2c3.7-1.7,5-2.4,8.8-4.2
														C59,19.8,69.4,14.9,77.6,11c1.8-0.9,3-1.2,4-1.2c1.1,0,1.9,0.4,3.2,0.8c1.2,0.4,2.1,1.1,3.6,1.1h0.1c1.1,0,2.4-0.6,3.8-1.2
														C95.6,9,99.1,7.7,102.5,6c0.7-0.4,1.6-0.6,2-1c0.2-0.1,0,0,0.1-0.2c0.1-0.2,1.4-0.9,1.9-0.9c0.1,0,0.1,0,0.2,0
														c0.1,0,0.2,0,0.3,0.2c0.1-0.2,0.6-0.5,1-0.5h0.1c0.6,0.1,1.4,2.1,1.9,3.1c0.5,1.2,1.6,2.9,1.2,3.5c-0.1,0.2-0.6,0.5-1,0.5
														c-0.1,0-0.1,0-0.2,0c0,0.2-0.1,0.4-0.4,0.6c-0.4,0.3-1.1,0.6-1.5,0.7H108c-0.1,0-0.2-0.1-0.3-0.1c0,0,0,0-0.1,0
														c-0.7,0.1-1.6,0.7-2.4,1.1c-2.5,1-5.2,2.3-7.6,3.4c-1.8,0.9-3.5,1.5-4.7,2.3c-1.3,0.9-2.1,3.6-2.1,3.6c-0.5,1.6-1.3,3.9-5.2,5.8
														c-5.7,2.7-12.7,6-19.6,9.3c1.1,0.6,2.2,1.4,3,2.4c0.3-0.1,0.6-0.3,0.9-0.4C76,36.5,82,33.7,87,31.3c5.4-2.5,6.5-6.2,7-7.9
														c0.2-0.7,0.7-1.6,0.9-1.9c0.6-0.4,1.4-0.7,2.3-1.2c0.6-0.3,1.2-0.5,1.8-0.8c2.7-1.3,5.3-2.5,7.4-3.4c0.4-0.2,0.8-0.4,1.2-0.5
														c0.1-0.1,0.3-0.1,0.4-0.2c0.3,0,0.5,0,0.8-0.1c1-0.2,2.2-0.8,2.7-1.2c0.2-0.1,0.4-0.3,0.6-0.5c0.9-0.4,1.6-1.1,2.1-1.9
														c1.2-2.1,0.1-4.2-0.8-6c-0.1-0.3-0.3-0.5-0.4-0.7c-0.1-0.1-0.1-0.2-0.2-0.4c-0.9-1.9-1.8-4.2-4.2-4.6c0,0-0.3,0-0.6,0
														c-0.7,0-1.3,0.2-1.9,0.4c0,0,0,0-0.1,0c-0.2,0-0.9,0.1-2.2,0.7c-0.6,0.3-1.2,0.6-1.7,1.1c0,0-0.1,0-0.1,0.1
														c-0.3,0.1-0.7,0.3-1.1,0.5c-2.1,1.1-4.3,2-6.5,2.9c-1.2,0.5-2.5,1.1-3.7,1.6c-0.5,0.2-1.9,0.9-2.4,0.9l0,0c-0.3,0-0.5-0.1-1.1-0.4
														c-0.4-0.2-0.8-0.4-1.3-0.5c-0.2-0.1-0.4-0.1-0.5-0.2c-1.1-0.4-2.3-0.8-3.9-0.8S78.3,6.8,76,7.8c-4.3,2-9.2,4.4-14.1,6.7
														c-4.4,2.1-8.8,4.1-12.7,6c-3.8,1.8-5.1,2.4-8.8,4.2c-5.5,2.6-7.9,6.1-7.5,10.7C33.2,36.8,33.6,38.3,34.1,39.7z M84.8,12.9
														c0,0-2.3-2.3-5.1-1.1C76.9,12.9,52,24.7,42,29.6c-2,1-3,2.2-3,4.5c0,0,0.8-2,3.6-3.2c2.8-1.2,36.9-17.7,36.9-17.7
														S82.1,11.7,84.8,12.9z M1,56.1h2.4c0.5,0,1.1-0.3,1.4-0.7L6.3,53c0.3-0.4,0.9-0.7,1.4-0.7h5.6c0.5,0,0.9,0.4,1,0.9l0.3,2.2
														c0.1,0.5,0.5,0.9,1,0.9h2.2c0.5,0,0.8-0.4,0.7-0.9L16,39.6c-0.1-0.5-0.5-0.9-1-0.9h-2c-0.5,0-1.1,0.3-1.4,0.7l-11.1,16
														C0.3,55.8,0.5,56.1,1,56.1z M9.6,48.2l2.8-4.3c0.3-0.4,0.5-0.3,0.6,0.1l0.6,4c0.1,0.5-0.3,0.9-0.8,0.9H10
														C9.5,48.9,9.3,48.6,9.6,48.2z M20.1,56.1h10.7c0.5,0,1-0.4,1.1-0.8l0.5-1.8c0.1-0.5-0.2-0.8-0.6-0.8h-6.9c-0.5,0-0.8-0.4-0.6-0.8
														l3.3-12.1c0.1-0.5-0.2-0.8-0.6-0.8h-2.1c-0.5,0-1,0.4-1.1,0.8l-4.2,15.6C19.3,55.8,19.6,56.1,20.1,56.1z M39.2,44
														c0.6-0.6,1.2-1.1,2-1.4c0.7-0.4,1.5-0.5,2.3-0.5c1,0,1.9,0.2,2.5,0.6c0.6,0.4,1.2,1.1,1.2,1.1c0.3,0.4,0.9,0.4,1.3,0.2l2.4-1.7
														c-0.7-1.1-1.6-2-2.7-2.7c-1.1-0.7-2.5-1-4.2-1c-1.5,0-2.8,0.3-4.1,0.8s-2.4,1.3-3.3,2.3c-0.9,1-1.7,2.1-2.2,3.3
														c-0.6,1.2-0.8,2.6-0.8,3.9c0,1.2,0.2,2.2,0.6,3.1c0.4,0.9,1,1.7,1.7,2.4c0.7,0.7,1.6,1.2,2.6,1.5c1,0.4,2.1,0.5,3.3,0.5
														c1.4,0,2.7-0.2,3.7-0.7c1-0.5,2.1-1.4,2.1-1.4c0.4-0.3,0.4-0.8,0.1-1.2l-1.9-1.9c-0.6,0.5-1.3,0.9-1.9,1.2
														c-0.6,0.3-1.3,0.5-2.2,0.5c-0.6,0-1.2-0.1-1.7-0.3c-0.5-0.2-1-0.5-1.3-0.9c-0.4-0.4-0.7-0.8-0.9-1.3c-0.2-0.5-0.3-1.1-0.3-1.7
														c0-0.9,0.2-1.8,0.5-2.6C38.2,45.3,38.7,44.6,39.2,44z M61.8,55.6c1.3-0.6,2.4-1.4,3.3-2.3c0.9-0.9,1.6-2,2.1-3.3
														c0.5-1.3,0.8-2.5,0.8-3.8c0-1.1-0.2-2.1-0.6-3c-0.4-0.9-0.9-1.7-1.6-2.4c-0.7-0.7-1.5-1.2-2.5-1.6c-1-0.4-2.1-0.6-3.2-0.6
														c-1.5,0-3,0.3-4.2,0.9c-1.3,0.6-2.4,1.4-3.3,2.3c-0.9,1-1.6,2-2.1,3.3c-0.5,1.2-0.8,2.5-0.8,3.8c0,1.1,0.2,2.1,0.6,3
														c0.4,0.9,0.9,1.7,1.6,2.4c0.7,0.7,1.5,1.2,2.5,1.6c1,0.4,2.1,0.6,3.2,0.6C59.1,56.4,60.5,56.2,61.8,55.6z M54.8,51.7
														c-0.4-0.4-0.7-0.9-0.8-1.4c-0.1-0.5-0.3-1.1-0.3-1.8s0.1-1.5,0.4-2.3c0.3-0.8,0.7-1.5,1.2-2.1s1.1-1.1,1.9-1.5
														c0.7-0.4,1.6-0.6,2.5-0.6c0.7,0,1.3,0.1,1.9,0.3c0.6,0.2,1,0.5,1.4,0.9c0.4,0.4,0.6,0.9,0.8,1.4c0.2,0.5,0.3,1.1,0.3,1.8
														c0,0.7-0.1,1.5-0.4,2.3c-0.3,0.8-0.7,1.5-1.2,2.1c-0.5,0.6-1.1,1.1-1.9,1.5c-0.8,0.4-1.6,0.6-2.5,0.6c-0.7,0-1.3-0.1-1.9-0.3
														C55.6,52.4,55.1,52.1,54.8,51.7z M78.2,55.3c-0.1,0.5,0.2,0.8,0.6,0.8h2.1c0.5,0,1-0.4,1.1-0.8l4.2-15.6c0.1-0.5-0.2-0.8-0.6-0.8
														h-2.1c-0.5,0-1,0.4-1.1,0.8L81,44.9c-0.1,0.5-0.6,0.8-1.1,0.8h-5.2c-0.5,0-0.8-0.4-0.6-0.8l1.4-5.2c0.1-0.5-0.2-0.8-0.6-0.8h-2.1
														c-0.5,0-1,0.4-1.1,0.8l-4.2,15.6c-0.1,0.5,0.2,0.8,0.6,0.8h2.1c0.5,0,1-0.4,1.1-0.8l1.4-5.3c0.1-0.5,0.6-0.8,1.1-0.8H79
														c0.5,0,0.8,0.4,0.6,0.8L78.2,55.3z M87.9,54.2c0.7,0.7,1.5,1.2,2.5,1.6c1,0.4,2.1,0.6,3.2,0.6c1.5,0,3-0.3,4.2-0.9
														c1.3-0.6,2.4-1.4,3.3-2.3c0.9-1,1.6-2,2.1-3.3c0.5-1.2,0.8-2.5,0.8-3.8c0-1.1-0.2-2.1-0.6-3c-0.4-0.9-0.9-1.7-1.6-2.4
														c-0.7-0.7-1.5-1.2-2.5-1.6c-1-0.4-2-0.6-3.2-0.6c-1.5,0-3,0.3-4.2,0.9c-1.3,0.6-2.4,1.4-3.3,2.3c-0.9,0.9-1.6,2-2.1,3.3
														c-0.5,1.2-0.8,2.5-0.8,3.8c0,1.1,0.2,2.1,0.6,3C86.7,52.7,87.2,53.6,87.9,54.2z M90.1,46.3c0.3-0.8,0.7-1.5,1.2-2.1
														s1.1-1.1,1.9-1.5c0.7-0.4,1.6-0.6,2.5-0.6c0.7,0,1.3,0.1,1.9,0.3c0.6,0.2,1,0.5,1.4,0.9c0.4,0.4,0.7,0.9,0.8,1.4
														c0.2,0.5,0.3,1.1,0.3,1.8s-0.1,1.5-0.4,2.3c-0.3,0.8-0.7,1.5-1.2,2.1s-1.1,1.1-1.9,1.5C95.8,52.8,95,53,94.1,53
														c-0.7,0-1.3-0.1-1.9-0.3c-0.6-0.2-1-0.5-1.4-0.9c-0.4-0.4-0.7-0.9-0.8-1.4c-0.1-0.5-0.3-1.1-0.3-1.8C89.7,47.8,89.8,47,90.1,46.3z
														M108.3,51.9l3.3-12.1c0.1-0.5-0.2-0.8-0.6-0.8h-2.1c-0.5,0-1,0.4-1.1,0.8l-4.2,15.6c-0.1,0.5,0.2,0.8,0.6,0.8h10.7
														c0.5,0,1-0.4,1.1-0.8l0.5-1.8c0.1-0.5-0.2-0.8-0.6-0.8H109C108.5,52.7,108.2,52.3,108.3,51.9z M16.2,60.8
														c-0.7-0.7-1.5-1.2-2.6-1.6c-1.1-0.4-2.8-0.5-2.8-0.5c-0.7,0-1.9-0.1-2.6-0.1H5.7c-0.7,0-1.5,0.6-1.6,1.3L0,74.6
														c-0.2,0.7,0.2,1.3,1,1.3h5.1c2,0,3.8-0.3,5.3-0.8s2.8-1.3,3.8-2.4c0.9-0.9,1.6-2,2.1-3.1c0.5-1.1,0.7-2.4,0.7-3.7
														C18,63.7,17.4,62.1,16.2,60.8z M13.6,68.4c-0.3,0.7-0.7,1.4-1.3,2c-0.7,0.7-1.5,1.2-2.5,1.6s-1.9,0.4-1.9,0.4
														c-0.7,0.1-1.8,0.1-2.4,0.1c-0.6,0-0.9-0.6-0.7-1.3l2.1-7.9C7.1,62.6,7.8,62,8.5,62H9c1,0,1.8,0.1,2.4,0.3s1.2,0.5,1.5,0.9
														c0.7,0.7,1,1.6,1,2.7C14.1,66.9,13.9,67.6,13.6,68.4z M24.5,63.2c0.2-0.7,0.9-1.3,1.6-1.3h6.5c0.7,0,1.5-0.6,1.6-1.3l0.2-0.9
														c0.2-0.7-0.2-1.3-1-1.3H23.3c-0.7,0-1.5,0.6-1.6,1.3l-4,14.8c-0.2,0.7,0.2,1.3,1,1.3h10.4c0.7,0,1.5-0.6,1.6-1.3l0.2-0.9
														c0.2-0.7-0.2-1.3-1-1.3h-6.7c-0.7,0-1.2-0.6-1-1.3l0.3-1.1c0.2-0.7,0.9-1.3,1.6-1.3h5.4c0.7,0,1.5-0.6,1.6-1.3l0.2-0.8
														c0.2-0.7-0.2-1.3-1-1.3h-5.4c-0.7,0-1.2-0.6-1-1.3L24.5,63.2z M44.6,72.4h-6c-0.7,0-1.2-0.6-1-1.3l3-11.3c0.2-0.7-0.2-1.3-1-1.3
														h-1.2c-0.7,0-1.5,0.6-1.6,1.3l-4,14.8c-0.2,0.7,0.2,1.3,1,1.3h9.8c0.7,0,1.5-0.6,1.6-1.3l0.3-0.9C45.7,73,45.3,72.4,44.6,72.4z
														M53.3,58.6h-1.2c-0.7,0-1.5,0.6-1.6,1.3l-4,14.8c-0.2,0.7,0.2,1.3,1,1.3h1.2c0.7,0,1.5-0.6,1.6-1.3l4-14.8
														C54.4,59.1,54,58.6,53.3,58.6z M71.2,58.6h-1.7c-0.7,0-1.6,0.5-2,1.1l-6.3,9.9c-0.4,0.6-0.8,0.5-0.8-0.2l-0.9-9.5
														c-0.1-0.7-0.7-1.3-1.4-1.3h-1.5c-0.7,0-1.2,0.6-1.1,1.3l1.9,14.8c0.1,0.7,0.8,1.3,1.5,1.3h0.8c0.7,0,1.6-0.5,2-1.1l10.1-15.2
														C72.2,59.1,71.9,58.6,71.2,58.6z M75.9,63.2c0.2-0.7,0.9-1.3,1.6-1.3H84c0.7,0,1.5-0.6,1.6-1.3l0.2-0.9c0.2-0.7-0.2-1.3-1-1.3
														H74.7c-0.7,0-1.5,0.6-1.6,1.3l-4,14.8c-0.2,0.7,0.2,1.3,1,1.3h10.4c0.7,0,1.5-0.6,1.6-1.3l0.2-0.9c0.2-0.7-0.2-1.3-1-1.3h-6.7
														c-0.7,0-1.2-0.6-1-1.3l0.3-1.1c0.2-0.7,0.9-1.3,1.6-1.3h5.4c0.7,0,1.5-0.6,1.6-1.3l0.2-0.8c0.2-0.7-0.2-1.3-1-1.3h-5.4
														c-0.7,0-1.2-0.6-1-1.3L75.9,63.2z M98.1,59c-0.9-0.3-2-0.4-2-0.4c-0.7,0-1.9-0.1-2.6-0.1h-3.7c-0.7,0-1.5,0.6-1.6,1.3l-4,14.8
														c-0.2,0.7,0.2,1.3,1,1.3h1.2c0.7,0,1.5-0.6,1.6-1.3l0.8-3c0.2-0.7,0.9-1.3,1.6-1.3h0.2c0.7,0,1.6,0.5,1.9,1.2l1.5,3.2
														c0.3,0.6,1.2,1.2,1.9,1.2h1.7c0.7,0,1-0.5,0.7-1.2L96.1,70c1.7-0.4,3-1.1,4-2.1c0.5-0.5,0.9-1.1,1.2-1.8c0.3-0.7,0.4-1.5,0.4-2.3
														c0-1.4-0.4-2.6-1.3-3.5C99.8,59.7,99,59.3,98.1,59z M97,65.9c-0.4,0.4-0.9,0.7-1.5,0.8c-0.6,0.2-0.7,0.2-0.7,0.2
														c-0.7,0-1.9,0.1-2.6,0.1h-0.8c-0.7,0-1.2-0.6-1-1.3l0.7-2.5c0.2-0.7,0.9-1.3,1.6-1.3h1.9c1.2,0,2,0.2,2.5,0.7
														c0.4,0.4,0.5,0.8,0.5,1.4C97.7,64.8,97.5,65.4,97,65.9z M117.2,58.6h-2c-0.7,0-1.7,0.5-2.1,1l-4.3,5.2c-0.5,0.6-1,0.4-1.2-0.3
														l-1.3-4.7c-0.2-0.7-0.9-1.3-1.7-1.3H103c-0.7,0-1.1,0.6-0.9,1.2l2.7,8c0.2,0.7,0.3,1.8,0.1,2.5l-1.2,4.3c-0.2,0.7,0.2,1.3,1,1.3
														h1.2c0.7,0,1.5-0.6,1.6-1.3l1.1-4c0.2-0.7,0.7-1.7,1.2-2.2l7.7-8.9C118.1,59,117.9,58.6,117.2,58.6z M126,42.3h25.5
														c0.6,0,1.1-0.5,1.1-1.1s-0.5-1.1-1.1-1.1H126c-0.6,0-1.1,0.5-1.1,1.1S125.4,42.3,126,42.3z M118.2,52.2h25.5
														c0.6,0,1.1-0.5,1.1-1.1c0-0.6-0.5-1.1-1.1-1.1h-25.5c-0.6,0-1.1,0.5-1.1,1.1C117.1,51.7,117.6,52.2,118.2,52.2z M169.8,60.3H126
														c-0.6,0-1.1,0.5-1.1,1.1c0,0.6,0.5,1.1,1.1,1.1h43.9c0.6,0,1.1-0.5,1.1-1.1C170.9,60.8,170.4,60.3,169.8,60.3z M143,70.5h-25.5
														c-0.6,0-1.1,0.5-1.1,1.1c0,0.6,0.5,1.1,1.1,1.1H143c0.6,0,1.1-0.5,1.1-1.1C144.1,71,143.6,70.5,143,70.5z"/>
													</g>
												</svg>
												<!-- <div id="myLogo"></div> -->
											</div>
										</a>
									</div>
								</div>
								<!-- LOGO END -->

							</div>
						</div>
					</nav>
				</top-menu>
				<!-- Header End -->

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