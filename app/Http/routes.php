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


Route::get('/', ['uses' => 'UserController@index']);
Route::controller('/auth', 'Auth\AuthController');
Route::post('/admin/getcustomers', ['uses' => 'Admin\AdminController@customers']);
Route::controller('/password', 'Auth\PasswordController');
 
//ADMIN ROUTES 
Route::get('/admin', ['uses' => 'Admin\AdminController@home']);
Route::controller('/admin', 'Auth\AdminAuthController');
Route::controller('/admin/password', 'Auth\AdminPasswordController');


Route::get('/admin/logout', 'Auth\AdminAuthController@logout');
	
Route::post('/auth', 'UserController@checkAuth');

Route::post('/profile/account', 'ProfileController@account');
Route::post('/profile/update', 'ProfileController@update');

