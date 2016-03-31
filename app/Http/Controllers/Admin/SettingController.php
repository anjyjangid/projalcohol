<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\SettingRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;

use AlcoholDelivery\Setting as Setting;

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
    
    
}
