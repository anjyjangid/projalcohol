<!DOCTYPE html>
<html>
<head>
	<title>Morphing</title>
	<script type="text/javascript" src="{{asset('js/morpher.js')}}"></script>
	<script type="text/javascript" src="http://code.jquery.com/jquery-1.8.3.min.js"></script>
</head>
<body>

	<input max="1" min="0" step="0.01" type="range" value="0" id="mySelect" onchange="myFunction()">
		<!-- <label>
        <input name="blend" type="checkbox">
          Custom blend
        </label>
        <label>
          <input name="finalTouch" type="checkbox">
          Custom final touch
        </label> -->
    <button onclick="an();">Animate</button>
</body>
</html>

<script type="text/javascript">
	var json = {"images":[{"points":[{"x":114,"y":0},{"x":0,"y":33},{"x":0,"y":76},{"x":83,"y":0},{"x":171,"y":56},{"x":147,"y":76}],"src":"ad_logo.png","x":0,"y":0},{"points":[{"x":59,"y":-4},{"x":-9,"y":20},{"x":9,"y":38},{"x":30,"y":-1},{"x":45,"y":20},{"x":27,"y":29}],"src":"{{ asset('images/logo-small.png') }}","x":59,"y":23}],"triangles":[[1,2,3],[0,3,4],[4,3,5],[2,3,5]]};

	var json = {"images":[{"points":[{"x":31,"y":27},{"x":112,"y":-5},{"x":171,"y":76},{"x":120,"y":14},{"x":70,"y":5},{"x":31,"y":76},{"x":0,"y":39},{"x":0,"y":76},{"x":171,"y":51}],"src":"{{ asset('images/ad_logo.png') }}","x":0,"y":0},{"points":[{"x":1,"y":17},{"x":52,"y":0},{"x":15,"y":34},{"x":51,"y":11},{"x":27,"y":0},{"x":5,"y":43},{"x":-7,"y":17},{"x":-8,"y":42},{"x":-16,"y":53}],"src":"{{ asset('images/logo-small.png') }}","x":60,"y":23}],"triangles":[[1,3,4],[0,3,4],[0,3,6],[6,3,7],[5,3,7],[2,5,8],[3,5,8]]};

	// var json = {"images":[{"points":[{"x":0,"y":37},{"x":112,"y":-5},{"x":171,"y":76},{"x":120,"y":14},{"x":70,"y":5},{"x":31,"y":76},{"x":0,"y":39},{"x":0,"y":76},{"x":171,"y":51}],"src":"{{ asset('images/new-logo.svg') }}","x":27,"y":2},{"points":[{"x":1,"y":17},{"x":52,"y":0},{"x":15,"y":34},{"x":51,"y":11},{"x":27,"y":0},{"x":5,"y":43},{"x":-7,"y":17},{"x":-8,"y":42},{"x":-16,"y":53}],"src":"{{ asset('images/logo-small.png') }}","x":60,"y":23}],"triangles":[[1,3,4],[0,3,4],[0,3,6],[6,3,7],[5,3,7],[2,5,8],[3,5,8]]};
	var json = {"images":[{"points":[{"x":0,"y":37},{"x":112,"y":-5},{"x":171,"y":76},{"x":120,"y":14},{"x":70,"y":5},{"x":31,"y":76},{"x":0,"y":39},{"x":0,"y":76},{"x":171,"y":51}],"src":"{{ asset('images/l2.png') }}","x":0,"y":0},{"points":[{"x":1,"y":17},{"x":52,"y":0},{"x":15,"y":34},{"x":51,"y":11},{"x":27,"y":0},{"x":5,"y":43},{"x":-7,"y":17},{"x":-8,"y":42},{"x":-16,"y":53}],"src":"{{ asset('images/logo-small.png') }}","x":60,"y":23}],"triangles":[[1,3,4],[0,3,4],[0,3,6],[6,3,7],[5,3,7],[2,5,8],[3,5,8]]};
	var morpher = new Morpher(json);
	document.body.appendChild(morpher.canvas);
	
	var t = true;

	function an() {
		if(t){
			morpher.set([1, 0]);
			morpher.animate([0, 1], 200);	
		}else{
			morpher.set([0, 1]);
			morpher.animate([1, 0], 200);
		}

		t = !t;	
	}

	

	//setInterval('animate()', 1100);

		var custom = {};

	  custom.blendFunction = function (destination, source, weight) {
	    var dData = destination.getContext('2d')
	      .getImageData(0, 0, source.width, source.height);
	    var sData = source.getContext('2d')
	      .getImageData(0, 0, source.width, source.height);

	    var distance = Math.round((1-weight)*3);
	    var factor = Math.sin(weight*Math.PI/2)*255;

	    for(var x = 0; x < source.width; x++) {
	      for(var y = 0; y < source.height; y++) {
	        if(sData.data[(y*source.width + x)*4 + 3] >= 128) {
	          var minX = Math.max(0, x-distance);
	          var maxX = Math.min(source.width-1, x+distance);
	          var minY = Math.max(0, y-distance);
	          var maxY = Math.min(source.height-1, y+distance);
	          var strength = factor/((maxX-minX)*(maxY-minY));
	          for(var x1 = minX; x1 <= maxX; x1++) {
	            for(var y1 = minY; y1 <= maxY; y1++) {
	              dData.data[(y1*source.width + x1)*4 + 3] += strength;
	            }
	          }
	        }
	      }
	    }
	    destination.getContext('2d').putImageData(dData, 0, 0);

	  }

	  custom.finalTouchFunction = function(canvas) {
	    var ctx = canvas.getContext('2d');
	    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	    for(var i = 3; i < data.data.length; i++) {
	      data.data[i] = data.data[i] > 128 ? 255 : 0;
	    }
	    ctx.putImageData(data, 0, 0);
	  }


	$('body').find('input').on("input change", function() {
	    if($(this).attr('type') == 'range') {
	      var v = $(this).val()*1;
	      morpher.set([1-v, v]);
	    } else {
	      var name = $(this).attr('name')+"Function";
	      morpher[name] = $(this).is(':checked') ? custom[name] : null;
	      morpher.draw();
	    }
	});
  

</script>