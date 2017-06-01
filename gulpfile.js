var elixir = require('laravel-elixir');

elixir.config.production = true;

const gulp = require('gulp');
const image = require('gulp-image');

gulp.task('optimg', function () {
  gulp.src('public/images/*')
    .pipe(image())
    .pipe(gulp.dest('public/images'));

  gulp.src('public/img/*')
    .pipe(image())
    .pipe(gulp.dest('public/img'));  
  /*gulp.src('storage/**')
    .pipe(image())
    .pipe(gulp.dest('storage/**'));*/   
});

const arg = (argList => {

  let arg = {}, a, opt, thisOpt, curOpt;
  for (a = 0; a < argList.length; a++) {

    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');

    if (opt === thisOpt) {

      // argument value
      if (curOpt) arg[curOpt] = opt;
      curOpt = null;

    }
    else {

      // argument name
      curOpt = opt;
      arg[curOpt] = true;

    }

  }

  return arg;

})(process.argv);

gulp.task('imgopt', function() {
	let file = arg.file;
    if(arg.file == 'all')
    	file = '*';
    
    if(arg.folder && file){
    	gulp.src(arg.folder+'/'+file)
	    .pipe(image())
	    .pipe(gulp.dest(arg.folder));
    }else{
    	console.log('No folder selected');
    }
});

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.scripts([
    	'general.js',
    	'jquery-1.11.3.min.js',
    	//'http://platform.twitter.com/widgets.js',
	    '../bower_components/bootstrap/dist/js/bootstrap.min.js',
	    '../bower_components/angular/angular.min.js',
	    '../bower_components/satellizer/dist/satellizer.js',	    
	    // '../bower_components/angular-touch/angular-touch.min.js',
	    '../bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
	    '../assets/global/plugins/angularjs/angular-sanitize.min.js',
	    '../assets/global/plugins/jquery.pulsate.min.js',
	    '../bower_components/angular-route/angular-route.min.js',
	    '../bower_components/angular-cookies/angular-cookies.min.js',    
	    '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
	    '../bower_components/angular-ui-router/release/angular-ui-router.min.js',
	    // 'svg-morpheus.js',    
	    // 'morpher.js',
	    'TweenMax.min.js',
	    'svgMorphing.min.js',
	    'findShapeIndex.js',
	    'ng-map.js',
	    /*SWEET ALERT STYLE*/
	    '../bower_components/sweetalert2/dist/sweetalert2.min.js',
	    '../bower_components/ngSweetAlert2/SweetAlert.js',
	    '../bower_components/es6-promise/es6-promise.min.js',
	    '../bower_components/angular-animate/angular-animate.js',
	    '../bower_components/angular-aria/angular-aria.min.js',
	    '../bower_components/angular-messages/angular-messages.min.js',
	    '../bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
	    '../bower_components/ng-scrollbars/dist/scrollbars.min.js',
	    /*Angular Material Library*/
	    '../bower_components/angular-material/angular-material.min.js',    
	    'owl.carousel.min.js',
	    'app.js',
	    'controller.js',
	    'alcoholServices.js',
	    'alcoholCart.js',
	    'cartFactories.js',
	    'alcoholWishlist.js',
	    'alcoholCartDirective.js',
	    'directive.js',	    
	    '../bower_components/v-accordion/dist/v-accordion.js'
    ],'public/js/build/all.js','public/js');
});


elixir(function(mix) {
    mix.styles([
        '../bower_components/angular-material/angular-material.min.css',
		'bootstrap.min.css',
		'owl.carousel.css',
		'owl.theme.css',
		'font-awesome-4.7.0/css/font-awesome.min.css',
		'../bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css',
		'jquery.bootstrap-touchspin.css',
		'../bower_components/sweetalert2/dist/sweetalert2.css',
		'common.css',
		'screen-ui.css',
		'ui_responsive.css',
		'app.css',
		'../bower_components/v-accordion/dist/v-accordion.css',
		'simple-sidebar.css'
    ],'public/css/all.css','public/css');
});

/*elixir(function(mix) {
    mix.version(['public/css/all.css', 'public/js/build/all.js']);
});*/