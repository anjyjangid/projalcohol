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

/*Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin', function () {
    return view('master');
});

post('upload-image', 'GalleryController@uploadImage');

Route::post('admin/auth', 'UserController@checkAuth');
Route::resource('admin/user', 'UserController');
Route::resource('admin/gallery', 'GalleryController');

post('delete-single-image', 'GalleryController@deleteSingleImage');*/

post('upload-image', 'GalleryController@uploadImage');
Route::resource('gallery', 'GalleryController');


Route::get('/', ['uses' => 'UserController@index']);
Route::controller('/auth', 'Auth\AuthController');
Route::post('/admin/getcustomers', ['uses' => 'Admin\AdminController@customers']);


Route::match(['get', 'post'],'/admin/dealer/getdealers', ['uses' => 'Admin\DealerController@getdealers']);



Route::controller('/password', 'Auth\PasswordController');
 
//ADMIN ROUTES
//Route::resource('admin', 'Admin\AdminController');

Route::get('/admin/profile', ['uses' => 'Admin\AdminController@profile']);
Route::post('/admin/profile/update', ['uses' => 'Admin\AdminController@update']);
Route::post('/admin/profile/updatepassword', ['uses' => 'Admin\AdminController@updatepassword']);
Route::get('/admin', ['uses' => 'Admin\AdminController@index']);
Route::get('/admin/dashboard', ['uses' => 'Admin\AdminController@dashboard']);


Route::group(['prefix' => 'admin','middleware' => 'admin'], function () {
	
	Route::group(['prefix' => 'category'], function () {

	    Route::match(['get', 'post'],'getcategories/{categoryId?}', ['uses' => 'Admin\CategoryController@getcategories']);

	    Route::get('getparentcategories/{id?}', ['uses' => 'Admin\CategoryController@getparentcategories']);

	    Route::post('store','Admin\CategoryController@store');

	    Route::get('show','Admin\CategoryController@show');

	    Route::get('getcategorydetail/{id}','Admin\CategoryController@getcategorydetail');



    });
    
	
	Route::group(['prefix' => 'product'], function () {
		Route::post('store','Admin\ProductController@store');
	});
});


Route::controller('/admin/password', 'Auth\AdminPasswordController');
Route::controller('/admin', 'Auth\AdminAuthController');

	
Route::post('/auth', 'UserController@checkAuth');

/*Route::post('/profile/account', 'ProfileController@account');
Route::post('/profile/update', 'ProfileController@update');*/

//Route::resource('admin/profile', 'Admin\profileController');
Route::controller('/admin', 'Auth\AdminAuthController');





Route::post('/auth', 'UserController@checkAuth');

Route::post('/profile/account', 'ProfileController@account');
Route::post('/profile/update', 'ProfileController@update');
