<!DOCTYPE html>
<html ng-app="AlcoholDelivery">
	<head>
		<base href="/">
		<meta charset="utf-8">
		<meta name="fragment" content="!">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />		
		<meta name="title" content="@{{meta.title}}">
		<meta name="description" content="@{{meta.description}}">
		<meta name="image" content="{{url()}}@{{meta.img}}">
		<meta name="keywords" content="@{{meta.keyword}}">

		<!--TWITTER META-->
		<meta name="twitter:card" content="summary">
		<meta name="twitter:site" content="@{{meta.site_name}}">
		<meta name="twitter:title" content="@{{meta.title}}">
		<meta name="twitter:description" content="@{{meta.description}}" />
		<meta name="twitter:creator" content="@{{meta.site_name}}">
		<meta name="twitter:image:src" content="{{url()}}@{{meta.img}}" />
	    <!--FACEBOOK/OPEN GRAPH META -->
		<meta property="fb:app_id" content="@{{meta.fbid}}" />
		<meta property="og:type" content="website" />
		<meta property="og:title" content="@{{meta.title}}" />
		<meta property="og:image" content="{{url()}}@{{meta.img}}" />
		<meta property="og:site_name" content="@{{meta.site_name}}" />
		<meta property="og:description" content="@{{meta.description}}" />
		<meta property="og:url" content="@{{meta.url}}" />		
       
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
		
		<meta name="google-site-verification" content="89WKkM4ineKdT62fjxZwCKUhQCOZyE7wTbCpvlfDt2E"/> 

		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		<title ng-bind="meta.title"></title>

		<!-- Bootstrap -->
		<link href='https://fonts.googleapis.com/css?family=Work+Sans:400,300,600,700,800,500' rel='stylesheet' type='text/css'>
		<link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
		
		<link rel="stylesheet" href="css/all.css">		
		
		<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->

		<link rel="shortcut icon" href="images/favicon.ico"/>	
		
		<!-- Facebook Pixel Code -->
		<script>
		!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
		n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
		n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
		t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
		document,'script','https://connect.facebook.net/en_US/fbevents.js');
		fbq('init', '761659053968120'); // Insert your pixel ID here.
		fbq('track', 'PageView');
		</script>
		<noscript><img height="1" width="1" style="display:none"
		src="https://www.facebook.com/tr?id=761659053968120&ev=PageView&noscript=1"
		/></noscript>
		<!-- DO NOT MODIFY -->
		<!-- End Facebook Pixel Code -->

		<!-- Google analytics -->
		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
		 
		  ga('create', 'UA-31785217-1', 'auto');
		  ga('send', 'pageview');
		 
		</script>
		<script async type="text/javascript" src="//www.googleadservices.com/pagead/conversion_async.js" charset="utf-8"></script>		
		<!-- Google analytics -->
	</head>

	<body ng-controller="AppController" ng:class="{'loadingpayment':loadingmsg}" ng-cloak>		    	    	
    	<div ng-spinner-bar class="page-spinner-bar">
			<div class="bounce1"></div>
			<div class="bounce2"></div>
			<div class="bounce3"></div>
		</div>		
    	<div class="loader"></div>
    	<div ng-bind="loadingmsg" ng-show="loadingmsg" class="ldmsg" align="center"></div>
    	<div id="wrapper">     	    		    		

	        <div id="page-content-wrapper">    	
	    
             	<top-menu></top-menu>

	    		<div ui-view class="ancontainer" md-swipe-left="onSwipeLeft()" md-swipe-right="onSwipeRight()"></div>    		
				
				<div id="sectionarea" class="hide">
				<section class="fullwidth social_block" style="padding: 10px 0px;">
					<div class="container">
						<div align="center">
							<div class="occassion_sale ng-scope" style="font-size: 40px;line-height: 34px; padding: 0px; color: #fff;">
								Your friends like us too.. 
							</div>						

							<div id="fboverlay" style="margin-top: 10px; color: #fff;" class="fb-like" data-width="250" data-href="https://www.facebook.com/alcoholdelivery.com.sg/" data-layout="standard" data-action="like" data-size="large" data-show-faces="true" data-share="true" >							
							</div>
						</div>						
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
		</div>		
		<div id="fb-root"></div>
				
	</body>

	<script async type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAO1xAu1wBu7NZOqNBn9aoYg-RVstm60jc&libraries=places"></script>

	<script type="text/javascript" src="js/build/all.js"></script>
	
	<!-- <script type="text/javascript" src="js/jquery-1.11.3.min.js"></script>   

    
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
	
	<script src="{{ asset('bower_components/sweetalert2/dist/sweetalert2.min.js') }}" type="text/javascript"></script>

	<script src="{{ asset('bower_components/ngSweetAlert2/SweetAlert.js') }}" type="text/javascript"></script>

	<script src="{{ asset('bower_components/es6-promise/es6-promise.min.js') }}" type="text/javascript"></script>

    <script type="text/javascript" src="{{ asset('bower_components/angular-animate/angular-animate.js') }}"></script>

	<script type="text/javascript" src="{{ asset('bower_components/angular-aria/angular-aria.min.js') }}"></script>
	<script type="text/javascript" src="{{ asset('bower_components/angular-messages/angular-messages.min.js') }}"></script>	

	<script src="{{ asset('bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js')}}"></script>
	<script src="{{ asset('bower_components/ng-scrollbars/dist/scrollbars.min.js')}}"></script>	
	
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
    <script src="{{ asset('bower_components/v-accordion/dist/v-accordion.js') }}"></script>        -->
</html>