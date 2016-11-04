<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\HolidayRequest;
use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\Holiday;
use MongoDate;

class HolidayController extends Controller
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
    public function store(HolidayRequest $request)
    {
        $inputs = $request->all();
        
        $inputs['timeStamp'] = (float)$inputs['timeStamp'];

        $holiday = Holiday::create($inputs);    

        if($holiday)
            return response($holiday,201);
        else
            return response(['title'=>'Error in creating holiday.'],422);

    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(HolidayRequest $request, $id)
    {
        $inputs = $request->all();
        $holiday = Holiday::find($id);

        $update = false;

        if(isset($inputs['timeStamp']) && !empty($inputs['timeStamp']))
            $inputs['timeStamp'] = (int)$inputs['timeStamp'];

        if($holiday)
            $update = $holiday->update($inputs);
        else if($id=='weekdayoff')
            $update = Holiday::raw()->insert($inputs);            
        

        if($update)
            return response($holiday,201);
        else
            return response(['title'=>'Error in updating holiday.'],422);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $holiday = Holiday::find($id);

        if($holiday->delete()){
            return response(['message'=>'Delected successfully.'],200);
        }else{
            return response(['title'=>'Error in updating holiday.'],422);
        }
    }

    public function postList(Request $request){

        $param = $request->all();
        $start = (float)$param['start'];
        $end = (float)$param['end'];
        $holidays = Holiday::whereBetween('timeStamp', [$start, $end])->orWhere('_id','weekdayoff')->get();
        return response($holidays,200);

    }
}
