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
	
// Users route
Route::controller('/user', 'Auth\AuthController');
Route::controller('/password', 'Auth\PasswordController');
 
// Admin route
Route::controller('/admin', 'Auth\AdminAuthController');
Route::controller('/admin/password', 'Auth\AdminPasswordController');

	
Route::get('/', ['uses' => 'UserController@index']);
Route::controller('/auth', 'Auth\AuthController');
Route::controller('/password', 'Auth\PasswordController');
 
 
Route::get('/admin', ['uses' => 'Admin\AdminController@getHome']);
Route::controller('/admin', 'Auth\AdminAuthController');
Route::controller('/admin/password', 'Auth\AdminPasswordController');

Route::post('/auth', 'UserController@checkAuth');