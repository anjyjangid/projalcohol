/*This is the main file where angular is defined*/
var AlcoholDelivery = angular.module('AlcoholDelivery', ["ui.router", 'ngCookies','oc.lazyLoad', 'ui.bootstrap', 'bootstrapLightbox', 'angular-loading-bar']);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
AlcoholDelivery.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);



/* Setup Rounting For All Pages */
AlcoholDelivery.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/");  
    
    $stateProvider
        // Dashboard
        
        .state('index', {
            url: "/",
            templateUrl: "/templates/index.html",
            controller:function(){
                setTimeout(initScripts,100)
            },
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AlcoholDelivery',
                        insertBefore: '#ng_load_plugins_before',
                        // debug: true,
                        serie: true,
                        files: [
                            'js/owl.carousel.min.js',
                            'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js',
                            'js/jquery.switchButton.js',
                            'js/jquery.mCustomScrollbar.concat.min.js',
                            'js/jquery.bootstrap-touchspin.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.ui.min.js',
                            'js/all_animations.js',
                            'js/js_init_scripts.js'
                        ] 
                    });
                }]
            }
        })


        .state('mainLayout', {
            templateUrl: "/templates/mainLayout.html",
            controller:function(){
                setTimeout(function(){
                    initScripts({
                        disableScrollHeader:true
                    });
                },100)
            },
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AlcoholDelivery',
                        insertBefore: '#ng_load_plugins_before',
                        // debug: true,
                        serie: true,
                        files: [
                            'js/owl.carousel.min.js',
                            'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js',
                            'js/jquery.switchButton.js',
                            'js/jquery.mCustomScrollbar.concat.min.js',
                            'js/jquery.bootstrap-touchspin.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.2/velocity.ui.min.js',
                            'js/all_animations.js',
                            'js/js_init_scripts.js'
                        ] 
                    });
                }]
            }
        })


        .state('mainLayout.product', {
            url: "/product",
            templateUrl: "/templates/product/index.html"
        })

        .state('mainLayout.cart', {
            url: "/cart",
            templateUrl: "/templates/cart.html",
            controller:function(){
                setTimeout(function(){
                    initScripts({
                        disableScrollHeader:true
                    });
                },100)
            }
        })
    }
    
]);

AlcoholDelivery.directive('sideBar', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/partials/sidebar.html',
    controller: function(){
        function bindNavbar() {
          if ($(window).width() > 767) {
                
                $('ul.nav li.dropdown').hover(function() {
                  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
                }, function() {
                  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
                });  
              
            }
          else {
           $('.navbar-default .dropdown').off('mouseover').off('mouseout');
          }
         }
         
         $(window).resize(function() {
          bindNavbar();
         });
         
         bindNavbar();
    }
  };
});

AlcoholDelivery.directive('topMenu', function() {
  return {
    restrict: 'E',
    templateUrl: '/templates/partials/topmenu.html',
    controller: function(){}
  };
});

/* Init global settings and run the app */
AlcoholDelivery.run(["$rootScope", "$state", function($rootScope, $state) {
    $rootScope.$state = $state; // state to be accessed from view
}]);