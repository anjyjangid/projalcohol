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

post('upload-image', 'GalleryController@uploadImage');
Route::resource('gallery', 'GalleryController');


Route::get('/', function () {
    return view('frontend');
});

Route::post('auth/registerfb', 'Auth\AuthController@registerfb');

Route::controller('/auth', 'Auth\AuthController');

Route::controller('/super', 'SuperController');

Route::controller('/category', 'CategoryController');


Route::get('/getproduct', 'ProductController@getproduct');

Route::get('/search', 'ProductController@getproduct');

Route::get('/getproductdetail', 'ProductController@getproductdetail');

Route::controller('/password', 'Auth\PasswordController');
 
Route::get('verifyemail/{key}', 'Auth\AuthController@verifyemail');
Route::get('reset/{key}', 'Auth\PasswordController@reset');


Route::put('deploycart','CartController@deploycart');
Route::put('confirmorder','CartController@confirmorder');


Route::group(['prefix' => 'cart'], function () {

	Route::get('deliverykey','CartController@getDeliverykey');
	Route::get('services','CartController@getServices');	
	Route::get('timeslots/{date}','CartController@getTimeslots');
	Route::put('merge/{cartkey}','CartController@mergecarts');

	Route::post('package/{cartkey}','CartController@createpackage');
		

	Route::delete('product/{key}/{type}','CartController@removeproduct');



});

Route::resource('cart', 'CartController');

Route::get('/order/summary/{id}','OrderController@getSummary');
Route::get('/order/orders','OrderController@getOrders');
Route::get('/order/{order}','OrderController@show');




Route::resource('category', 'Admin\CategoryController');


//ADMIN ROUTES

Route::get('/admin/profile', ['uses' => 'Admin\AdminController@profile']);
Route::post('/admin/profile/update', ['uses' => 'Admin\AdminController@update']);
Route::post('/admin/profile/updatepassword', ['uses' => 'Admin\AdminController@updatepassword']);
Route::get('/admin', ['uses' => 'Admin\AdminController@index']);
Route::get('/admin/dashboard', ['uses' => 'Admin\AdminController@dashboard']);


Route::resource('address', 'AddressController');

Route::resource('package', 'PackageController',['only'=>['*']]);
Route::controller('package', 'PackageController');

Route::group(['prefix' => 'admin','middleware' => 'admin'], function () {
	
	Route::group(['prefix' => 'category'], function () {

	    Route::match(['get', 'post'],'getcategories/{categoryId?}', ['uses' => 'Admin\CategoryController@getcategories']);

	    Route::get('getparentcategories/{id?}', ['uses' => 'Admin\CategoryController@getparentcategories']);

	    Route::post('store','Admin\CategoryController@store');

	    Route::post('update/{id}','Admin\CategoryController@update');

	    Route::get('show','Admin\CategoryController@show');

	    Route::get('getcategory/{id}','Admin\CategoryController@getcategory');
	  
    });

    Route::resource('category', 'Admin\CategoryController');
		
	

	Route::group(['prefix' => 'dealer'], function () {

		Route::get('getdealer/{id}','Admin\DealerController@getdealer');
			
		Route::post('getdealers', 'Admin\DealerController@getdealers');

		Route::get('dealerproduct/{id}', 'Admin\DealerController@dealerproduct');

		Route::get('getlist','Admin\DealerController@getlist');
		//Route::post('remove', 'Admin\DealerController@remove');

	});

	Route::resource('dealer', 'Admin\DealerController');
	

	
	Route::resource('customer', 'Admin\CustomerController');
	Route::controller('customer', 'Admin\CustomerController');

	// CMS PAGES ROUTING STARTS

	Route::group(['prefix' => 'cms'], function () {

		Route::get('getpage/{id}','Admin\CmsController@getpage');
			
		Route::post('getpages', 'Admin\CmsController@getpages');

	});

	Route::resource('cms', 'Admin\CmsController');

	// CMS PAGES ROUTING STARTS


	// EMAIL TEMPLATES PAGES ROUTING STARTS

	Route::group(['prefix' => 'emailtemplate'], function () {

		Route::get('gettemplate/{id}','Admin\EmailTemplateController@gettemplate');
			
		Route::post('gettemplates', 'Admin\EmailTemplateController@gettemplates');

	});

	Route::resource('emailtemplate', 'Admin\EmailTemplateController');

	// EMAIL TEMPLATES PAGES ROUTING STARTS
	

	Route::group(['prefix' => 'global'], function () {
		
		Route::get('status/{id}/{table}/{status}','Admin\GlobalController@setstatus');

		Route::get('getcountries','Admin\GlobalController@getcountries');
		
		Route::get('browsegraphics','Admin\GlobalController@browsegraphics');

		Route::post('uploadgraphics','Admin\GlobalController@uploadgraphics');

	});

	Route::group(['prefix' => 'product'], function () {
		Route::post('store','Admin\ProductController@store');
		Route::post('productlist','Admin\ProductController@productlist');
		Route::get('edit/{id}','Admin\ProductController@edit');
		Route::post('update/{id}','Admin\ProductController@update');
		Route::post('orderproduct','Admin\ProductController@orderProduct');
		Route::post('updateinventory','Admin\ProductController@updateinventory');		
	});


	// Route::group(['prefix' => 'setting'], function () {

	// 	Route::get('getsetting', 'Admin\SettingController@getsettings');

	// });

	Route::resource('setting', 'Admin\SettingController',
                ['except' => ['create', 'store', 'destroy']]);
	Route::controller('setting', 'Admin\SettingController');


	Route::resource('testimonial', 'Admin\TestimonialController');
	Route::controller('testimonial', 'Admin\TestimonialController');

	Route::resource('brand', 'Admin\BrandController');
	Route::controller('brand', 'Admin\BrandController');
	
	Route::resource('order', 'Admin\OrderController');
	Route::controller('order', 'Admin\OrderController');


	Route::post('getcustomers', 'Admin\CustomerController@customers');
	/*Route::resource('package', 'Admin\PackageController');
	Route::controller('package', 'Admin\PackageController');*/
	
	Route::group(['prefix' => 'package'], function () {
		Route::post('listpackage/{type}','Admin\PackageController@listpackage');		
		Route::post('searchproduct','Admin\PackageController@searchProduct');		
		Route::post('store','Admin\PackageController@store');
		Route::get('edit/{id}/{type}','Admin\PackageController@edit');
		Route::post('update/{id}','Admin\PackageController@update');
	});		

});


/*PRODUCT IMAGE ROUTUING*/
Route::get('products/i/{folder}/{filename}', function ($folder,$filename)
{
    return Image::make(storage_path('products/') .$folder. '/' . $filename)->response();
});
Route::get('products/i/{filename}', function ($filename)
{
    return Image::make(storage_path('products') . '/' . $filename)->response();
});
/*PRODUCT IMAGE ROUTUING*/

Route::get('packages/i/{filename}', function ($filename)
{
    return Image::make(storage_path('packages') . '/' . $filename)->response();
});

Route::get('asset/i/{filename}', function ($filename)
{
    return Image::make(public_path('img') . '/' . $filename)->response();
});

Route::controller('/admin/password', 'Auth\AdminPasswordController');

Route::controller('/admin', 'Auth\AdminAuthController');

Route::controller('/admin', 'Auth\AdminAuthController');

Route::get('/check', 'UserController@check');

Route::post('/auth', 'UserController@checkAuth');



Route::get('/loggedUser', 'UserController@loggedUser');

Route::put('/profile', 'UserController@update');
Route::put('/password', 'UserController@updatepassword');




//TO WORK FOR ANGULAR DIRECT URL


/*Route::any('{path?}', function()
{
    return view('frontend');
});*/
