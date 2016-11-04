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

        $setting = setting::find($id);

        $setting->settings = $inputs;

        if($setting->save()){
            return response(array("success"=>true,"message"=>"Settings updated successfully"));
        }

        return response(array("success"=>false,"message"=>"Something went worng"));
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
        $googleObject  = new GoogleCloudPrint;
        $url = GoogleCloudPrint::$urlconfig['authorization_url']."?".http_build_query(array_merge(GoogleCloudPrint::$redirectConfig,GoogleCloudPrint::$offlineAccessConfig));
        return response(['success'=>true,'url'=>$url]);

        if (isset($_GET['op'])) {
            
            if ($_GET['op']=="getauth") {
                header("Location: ".$urlconfig['authorization_url']."?".http_build_query($redirectConfig));
                exit;
            }
            else if ($_GET['op']=="offline") {
                header("Location: ".$urlconfig['authorization_url']."?".http_build_query(array_merge($redirectConfig,$offlineAccessConfig)));
                exit;
            }
        }

        session_start();

        // Google redirected back with code in query string.
        if(isset($_GET['code']) && !empty($_GET['code'])) {
            
            $code = $_GET['code'];
            $authConfig['code'] = $code;
            
            // Create object
            $gcp = new GoogleCloudPrint();
            $responseObj = $gcp->getAccessToken($urlconfig['accesstoken_url'],$authConfig);
            
            $accessToken = $responseObj->access_token;

            // We requested offline access
            if (isset($responseObj->refresh_token)) {
            header("Location: offlineToken.php?offlinetoken=".$responseObj->refresh_token);
            exit;
            }
            $_SESSION['accessToken'] = $accessToken;
            header("Location: example.php");
        }

    }
    
}
