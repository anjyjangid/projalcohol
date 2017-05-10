<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\SettingRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;
use Intervention\Image\Facades\Image;

use AlcoholDelivery\Setting as Setting;

use AlcoholDelivery\Libraries\GoogleCloudPrint\GoogleCloudPrint;

use DB;
use File;

class SettingController extends Controller
{
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('admin');
	}
	
	/**
	 * Show the form for creating a new resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function create()
	{
		//
	}

	
	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	**/
	public function update(SettingRequest $request, $id)
	{
		$inputs = $request->all();

		$setting = Setting::find($id);

		if(isset($inputs['site_sharing']) || isset($inputs['order_sharing'])){
			$inputs['site_sharing']['status'] = (int)$inputs['site_sharing']['status'];
			$inputs['order_sharing']['status'] = (int)$inputs['order_sharing']['status'];
		}

		$setting->settings = $inputs;
		if($setting->save()){
			return response(array("success"=>true,"message"=>"Settings updated successfully"));
		}

		return response(array("success"=>false,"message"=>"Something went wrong"));
	}

	
	public function getSettings($settingKey){
		$settingObj = new Setting;
		$result = $settingObj->getSettings(array(
						"key"=>$settingKey,
						"multiple"=>false
					));
		return response($result, 201);
	}
	
	/**
	 * Authrize google account
	 * @param  \Illuminate\Http\Request  $request
	**/
	public function getAuthorizeGoogleAccount(Request $request){
		// dd($request->all());
		$gcp = new GoogleCloudPrint();
		$urlconfig = GoogleCloudPrint::$urlconfig;
		$redirectConfig = GoogleCloudPrint::$redirectConfig;
		$offlineAccessConfig = GoogleCloudPrint::$offlineAccessConfig;
		$authConfig = GoogleCloudPrint::$authConfig;
		$redirectConfig['redirect_uri'] = url('adminapi/setting/authorize-google-account');
		$authConfig['redirect_uri'] = url('adminapi/setting/authorize-google-account');
		$refreshTokenConfig = GoogleCloudPrint::$refreshTokenConfig;

		$redirectConfig['client_id'] = env('GOOGLE_ID','229065817262-nu2vmndbtlqaovj89r0r5m0hrg3fti61.apps.googleusercontent.com');
		$authConfig['client_id'] = env('GOOGLE_ID','229065817262-nu2vmndbtlqaovj89r0r5m0hrg3fti61.apps.googleusercontent.com');
		$authConfig['client_secret'] = env('GOOGLE_SECRET','ByY9s-NiiU_pqB_luqoAYI0q');
		$refreshTokenConfig['client_id'] = env('GOOGLE_ID','229065817262-nu2vmndbtlqaovj89r0r5m0hrg3fti61.apps.googleusercontent.com');
		$refreshTokenConfig['client_secret'] = env('GOOGLE_SECRET','ByY9s-NiiU_pqB_luqoAYI0q');
		if(isset($_GET['code']) && !empty($_GET['code'])) {
			
			$code = $_GET['code'];
			$authConfig['code'] = $code;            
			
			// Create object
			$responseObj = $gcp->getAccessToken($urlconfig['accesstoken_url'],$authConfig);           

			//return response($responseObj);

			// We requested offline access
			if (isset($responseObj->refresh_token)) {

				$accessToken = $responseObj->access_token;
				
				$gcp->setAuthToken($accessToken);
				$printers = $gcp->getPrinters();               

				$tokenData = [
					'refresh_token' => $responseObj->refresh_token,
					'printers' => $printers,
					'status' => 1,
					'setDefault' => 0
				];

				DB::collection('printers')->raw()->remove([]);

				DB::collection('printers')->insert($tokenData);
				
				/*header("Location: offlineToken.php?offlinetoken=".$responseObj->refresh_token);
				exit;*/
			}else{
				
				$printers = DB::collection('printers')->first();
				
				if($printers){

					$refreshTokenConfig['refresh_token'] = $printers['refresh_token'];

					$token = $gcp->getAccessTokenByRefreshToken($urlconfig['refreshtoken_url'],http_build_query($refreshTokenConfig));

					$gcp->setAuthToken($token);

					$printers = $gcp->getPrinters();

					$update = DB::collection('printers')->raw()->update([],['$set'=>['printers'=>$printers]]);

				}
			}

			return redirect('/admin#/cloudprinters');
			
			/*$_SESSION['accessToken'] = $accessToken;
			header("Location: example.php");*/
		}
		

		//return response($redirectConfig,400);

		$url = $urlconfig['authorization_url']."?".http_build_query(array_merge($redirectConfig,$offlineAccessConfig));
		return response(['success'=>true,'url'=>$url]);        

		// Google redirected back with code in query string.
		

	}

	public function getPrinterlist(Request $request){

		 $printers = DB::collection('printers')->first();
		 return response($printers);

	}

	public function postUpdate(Request $request){

		$data = $request->all();

		if(isset($data['setDefault'])){            
			
			$update = DB::collection('printers')->raw()->update([],[
				'$set'=>[
					'setDefault'=>$data['setDefault'],
					'status' => (int)$data['status'],
				]
			]);
			if($update)
				return response('Updated successfully.',200);
		}

		return response('Error in saving printer detail',400);

	}

	public function postAnnouncement(Request $request){
		$rules = [
			'enable' => 'Required|Boolean',
			'text' => 'Required',
			'link' => 'URL',
		];
		
		

		if($request->hasFile('rightImage')){
			$rules['rightImage'] = 'image|max:5102';
		}

		if($request->hasFile('leftImage')){
			$rules['leftImage'] = 'image|max:5102';	
		}

		$this->validate($request,$rules);

		$inputs = $request->all();		
		
		if($inputs['rightImage']=='undefined'){
			$inputs['rightImage'] = NULL;
		}

		if($inputs['leftImage']=='undefined'){
			$inputs['leftImage'] = NULL;
		}

		$setting = Setting::find('announcementBar');

		// $setting->settings = $inputs;

		if($request->hasFile('rightImage')){
		    $image = $inputs['rightImage'];    
		    $filename = $setting->_id.'_rightImage'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('announcement');
		    if (!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }            

		    $upload_success = Image::make($image)->resize(50, null, function ($constraint) {
											$constraint->aspectRatio();
									})->save($destinationPath.'/'.$filename,80);

			$inputs['rightImage'] = $filename;
		}

		if($request->hasFile('leftImage')){
		    
		    $image = $inputs['leftImage'];
		    $filename = $setting->_id.'_leftImage'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('announcement');

			if (!File::exists($destinationPath)){
				File::MakeDirectory($destinationPath,0777, true);
			}		    

		    $upload_success = Image::make($image)->resize(50, null, function ($constraint) {
											$constraint->aspectRatio();
									})->save($destinationPath.'/'.$filename,80);

		    $inputs['leftImage'] = $filename;
		}

		$setting->settings = $inputs;
		
		if($setting->save()){
			return response(array("success"=>true,"message"=>"Settings updated successfully"));
		}

		return response(array("success"=>false,"message"=>"Something went wrong"));
	}

	public function postHomeBanner(Request $request){
		$rules = [
			'status' => 'Required|Boolean',
			'title' => 'Required',
			'subtitle' => 'Required',
			'description' => 'Required',
		];

		if($request->hasFile('bannerImage')){
			$rules['bannerImage'] = 'Required|image|mimes:jpeg,jpg';
		}

		if($request->hasFile('bannerImageMobile')){
			$rules['bannerImageMobile'] = 'Required|image|mimes:jpeg,jpg';
		}

		$this->validate($request,$rules);

		$inputs = $request->all();

		$setting = Setting::find('homeBanner');
		// echo "<pre>"; print_r($inputs); echo "</pre>"; exit;

		$setting->__set("settings",$inputs);
		// $setting->settings = $inputs;

		if($request->hasFile('bannerImage')){
		    $image = $inputs['bannerImage'];    
		    $filename = $setting->_id.'_bannerImage'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('homebanner');
		    if (!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }            
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['bannerImage'] = $filename;
		}

		if($request->hasFile('bannerImageMobile')){
		    $image = $inputs['bannerImageMobile'];    
		    $filename = $setting->_id.'_bannerImageMobile'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('homebanner');
		    if (!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }            
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['bannerImageMobile'] = $filename;
		}

		$setting->settings = $inputs;
		// prd($setting);
		if($setting->save()){
			return response(array("success"=>true,"message"=>"Settings updated successfully"));
		}

		return response(array("success"=>false,"message"=>"Something went wrong"));
	}

}
