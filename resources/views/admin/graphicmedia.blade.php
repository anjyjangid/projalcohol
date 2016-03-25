<div class="clearfix"></div>	
	 <!-- BEGIN PAGE CONTENT-->
	<div class="row">
		<div class="col-md-12" style="padding:0 20px;">
			<!-- BEGIN FILTER -->
			<div class="margin-top-10">
				<div class="row mix-grid">
				
					<?php foreach($images as $key=>$value){?>
						<div class="col-md-3 col-sm-3 col-xs-6  mix ">
							<div class="mix-inner">								
								<img class="pickimage img-responsive" src="{{asset("assets/resources/graphics/".$value['image'])}}" alt="{{$value['alt_title']}}">
								<div class="mix-details">
									<h4>{{$value['title']}}/{{$value['alt_title']}}</h4>
									<a class=" mix-link" style="right:40%;"><i class="fa fa-link"></i></a>
								</div>
							</div>
						</div>
					<?php  } ?>
				</div>
			</div>
			<!-- END FILTER -->
		</div>
	</div>
	<!-- END PAGE CONTENT-->
	

 
 <script type="text/javascript">  

  


$('.mix-link').click(function(e) {
	$(this).parent().siblings('img').trigger('click');
});



$('.pickimage').click(function(e) {
 	  
	var tgt = e.target || event.srcElement,  url;  
	
	if( tgt.nodeName != 'IMG' )  
		return;  
	
	url = tgt.src;
	url = url.replace("/300","");
	alt = tgt.alt;
	title = tgt.title;
	this.onclick = null;  
	window.opener.CKEDITOR.tools.callFunction( <?php echo $_GET['CKEditorFuncNum']; ?>, url, function() {
	  var element, dialog = this.getDialog();
	  element = dialog.getContentElement( 'info', 'txtAlt' );
	  if ( element )
		element.setValue(alt);
		
		 element = dialog.getContentElement( 'info', 'txtTitle' );
	  if ( element )
		element.setValue(title);
	});
	window.close();  
});
</script>