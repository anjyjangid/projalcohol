<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\SettingRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;

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

		if(isset($_GET['code']) && !empty($_GET['code'])) {
			
			$code = $_GET['code'];
			$authConfig['code'] = $code;            
			
			// Create object
			$responseObj = $gcp->getAccessToken($urlconfig['accesstoken_url'],$authConfig);           

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
			'link' => 'Required|URL',
		];

		if($request->hasFile('rightImage')){
			$rules['rightImage'] = 'image|max:5102';
		}

		if($request->hasFile('leftImage')){
			$rules['leftImage'] = 'image|max:5102';	
		}

		$this->validate($request,$rules);

		$inputs = $request->all();
		$setting = Setting::find('announcementBar');

		$setting->settings = $inputs;

		if($request->hasFile('rightImage')){
		    $image = $inputs['rightImage'];    
		    $filename = $setting->_id.'_rightImage'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('announcement');
		    if (!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }            
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['rightImage'] = $filename;
		}

		if($request->hasFile('leftImage')){
		    $image = $inputs['leftImage'];
		    $filename = $setting->_id.'_leftImage'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('announcement');
		    if (!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }            
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['leftImage'] = $filename;
		}

		$setting->settings = $inputs;
		// prd($setting);
		if($setting->save()){
			return response(array("success"=>true,"message"=>"Settings updated successfully"));
		}

		return response(array("success"=>false,"message"=>"Something went wrong"));
	}
}
