<script type="text/javascript" src="js/jquery-1.11.3.min.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>
<script src="js/owl.carousel.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js"></script>
<script src="js/jquery.switchButton.js"></script>



<script type="text/javascript">
$(document).ready(function() {
 function bindNavbar() {
  if ($(window).width() > 767) {
   $('.navbar-default .dropdown').on('mouseover', function(){
    $('.dropdown-toggle', this).next('.dropdown-menu').show();
   }).on('mouseout', function(){
    $('.dropdown-toggle', this).next('.dropdown-menu').hide();
   });
   
   $('.dropdown-toggle').click(function() {
    if ($(this).next('.dropdown-menu').is(':visible')) {
     window.location = $(this).attr('href');
    }
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
 
 	$("#owl-demo").owlCarousel({
		navigation : true,
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
		pagination : false,
		items : 4,
		itemsDesktop : [1199,4],
		itemsDesktopSmall : [979,4],
		itemsTablet : [768,3],
		itemsTabletSmall : [767,2],
		itemsMobile : [479,1]
	});
	$("#slider-1.demo input").switchButton({
	  width: 62,
	  height: 30,
	  button_width: 20
	});
});


</script>

