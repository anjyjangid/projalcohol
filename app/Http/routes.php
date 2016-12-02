<?php
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
 */

/*TO VIEW MAIL TEMPLATE*/



Route::get('/printjob/{reference}', 'OrderController@getOrderdetail');

Route::get('/morphing', function(){
	return view('invoice.morph');
});

Route::group(['prefix' => 'adminapi'], function () {

	Route::controller('auth', 'Auth\AdminAuthController');

	Route::controller('password', 'Auth\AdminPasswordController');

});


Route::group(['prefix' => 'adminapi','middleware' => 'admin'], function () {
	
	Route::resource('order', 'Admin\OrderController',['except'=>'show']);
	Route::controller('order', 'Admin\OrderController');

	//Route::put('deploycart/{cartKey}','CartController@deploycart');
	
	Route::resource('product', 'Admin\ProductController',['only'=>['update','store']]);
	Route::controller('product', 'Admin\ProductController');

	Route::controller('admin', 'Admin\AdminController');
	Route::controller('usergroup', 'Admin\UserGroupController');
	
	Route::resource('customer', 'Admin\CustomerController');
	Route::controller('customer', 'Admin\CustomerController');

	Route::resource('business', 'Admin\BusinessController');
	Route::controller('business', 'Admin\BusinessController');	
	
	Route::group(['prefix' => 'global'], function () {		
		Route::get('status/{id}/{table}/{status}','Admin\GlobalController@setstatus');
		Route::get('getcountries','Admin\GlobalController@getcountries');		
		Route::get('browsegraphics','Admin\GlobalController@browsegraphics');
		Route::post('uploadgraphics','Admin\GlobalController@uploadgraphics');
	});

	Route::resource('dealer', 'Admin\DealerController',['only'=>['store','update']]);
	Route::controller('dealer', 'Admin\DealerController');

	Route::resource('category', 'Admin\CategoryController',['only'=>['store','update']]);
	Route::controller('category', 'Admin\CategoryController');

	Route::resource('setting', 'Admin\SettingController',['only'=>'update']);
	Route::controller('setting', 'Admin\SettingController');

	Route::controller('package', 'Admin\PackageController');

	Route::resource('emailtemplate', 'Admin\EmailTemplateController',['only'=>'update']);
	Route::controller('emailtemplate', 'Admin\EmailTemplateController');

	Route::resource('cms', 'Admin\CmsController',['only'=>'update']);
	Route::controller('cms', 'Admin\CmsController');

	Route::resource('testimonial', 'Admin\TestimonialController',['only'=>['update','store','show','destroy']]);
	Route::controller('testimonial', 'Admin\TestimonialController');

	Route::resource('brand', 'Admin\BrandController',['only'=>['update','store','show','destroy']]);
	Route::controller('brand', 'Admin\BrandController');

	Route::resource('promotion', 'Admin\PromotionController',['only'=>['update','store','show','destroy']]);
	Route::controller('promotion', 'Admin\PromotionController');

	Route::resource('coupon', 'Admin\CouponController',['only'=>['update','store','show','destroy']]);
	Route::controller('coupon', 'Admin\CouponController');

	Route::resource('holiday', 'Admin\HolidayController',['only'=>['update','store','destroy']]);
	Route::controller('holiday', 'Admin\HolidayController');

	Route::resource('gift', 'Admin\GiftController',['only'=>['store','show','index']]);
	Route::controller('gift', 'Admin\GiftController');

	Route::resource('dontmiss', 'Admin\DontMissController');
	
	Route::resource('giftcategory', 'Admin\GiftCategoryController',['only'=>['store','edit','index']]);
	Route::controller('giftcategory','Admin\GiftCategoryController');

	Route::resource('sale', 'Admin\SaleController',['only'=>['store','show','update','destroy']]);
	Route::controller('sale', 'Admin\SaleController');

	Route::resource('stores', 'Admin\StoreController',['only'=>['store','edit','update']]);
	Route::controller('stores', 'Admin\StoreController');

	Route::resource('stocks', 'Admin\StocksController',['only'=>['store']]);
	Route::controller('stocks', 'Admin\StocksController');

	Route::resource('company', 'Admin\CompanyController',['only'=>['show']]);
	Route::controller('company', 'Admin\CompanyController');

	Route::resource('purchaseorder', 'Admin\PurchaseOrderController');
	Route::controller('purchaseorder', 'Admin\PurchaseOrderController');

	Route::post('address/{id}','AddressController@store');
	// Route::controller('address', 'AddressController');

	Route::post('checkCoupon','CouponController@checkCoupon');
});

Route::group(['prefix' => 'admin'], function () {
	Route::any('{catchall}', function ( $page ) {
	    return view('backend');    
	} )->where('catchall', '(.*)');

	Route::get('/', function () {
	    return view('backend');
	});	
});

Route::get('/', function () {	    
    return view('frontend');
});

/**/

Route::group(['prefix' => 'api'], function () {

	Route::controller('/auth', 'Auth\AuthController');

	Route::controller('/super', 'SuperController');

	Route::controller('/category', 'CategoryController');

	Route::get('/getproduct', 'ProductController@getproduct');

	Route::get('/fetchProducts', 'ProductController@fetchProducts');

	Route::get('/search', 'ProductController@getproduct');

	Route::get('/getproductdetail', 'ProductController@getproductdetail');

	Route::get('/product/alsobought/{productSlug}', 'ProductController@getAlsobought');

	Route::controller('/password', 'Auth\PasswordController');

	Route::get('reset/{key}', 'Auth\PasswordController@reset');

	Route::put('deploycart/{cartKey}','CartController@deploycart');
 
	Route::put('confirmorder/{cartKey}','CartController@confirmorder');

	

	Route::get('freezcart','CartController@freezcart');

	Route::group(['middleware' => 'auth'], function () {

		Route::controller('loyalty', 'LoyaltyController');
		Route::resource('loyalty', 'LoyaltyController');

		Route::controller('credits', 'CreditsController');
		Route::resource('credits', 'CreditsController');

		Route::resource('address', 'AddressController');

		Route::controller('coupon', 'CouponController');

		Route::post('checkCoupon','CouponController@checkCoupon');

	});

	Route::group(['prefix' => 'cart'], function () {

		Route::get('deliverykey','CartController@getDeliverykey');

		Route::get('services','CartController@getServices');	

		Route::get('timeslots/{date}','CartController@getTimeslots');

		Route::get('availability/{cartkey}','CartController@availability');

		Route::put('merge/{cartKey}','CartController@mergecarts');

		Route::put('chilledstatus/{cartkey}','CartController@updateProductChilledStatus');

		Route::put('promoChilledStatus/{cartkey}','CartController@updatePromoChilledStatus');
		
		Route::post('package/{cartKey}','CartController@postPackage');

		Route::put('package/{uid}/{cartKey}','CartController@putPackage');

		Route::delete('package/{key}/{cartKey}','CartController@deletePackage');
		
		Route::put('promotion/{cartkey}','CartController@putPromotion');

		Route::put('bulk','CartController@putBulk');

		Route::post('repeatlast','CartController@postRepeatlast');

		Route::delete('product/{cartKey}/{key}/{type}','CartController@deleteProduct');
	
		Route::put('bulk/{cartkey}','CartController@putBulk');

		Route::delete('promotion/{key}','CartController@deletePromotion');

		Route::delete('card/{cartKey}/{key}','CartController@deleteCard');

		Route::delete('sale/{cartKey}/{saleId}','CartController@deleteSale');

		Route::put('sale/chilled/{cartKey}','CartController@putSaleChilledStatus');

		Route::delete('gift/{key}/{cartKey}','CartController@deleteGift');

		Route::put('gift/{cartKey}','CartController@putGift');
		
		Route::post('giftcard/{cartKey}','CartController@postGiftcard');

		Route::put('giftcard/{uid}','CartController@putGiftcard');

		Route::put('gift/product/chilledtoggle/{giftUid}','CartController@putGiftProductChilledStatus');

		Route::put('loyalty/{cartKey}','CartController@putLoyalty');

		Route::put('loyalty/credit/{cartKey}','CartController@putCreditCertificate');
		
		Route::delete('loyalty/{cartKey}/{key}/{type}','CartController@deleteLoyaltyProduct');
		Route::delete('loyaltycard/{cartKey}/{key}','CartController@deleteLoyaltyCard');
		
		Route::put('chilled/loyalty/{cartkey}','CartController@updateLoyaltyChilledStatus');

	});

	Route::controller('suggestion', 'SuggestionController');
	Route::resource('cart', 'CartController');
	Route::resource('wishlist', 'WishlistController');
	Route::get('/order/summary/{id}','OrderController@getSummary');
	Route::get('/order/orders','OrderController@getOrders');
	Route::get('/order/{order}','OrderController@show');
	Route::post('/order/{id}','OrderController@update');
	Route::resource('package', 'PackageController',['only'=>['*']]);
	Route::controller('package', 'PackageController');
	Route::resource('site', 'SiteController',['only'=>['*']]);
	Route::controller('site', 'SiteController');
	Route::resource('loyaltystore', 'LoyaltyStoreController',['only'=>['index']]);
	Route::controller('loyaltystore', 'LoyaltyStoreController');
	Route::get('/check', 'UserController@check');
	Route::post('/auth', 'UserController@checkAuth');
	Route::get('/loggedUser', 'UserController@loggedUser');
	Route::put('/profile', 'UserController@update');
	Route::put('/password', 'UserController@updatepassword');
	Route::controller('user', 'UserController');
	Route::controller('giftcategory', 'GiftCategoryController');
	Route::resource('giftcategory', 'GiftCategoryController',['only'=>['index','show']]);
	Route::resource('gift', 'GiftController',['only'=>['show']]);
	Route::controller('payment', 'PaymentController');

});

/*PRODUCT IMAGE ROUTUING*/
Route::get('products/i/{folder}/{filename}', function ($folder,$filename){

	if(!file_exists(storage_path('products/') .$folder. '/' . $filename)){
		
		return Image::make(public_path('images').'/product-default.jpg')->response();
		//$filename = "product-default.jpg";
	}
    
    return Image::make(storage_path('products/') .$folder. '/' . $filename)->response();

});

//ASSET IMAGE ROUTES
Route::get('asset/i/{filename}', function ($filename){
    return Image::make(public_path('img') . '/' . $filename)->response();
});

//COMMON IMAGE ROUTES 
Route::get('{storageFolder}/i/{filename}', function ($storageFolder,$filename){
	/*
	* $storageFolder possible values
	* 
	* products
	* packages
	* sale	
	* gifts
	* giftcategory
	* company
	*
	*/	
	if(!file_exists(storage_path($storageFolder) . '/' . $filename)){
		return Image::make(public_path('images').'/product-default.jpg')->response();		
	}
	
    return Image::make(storage_path($storageFolder) . '/' . $filename)->response();
});


//EXTERNAL URL LIST
Route::get('confirmorder','CartController@confirmorder');
Route::get('verifyemail/{key}', 'Auth\AuthController@verifyemail');

$fixPagesLinks = [
	'events' => 'site/event-planner',
	'menu' => 'beer',
	'how_to_order' => 'site/how-to-order'
];

//FIX LINKS ROUTE
foreach ($fixPagesLinks as $route => $url) {
	Route::get($route,function() use($url){		
		return redirect('/'.$url,301);
	});
}

//ROUTE IF CATEGORY OR PRODUCT NAME IS FOUND LIKE red_wine will be redirected to red-wine
Route::get('{categoryslug}', function ( $categoryslug, $productslug = '') {

	$s = str_replace('_', '-', $categoryslug);
    $s = preg_replace('/[^A-Za-z0-9\-]/', '', $s);
    $s = trim(preg_replace('/-+/', '-', $s));
	$s = strtolower($s);
	return redirect('/'.$s,301);

})->where(['categoryslug'=>'^[\w]+_[\w]+$']);

Route::get('{categoryslug}/{productslug}', function ( $categoryslug, $productslug) {

	$s = str_replace('_', '-', $productslug);
    $s = preg_replace('/[^A-Za-z0-9\-]/', '', $s);
    $s = trim(preg_replace('/-+/', '-', $s));
	$s = strtolower($s);
	return redirect('/product/'.$s,301);

})->where(['productslug'=>'^[\w]+_[\w]+$']);

Route::get('updatesitemap', function(){

    // create new sitemap object
    $sitemap = App::make("sitemap");
    // add items to the sitemap (url, date, priority, freq)
    //$sitemap->add(URL::to(), '2012-08-25T20:10:00+02:00', '1.0', 'daily');
    //$sitemap->add(URL::to('page'), '2012-08-26T12:30:00+02:00', '0.9', 'monthly');

    // get all posts from db
    $categories = DB::collection('categories')->orderBy('created_at', 'desc')->get();
    
    // add every post to the sitemap
    if($categories){
    	foreach ($categories as $category){
	        $sitemap->add(url().'/'.$category['slug']);
	    }
	}

	$pages = DB::collection('pages')->orderBy('created_at', 'desc')->get();
    
    // add every post to the sitemap
    if($pages){
    	foreach ($pages as $page){
	        $sitemap->add(url('site').'/'.$page['slug']);
	    }
	}
    
    // get all posts from db
    $posts = DB::collection('products')->orderBy('created_at', 'desc')->get();
    
    // add every post to the sitemap
    if($posts){
    	foreach ($posts as $post){
	        $sitemap->add(url('/product').'/'.$post['slug']);
	    }
	}	

    // generate your sitemap (format, filename)
    $sitemap->store('xml','sitemap');
    return $sitemap->render('xml');
    // this will generate file mysitemap.xml to your public folder

});

//FINAL ROUTE FOR FRONTEND
Route::any('{catchall}', function ( $page ) {
    return view('frontend');
} )->where('catchall', '(.*)');