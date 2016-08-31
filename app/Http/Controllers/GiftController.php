<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Gift;
use AlcoholDelivery\Setting;

class GiftController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $model = Gift::with('categorydetail','subcategorydetail')->find($id);
        $model->price = $this->calculatePrice($model);        
        unset($model->costprice);
        return response($model,200);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    private function calculatePrice($giftdata){

        $tiers = [];

        $cost = $giftdata->costprice;

        if($giftdata->gift_packaging){
            $tiers = $giftdata->gift_packaging;
        }elseif($giftdata->subcategorydetail->gift_packaging){
            $tiers = $giftdata->subcategorydetail->gift_packaging;
        }elseif($giftdata->categorydetail->gift_packaging){
            $tiers = $giftdata->categorydetail->gift_packaging;
        }else{
            $settingObj = new Setting;            
            $globalsetting = $settingObj->getSettings(array(
              "key"=>'pricing',
              "multiple"=>false
            ));

            if($globalsetting)
                $tiers = $globalsetting->gift_packaging;
        }
        if($tiers['type'] == 1){
            $p = $cost+($cost/100*$tiers['value']);
        }else{
            $p = $cost+$tiers['value'];
        }      

        return round($p,2);        

    }

    
}
