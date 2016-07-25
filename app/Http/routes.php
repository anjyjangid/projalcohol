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
/*Route::get('/mymail', function () {
    return view('emails.mail',['content'=>'<b>HELLO</b>']);
});*/

Route::group(['prefix' => 'adminapi'], function () {

	Route::controller('auth', 'Auth\AdminAuthController');

	Route::controller('password', 'Auth\AdminPasswordController');

});

Route::group(['prefix' => 'adminapi','middleware' => 'admin'], function () {
	
	Route::resource('order', 'Admin\OrderController');
	Route::controller('order', 'Admin\OrderController');
	
	Route::resource('product', 'Admin\ProductController',['only'=>['update','store']]);
	Route::controller('product', 'Admin\ProductController');

	Route::controller('admin', 'Admin\AdminController');
	
	Route::resource('customer', 'Admin\CustomerController');
	Route::controller('customer', 'Admin\CustomerController');
	
	Route::group(['prefix' => 'global'], function () {		
		Route::get('status/{id}/{table}/{status}','Admin\GlobalController@setstatus');
		Route::get('getcountries','Admin\GlobalController@getcountries');		
		Route::get('browsegraphics','Admin\GlobalController@browsegraphics');
		Route::post('uploadgraphics','Admin\GlobalController@uploadgraphics');
	});

	Route::resource('dealer', 'Admin\DealerController',['only'=>['store','update']]);
	Route::controller('dealer', 'Admin\DealerController');

	Route::resource('category', 'Admin\CategoryController');
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

	Route::resource('promotion', 'Admin\PromotionController',['only'=>['update','store','show']]);
	Route::controller('promotion', 'Admin\PromotionController');

	Route::resource('coupon', 'Admin\CouponController',['only'=>['update','store','show']]);
	Route::controller('coupon', 'Admin\CouponController');

	Route::resource('holiday', 'Admin\HolidayController',['only'=>['update','store','destroy']]);
	Route::controller('holiday', 'Admin\HolidayController');

	Route::resource('gift', 'Admin\GiftController',['only'=>['store','show','index']]);
	Route::controller('gift', 'Admin\GiftController');

	Route::resource('giftcategory', 'Admin\GiftCategoryController',['only'=>['store','edit','index']]);
	Route::controller('giftcategory','Admin\GiftCategoryController');

});

Route::group(['prefix' => 'admin'], function () {					
	Route::any('{catchall}', function ( $page ) {
	    return view('backend');    
	} )->where('catchall', '(.*)');

	Route::get('/', function () {
	    return view('backend');
	});	
});

//post('upload-image', 'GalleryController@uploadImage');
//Route::resource('gallery', 'GalleryController');

Route::get('/', function () {
    return view('frontend');
});

Route::controller('/auth', 'Auth\AuthController');

Route::controller('/super', 'SuperController');

Route::controller('/category', 'CategoryController');


Route::get('/getproduct', 'ProductController@getproduct');

Route::get('/search', 'ProductController@getproduct');

Route::get('/getproductdetail', 'ProductController@getproductdetail');

Route::controller('/password', 'Auth\PasswordController');
 
Route::get('verifyemail/{key}', 'Auth\AuthController@verifyemail');
Route::get('reset/{key}', 'Auth\PasswordController@reset');

Route::put('deploycart/{cartKey}','CartController@deploycart');

Route::put('confirmorder/{cartKey}','CartController@confirmorder');
Route::get('freezcart','CartController@freezcart');

Route::group(['middleware' => 'auth'], function () {

	Route::controller('loyalty', 'LoyaltyController');
	Route::resource('loyalty', 'LoyaltyController');

	Route::controller('credits', 'CreditsController');
	Route::resource('credits', 'CreditsController');

});

Route::group(['prefix' => 'cart'], function () {

	Route::get('deliverykey','CartController@getDeliverykey');

	Route::get('services','CartController@getServices');	

	Route::get('timeslots/{date}','CartController@getTimeslots');

	Route::get('availability/{cartkey}','CartController@availability');

	Route::put('merge/{cartkey}','CartController@mergecarts');

	Route::put('chilledstatus/{cartkey}','CartController@updateProductChilledStatus');

	Route::post('package/{cartkey}','CartController@createpackage');
	
	Route::put('promotion/{cartkey}','CartController@putPromotion');

	Route::put('bulk','CartController@putBulk');

	Route::post('repeatlast','CartController@postRepeatlast');

	Route::delete('product/{key}/{type}','CartController@removeproduct');

	Route::delete('promotion/{key}','CartController@deletePromotion');

	Route::delete('card/{key}','CartController@deleteCard');

	Route::delete('gift/{key}','CartController@deleteGift');

	Route::post('gift','CartController@postGift');
	
	Route::post('giftcard','CartController@postGiftcard');
	Route::put('giftcard/{uid}','CartController@putGiftcard');

});

Route::resource('cart', 'CartController');


Route::resource('wishlist', 'WishlistController');


Route::get('/order/summary/{id}','OrderController@getSummary');
Route::get('/order/orders','OrderController@getOrders');
Route::get('/order/{order}','OrderController@show');









//ADMIN ROUTES

/*Route::get('/admin/profile', ['uses' => 'Admin\AdminController@profile']);
Route::post('/admin/profile/update', ['uses' => 'Admin\AdminController@update']);
Route::post('/admin/profile/updatepassword', ['uses' => 'Admin\AdminController@updatepassword']);
Route::get('/admin', ['uses' => 'Admin\AdminController@index']);
Route::get('/admin/dashboard', ['uses' => 'Admin\AdminController@dashboard']);*/


Route::resource('address', 'AddressController');

Route::resource('package', 'PackageController',['only'=>['*']]);
Route::controller('package', 'PackageController');

Route::resource('site', 'SiteController',['only'=>['*']]);
Route::controller('site', 'SiteController');


/*PRODUCT IMAGE ROUTUING*/
Route::get('products/i/{folder}/{filename}', function ($folder,$filename)
{
	if(!file_exists(storage_path('products/') .$folder. '/' . $filename)){
		$filename = "product-default.jpg";
	}
    
    return Image::make(storage_path('products/') .$folder. '/' . $filename)->response();

});
Route::get('products/i/{filename}', function ($filename)
{
	if(!file_exists(storage_path('products') . '/' . $filename)){
		$filename = "product-default.jpg";
	}
    return Image::make(storage_path('products') . '/' . $filename)->response();
});
/*PRODUCT IMAGE ROUTUING*/

Route::get('packages/i/{filename}', function ($filename)
{
    return Image::make(storage_path('packages') . '/' . $filename)->response();
});

Route::get('gifts/i/{filename}', function ($filename)
{
    return Image::make(storage_path('gifts') . '/' . $filename)->response();
});

Route::get('giftcategory/i/{filename}', function ($filename)
{
    return Image::make(storage_path('giftcategory') . '/' . $filename)->response();
});

Route::get('asset/i/{filename}', function ($filename)
{
    return Image::make(public_path('img') . '/' . $filename)->response();
});

/*Route::controller('/admin/password', 'Auth\AdminPasswordController');

Route::controller('/admin', 'Auth\AdminAuthController');*/

Route::get('/check', 'UserController@check');

Route::post('/auth', 'UserController@checkAuth');



Route::get('/loggedUser', 'UserController@loggedUser');

Route::put('/profile', 'UserController@update');
Route::put('/password', 'UserController@updatepassword');

Route::controller('user', 'UserController');

Route::controller('giftcategory', 'GiftCategoryController');
Route::resource('giftcategory', 'GiftCategoryController',['only'=>['index','show']]);

Route::resource('gift', 'GiftController',['only'=>['show']]);

//TO WORK FOR ANGULAR DIRECT URL


/*Route::any('{path?}', function()
{
    return view('frontend');
});*/
