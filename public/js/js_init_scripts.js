function initScripts(options){
		if(typeof options == "undefined")
			options = {};
		// $(document).ready(function() {
		 
		 
		 	$("#owl-demo").owlCarousel({
				navigation : true,
				navigationText :	["<",">"],
				pagination : false,
				items : 4,
				itemsDesktop : [1199,4],
				itemsDesktopSmall : [979,4],
				itemsTablet : [768,3],
				itemsTabletSmall : [767,2],
				itemsMobile : [479,1]
			});
				
			$("#owl-demo2").owlCarousel({
				navigation : true,
				navigationText :	["<",">"],
				pagination : false,
				items : 4,
				itemsDesktop : [1199,4],
				itemsDesktopSmall : [979,4],
				itemsTablet : [768,3],
				itemsTabletSmall : [767,2],
				itemsMobile : [479,1]
			});
			$("#owl-demo3").owlCarousel({
				navigation : true,
				navigationText :	["<",">"],
				pagination : false,
				items : 4,
				itemsDesktop : [1199,4],
				itemsDesktopSmall : [979,4],
				itemsTablet : [768,3],
				itemsTabletSmall : [767,2],
				itemsMobile : [479,1]
			});
				
			$("#owl-demo4").owlCarousel({
				navigation : true,
				navigationText :	["<",">"],
				pagination : false,
				items : 4,
				itemsDesktop : [1199,4],
				itemsDesktopSmall : [979,4],
				itemsTablet : [768,3],
				itemsTabletSmall : [767,2],
				itemsMobile : [479,1]
			});
			$("#owl-demo5").owlCarousel({
				navigation : true,
				navigationText :	["<",">"],
				pagination : false,
				items : 4,
				itemsDesktop : [1199,4],
				itemsDesktopSmall : [979,4],
				itemsTablet : [768,3],
				itemsTabletSmall : [767,2],
				itemsMobile : [479,1]
			});
				
			$("#owl-demo6").owlCarousel({
				navigation : true,
				navigationText :	["<",">"],
				pagination : false,
				items : 4,
				itemsDesktop : [1199,4],
				itemsDesktopSmall : [979,4],
				itemsTablet : [768,3],
				itemsTabletSmall : [767,2],
				itemsMobile : [479,1]
			});
			$("#owl-demo7").owlCarousel({
				navigation : false,
				pagination : true,
				items : 1
			});
			$("#slider-1.demo input").switchButton({
			  width: 62,
			  height: 30,
			  button_width: 20
			});
			$("#slider-2.demo input").switchButton({
			  width: 45,
			  height: 21,
			  show_labels: false,
			  button_width: 15
			});
			
			$(".modifyscroll").mCustomScrollbar({
					//autoHideScrollbar:true,
				//theme:"rounded"
			});
			
			$('.chk_unchk input:checkbox').change(function(){
		    	if($(this).is(":checked")) {
					$(this).parent().parent().addClass("itemselect");
				} else {
					$(this).parent().parent().removeClass("itemselect");
				}
			});
			
			$("input[name='demo_vertical2']").TouchSpin({
		      verticalbuttons: true,
		      verticalupclass: 'glyphicon glyphicon-plus',
		      verticaldownclass: 'glyphicon glyphicon-minus'
		    });
			
			
			
			$("input[name='addmore_count']").TouchSpin({
				initval: 1	
			});
			
			
			/*Product detail page slider*/
		      var sync1 = $("#sync1");
			  var sync2 = $("#sync2");
			 
			  sync1.owlCarousel({
				singleItem : true,
				slideSpeed : 1000,
				navigation: false,
				pagination:false,
				afterAction : syncPosition,
				responsiveRefreshRate : 200,
			  });
			 
			  sync2.owlCarousel({
				items : 6,
				itemsDesktop      : [1199,4],
				itemsDesktopSmall     : [979,4],
				itemsTablet       : [768,4],
				itemsMobile       : [479,4],
				pagination:false,
				responsiveRefreshRate : 100,
				afterInit : function(el){
				  el.find(".owl-item").eq(0).addClass("synced");
				}
			  });
			 
			  function syncPosition(el){
				var current = this.currentItem;
				$("#sync2")
				  .find(".owl-item")
				  .removeClass("synced")
				  .eq(current)
				  .addClass("synced")
				if($("#sync2").data("owlCarousel") !== undefined){
				  center(current)
				}
			  }
			 
			  $("#sync2").on("click", ".owl-item", function(e){
				e.preventDefault();
				var number = $(this).data("owlItem");
				sync1.trigger("owl.goTo",number);
			  });
			 
			  function center(number){
				var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
				var num = number;
				var found = false;
				for(var i in sync2visible){
				  if(num === sync2visible[i]){
					var found = true;
				  }
				}
			 
				if(found===false){
				  if(num>sync2visible[sync2visible.length-1]){
					sync2.trigger("owl.goTo", num - sync2visible.length+2)
				  }else{
					if(num - 1 === -1){
					  num = 0;
					}
					sync2.trigger("owl.goTo", num);
				  }
				} else if(num === sync2visible[sync2visible.length-1]){
				  sync2.trigger("owl.goTo", sync2visible[1])
				} else if(num === sync2visible[0]){
				  sync2.trigger("owl.goTo", num-1)
				}
				
			  }    
			/*Product detail page slider end*/
		     
			

		// });


		$(window).on('beforeunload', function(){
		  $(window).scrollTop(0);
		});


		( function( window ) {

		'use strict';

		// class helper functions from bonzo https://github.com/ded/bonzo

		function classReg( className ) {
		  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
		}

		// classList support for class management
		// altho to be fair, the api sucks because it won't accept multiple classes at once
		var hasClass, addClass, removeClass;

		if ( 'classList' in document.documentElement ) {
		  hasClass = function( elem, c ) {
		    return elem.classList.contains( c );
		  };
		  addClass = function( elem, c ) {
		    elem.classList.add( c );
		  };
		  removeClass = function( elem, c ) {
		    elem.classList.remove( c );
		  };
		}
		else {
		  hasClass = function( elem, c ) {
		    return classReg( c ).test( elem.className );
		  };
		  addClass = function( elem, c ) {
		    if ( !hasClass( elem, c ) ) {
		      elem.className = elem.className + ' ' + c;
		    }
		  };
		  removeClass = function( elem, c ) {
		    elem.className = elem.className.replace( classReg( c ), ' ' );
		  };
		}

		function toggleClass( elem, c ) {
		  var fn = hasClass( elem, c ) ? removeClass : addClass;
		  fn( elem, c );
		}

		var classie = {
		  // full names
		  hasClass: hasClass,
		  addClass: addClass,
		  removeClass: removeClass,
		  toggleClass: toggleClass,
		  // short names
		  has: hasClass,
		  add: addClass,
		  remove: removeClass,
		  toggle: toggleClass
		};

		// transport
		if ( typeof define === 'function' && define.amd ) {
		  // AMD
		  define( classie );
		} else {
		  // browser global
		  window.classie = classie;
		}

		})( window );




		var cbpAnimatedHeader = (function() {

			var docElem = document.documentElement,
				header = document.querySelector( '.navbar-fixed-top' ),
				didScroll = false,
				changeHeaderOn = 5;

			function init() {
				window.addEventListener( 'scroll', function( event ) {
					if( !didScroll ) {
						didScroll = true;
						setTimeout( scrollPage, 250 );
					}
				}, false );
			}

			function scrollPage() {
				if(options.disableScrollHeader) return;
				var sy = scrollY();
				if ( sy >= changeHeaderOn ) {
					classie.add( header, 'navbar-shrink' );
		            $('.scroll-top').removeClass('hidden-sm hidden-xs');
		            $('.scroll-top').fadeIn(500);			
		            }
				else {
					classie.remove( header, 'navbar-shrink' );
		            $('.scroll-top').fadeOut(500,  function() {
		            $('.scroll-top').addClass('hidden-sm hidden-xs');
		            });

				}
				didScroll = false;
			}

			function scrollY() {
				return window.pageYOffset || docElem.scrollTop;
			}

			init();

		})();


		    /**
		     * Vertically center Bootstrap 3 modals so they aren't always stuck at the top
		     */
		    $(function() {
		        function reposition() {
		            var modal = $(this),
		                dialog = modal.find('.modal-content');
		            modal.css('display', 'block');
		            
		            // Dividing by two centers the modal exactly, but dividing by three 
		            // or four works better for larger screens.
		            dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 3));
		        console.log(dialog.height());
				}
				
		        // Reposition when a modal is shown
		        $('.modal').on('show.bs.modal', reposition);
		        // Reposition when the window is resized
		        $(window).on('resize', function() {
		            $('.modal:visible').each(reposition);
		        });
		    });



		function searchbar(){
				//$(".searchtop").animate({ right: "0%"},200);
				$(".searchtop").addClass("searchtop100");			
				$(".search_close").addClass("search_close_opaque");		
				$(".logoss").addClass("leftminusopacity");
				$(".logoss").addClass("leftminus100");		
				$(".homecallus_cover").addClass("leftminus2100");
				$(".signuplogin_cover").addClass("rightminus100");	
				
				
				$(".searchtop").removeClass("again21");
				$(".logoss").removeClass("again0left");
				$(".logoss").removeClass("againopacity");
				$(".homecallus_cover").removeClass("again0left");
				$(".signuplogin_cover").removeClass("again0right");	
			  	//$(".logo_cover").animate({ left: "-100%"},200);	
				//$(".homecallus_cover").animate({ left: "-100%"},200);
				//$(".signuplogin_cover").animate({ right: "-100%"},200);
				//$(".logo_cover").css( "width", "100%");
				//$('.logo_cover').css("position", "absolute");
				//$('.logo_cover').css("padding-left", "0px");
			  	//$('.searchtop input').css("display", "block");
			  	//$('.search_close').css("display", "inline-block");
			return false;
		};

		function searchbar_close(){  
			$(".searchtop").removeClass("searchtop100");	
			$(".search_close").removeClass("search_close_opaque");
			$(".logoss").removeClass("leftminusopacity");
			$(".logoss").removeClass("leftminus100");		
			$(".homecallus_cover").removeClass("leftminus2100");
			$(".signuplogin_cover").removeClass("rightminus100");
			
			
			$(".searchtop").addClass("again21");
			$(".logoss").addClass("again0left");
			$(".logoss").addClass("againopacity");
			$(".homecallus_cover").addClass("again0left");
			$(".signuplogin_cover").addClass("again0right");
					
		  	//$(".logo_cover").animate({ left: "0%"},200);			
			//$(".homecallus_cover").animate({ left: "0%"},200);
			//$(".signuplogin_cover").animate({ right: "0%"},200);
		  	//$('.searchtop input').css("display", "none");
		  	//$('.search_close').css("display", "none");
			
		     return false;
		};



		$(".addcart").click(function () {
		      //$(".addmore").show("slide", { direction: "down" }, 1000);
			  $(".addcart").hide();
			  $(".addmore").show();
			  //$(".addmore .bootstrap-touchspin").show('slide', { direction: 'down' }, 250);
			  $(".addmore .bootstrap-touchspin input").animate({ top: "0px"},300);
		});

		$(".addmorehere").click(function () {
		      //$(".addmore").show("slide", { direction: "down" }, 1000);
			  $(".addmore").hide();
			  $(".cartbtn").css("background-color","transparent");
			  $(".cartbtn").css("border","1px solid #ddd");
			  $(".addmanual").show();
			  //$(".addmanual").show('slide', { direction: 'left' });
			  $(".addmanual input").animate({ width: "70%"},250);
			  $(".addmanual .addbuttton").animate({ width: "30%"},250);
			  var count_val = $('#addmore_count').val();
			  $('#addmore_val').val(count_val);
			  //console.log(count_val);
		});


		
}