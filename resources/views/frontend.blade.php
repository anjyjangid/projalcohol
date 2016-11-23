<!DOCTYPE html>
<html ng-app="AlcoholDelivery">
	<head>
		<!-- <base href="/"> -->
		<meta charset="utf-8">

		<meta name="fragment" content="!">

		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		
		<meta name="title" content="@{{meta.title}}">

		<meta name="description" content="@{{meta.description}}">

		<meta name="keywords" content="@{{meta.keyword}}">

		
		<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
		
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<title class="hide" ng-bind="meta.title"></title>

		<!-- Bootstrap -->
		<link href='https://fonts.googleapis.com/css?family=Work+Sans:400,300,600,700,800,500' rel='stylesheet' type='text/css'>
		<link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
		
		<link rel="stylesheet" type="text/css" href="{{ asset('bower_components/angular-material/angular-material.min.css') }}"/>

		<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
		<link rel="stylesheet" type="text/css" href="css/owl.carousel.css">
		<link rel="stylesheet" type="text/css" href="css/owl.theme.css">
		<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" type="text/css" rel="stylesheet" />

		<link rel="stylesheet" type="text/css" href="{{ asset('bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css')}}">

		<link rel="stylesheet" type="text/css" href="css/jquery.bootstrap-touchspin.css">
		<!-- SWEET ALERT STYLE -->
		<link rel="stylesheet" type="text/css" href="{{ asset('bower_components/sweetalert2/dist/sweetalert2.css') }}"/>

		<link rel="stylesheet" type="text/css" href="css/common.css">
		<link rel="stylesheet" type="text/css" href="css/screen-ui.css">
		<link rel="stylesheet" type="text/css" href="css/ui_responsive.css">       
        
		<link rel="stylesheet" type="text/css" href="css/app.css">
		<link rel="stylesheet" type="text/css" href="{{ asset('bower_components/v-accordion/dist/v-accordion.css') }}">
		<script src="js/general.js"></script>
		<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->
		<link rel="stylesheet" media="screen and (max-device-width:1023px)" type="text/css" href="css/simple-sidebar.css">
		


		<link rel="shortcut icon" href="images/favicon.ico"/>	
		
	</head>

	<body ng-controller="AppController" ng:class="{'loadingpayment':loadingmsg}">		    	    	     	
    	<div class="loader"></div>
    	<div ng-bind="loadingmsg" ng-show="loadingmsg" class="ldmsg" align="center"></div>
    	<div id="wrapper">     	    		    		

	        <div id="page-content-wrapper">    	
	    
             	<top-menu></top-menu>          
        
	    		<div ui-view class="ancontainer"></div>
	    		<div id="fb-root"></div>
				<script>(function(d, s, id) {
				  var js, fjs = d.getElementsByTagName(s)[0];
				  if (d.getElementById(id)) return;
				  js = d.createElement(s); js.id = id;
				  js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.8";
				  fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'facebook-jssdk'));</script>
				<section class="fullwidth social_block" style="padding: 10px 0px;">
					<div class="container">
						<div align="center">
						<div class="occassion_sale ng-scope" style="font-size: 40px;line-height: 34px; padding: 0px; color: #fff;">
							Your friends like us too.. 
						</div>						
						<div id="fboverlay" style="margin-top: 10px; color: #fff;" class="fb-like" data-href="https://www.facebook.com/alcoholdelivery.com.sg/" data-layout="standard" data-action="like" data-size="large" data-show-faces="true" data-share="true" >
							
						</div>
						</div>
						<!-- <div class="socilblok_folowtxt">
							<div class="socilblok_folowtxt1">Follow and like us for latest deals and updates:
							</div>
						</div>
						<div class="socilblok_twtr" style="margin-left: 20px;">
						<div class="fb-like" data-href="https://www.facebook.com/alcoholdelivery.com.sg/" data-layout="standard" data-action="like" data-size="large" data-show-faces="true" data-share="true" ></div>
						</div> -->
						<!-- <div class="socilblok_twtr">
							<a target="_blank" href="@{{settings.social.twitter}}"><img class="img-responsive" src="images/socl_itwtr.png" />
							<span>Twitter</span>
							</a>
						</div>
						<div class="socilblok_fb">
							<a target="_blank" href="@{{settings.social.facebook}}"><img class="img-responsive" src="images/social_fbicon.png" />
							<span>Facebook</span>
							</a>
						</div> -->
					</div>
				</section>				
				<section class="fullwidth footer1">
					<div class="container">
						<div class="row">						
							<div class="col-xs-12 col-md-4 ">
								<div class="footer1_title">Need help?</div>
								<div class="footer1_subtitle">
									<ul>
										<li>
										<a>Call us daily from 12:00pm – 10:30pm <br/> at 9-2445533 (9-CHILLED) or email sales@alcoholdelivery.com.sg</a>
										</li>										
									</ul>
								</div>
								<div class="footer1_sociallink">
									<a target="_blank" href="@{{settings.social.twitter}}"><img class="img-responsive" src="images/footer1_twitter.png" /></a>
									<a target="_blank" href="@{{settings.social.facebook}}"><img class="img-responsive" src="images/footer1_fb.png" /></a>
									<!-- <a target="_blank" href="@{{settings.social.googleplus}}"><img class="img-responsive" src="images/footergoogle.png" /></a> -->
								</div>
							</div>
							<div class="col-xs-12 col-md-2">
								<div class="footer1_title">Customer Service</div>
								<div class="footer1_subtitle">
									<ul>
										<li ng-repeat="links in getLinks('services',settings.pages)">
											<a target="_blank" ui-sref="cmsLayout.pages({slug:links.slug})" ng-bind="::links.linkTitle"></a>
										</li>										
									</ul>
								</div>
							</div>
							<div class="col-xs-12 col-md-2 ">
								<div class="footer1_title">About AlcoholDelivery</div>
								<div class="footer1_subtitle">
									<ul>
										<li ng-repeat="links in getLinks('about',settings.pages)">
											<a target="_blank" ui-sref="cmsLayout.pages({slug:links.slug})" ng-bind="::links.linkTitle"></a>
										</li>										
									</ul>
								</div>
							</div>
							<div class="col-xs-12 col-md-2 ">
								<div class="footer1_title">Corporate</div>
								<div class="footer1_subtitle">
									<ul>										
										<li ng-repeat="links in getLinks('corporate',settings.pages)">
											<a target="_blank" ui-sref="cmsLayout.pages({slug:links.slug})" ng-bind="::links.linkTitle"></a>
										</li>
									</ul>
								</div>
							</div>
							

							<div class="col-xs-12 col-md-2 ">
								<div class="footer1_title">Connect with us</div>
								<div class="footer1_subtitle">
									<ul>										
										<li><a>Facebook</a></li>
										<li><a>Mobile Apps</a></li>
									</ul>
								</div>
							</div>
							<!-- <div class="col-xs-12 col-md-3 footer1_pannel2cvr">
								<div class="footer1_title">About</div>
								<div class="footer1_subtitle">
									<ul>
										<li><a ui-sref="cmsLayout.about-us">About us</a></li>
										<li><a href="#">How it Works</a></li>
										<li><a href="#">Team</a></li>
										<li><a href="#">Mobile App</a></li>
										<li><a href="#">Desktop App</a></li>
										<li><a href="#">Security</a></li>
										<li><a href="#">Report Bug</a></li>
										<li><a href="#">Fees & Charges</a></li>
										<li><a href="#">Investor</a></li>
										<li><a href="#">Quotes</a></li>
									</ul>
								</div>
							</div>
							<div class="col-xs-12 col-md-3 footer1_pannel3cvr">
								<div class="footer1_title">Press</div>
								<div class="footer1_subtitle">
									<ul>
										<li><a href="#">In the News</a></li>
										<li><a href="#">Press Releases</a></li>
										<li><a href="#">Awards</a></li>
										<li><a href="#">Testimonials</a></li>
										<li><a href="#">Timeline</a></li>
									</ul>
								</div>
							</div>
							<div class="col-xs-12 col-md-2 footer1_pannel4cvr">
								<div class="footer1_title">Get in Touch</div>
								<div class="footer1_subtitle">
									<ul>
										<li><a href="#">Get Support</a></li>
										<li><a href="#">Advertise with Us</a></li>
										<li><a href="#">Careers</a></li>
										<li><a href="#">Community</a></li>
										<li><a href="#">Affiliate Program</a></li>
										<li><a href="#">Merchandise</a></li>
										<li><a href="#">Contact Us</a></li>
									</ul>
								</div>
							</div> -->
						</div>
					</div>
				</section>

				<section class="fullwidth footer2">
		        <div class="footer-container-borderset">
					<div class="container ">
						<div class="footer2_btmcvr">
							<div class="footer2_madetxt">Made with <img class="img-responsive" src="images/footerhearicon.png" /> in SG</div>
							<div class="footer2_copytxt">Copyright &copy; <?php echo date('Y');?> AlcoholDelivery.com.sg</div>
						</div>
					</div>
		        </div>
				</section>		
			</div>
		</div>
		
	</body>

	<script type="text/javascript" src="js/jquery-1.11.3.min.js"></script>
   
    
	<script type="text/javascript" src="js/social.js"></script>
    <script type="text/javascript" src="{{ asset('bower_components/bootstrap/dist/js/bootstrap.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular/angular.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js') }}"></script> 

    <script src="{{ asset('assets/global/plugins/angularjs/angular-sanitize.min.js') }}" type="text/javascript"></script>	

    <script type="text/javascript" src="{{ asset('bower_components/angular-route/angular-route.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/angular-cookies/angular-cookies.min.js') }}"></script>
    
    <script type="text/javascript" src="{{ asset('bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
    
    
    <script type="text/javascript" src="{{ asset('bower_components/angular-ui-router/release/angular-ui-router.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/oclazyload/dist/ocLazyLoad.min.js') }}"></script>
    


    <script src="http://cdnjs.cloudflare.com/ajax/libs/SVG-Morpheus/0.1.8/svg-morpheus.js"></script>
	
    <script type="text/javascript" src="{{asset('js/morpher.js')}}"></script>

    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyAO1xAu1wBu7NZOqNBn9aoYg-RVstm60jc&libraries=places"></script>
    <script type="text/javascript" src="https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.js"></script>

    <!-- SWEET ALERT STYLE -->
	<script src="{{ asset('bower_components/sweetalert2/dist/sweetalert2.min.js') }}" type="text/javascript"></script>

	<script src="{{ asset('bower_components/ngSweetAlert2/SweetAlert.js') }}" type="text/javascript"></script>

	<script src="{{ asset('bower_components/es6-promise/promise.min.js') }}" type="text/javascript"></script>

    <script type="text/javascript" src="{{ asset('bower_components/angular-animate/angular-animate.js') }}"></script>

	<script type="text/javascript" src="{{ asset('bower_components/angular-aria/angular-aria.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-messages/angular-messages.min.js') }}"></script>
	

	<script src="{{ asset('bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js')}}"></script>
	<script src="{{ asset('bower_components/ng-scrollbars/dist/scrollbars.min.js')}}"></script>
	<script src="{{ asset('js/owl.carousel.min.js') }}"></script>	

	<!-- Angular Material Library -->
	<script type="text/javascript" src="{{ asset('bower_components/angular-material/angular-material.min.js') }}"></script>	
    <script type="text/javascript" src="js/app.js"></script>
    <script type="text/javascript" src="js/controller.js"></script>
    <script type="text/javascript" src="js/alcoholServices.js"></script>
    <script type="text/javascript" src="js/alcoholCart.js"></script>
    <script type="text/javascript" src="js/cartFactories.js"></script>
    <script type="text/javascript" src="js/alcoholWishlist.js"></script>
    <script type="text/javascript" src="js/alcoholCartDirective.js"></script>
    <script type="text/javascript" src="js/directive.js"></script>
    <script src="{{ asset('bower_components/angular-fblogin/dist/angular-fblogin.js') }}"></script>   
    <script src="{{ asset('bower_components/v-accordion/dist/v-accordion.js') }}"></script>   
            
</html>
