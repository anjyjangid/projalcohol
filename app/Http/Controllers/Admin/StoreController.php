<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\StoreRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Store;

class StoreController extends Controller
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
    public function store(StoreRequest $request)
    {
        $inputs = $request->all();

        //$inputs['latitude'] = (float)($inputs['latitude']);
        //$inputs['longitude'] = (float)($inputs['longitude']);

        //$inputs['location'] = [$inputs['latitude'],$inputs['longitude']];
        $store = Store::create($inputs);

        if($store){
            return response($store,201);
        }

        return response('Unable to create store',422);
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
        $stores = Store::find($id);

        if($stores){
            return response($stores);
        }

        return response('Stores not found.',422);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(StoreRequest $request, $id)
    {
        $inputs = $request->all();

        //$inputs['latitude'] = (float)($inputs['latitude']);
        //$inputs['longitude'] = (float)($inputs['longitude']);

        //$inputs['location'] = [$inputs['latitude'],$inputs['longitude']];

        $store = Store::find($id);

        $update = $store->update($inputs);

        if($update){
            return response($store,200);
        }

        return response('Unable to update store, please try again.',422);
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

    public function postStorelist(Request $request){

        $params = $request->all();

        $stores = new Store;

        extract($params);

        if(isset($name) && trim($name)!=''){            
            $stores = $stores->where('name','regexp', "/.*$name/i");
        }

        if(isset($email) && trim($email)!=''){            
            $stores = $stores->where('email','regexp', "/.*$email/i");
        }

        if(isset($telephone) && trim($telephone)!=''){            
            $stores = $stores->where('telephone','regexp', "/.*$telephone/i");
        }

        $iTotalRecords = $stores->count();      
      
        $stores = $stores->orderBy('created','desc');      

        if(isset($length)){            
            $stores = $stores
            ->skip(0)
            ->take((int)$length);
        }

        $stores = $stores->get();

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $stores            
        ];

        return response($response,200);

    }

    public function getStorelist(Request $request){

        $params = $request->all();

        $stores = new Store;        

        $iTotalRecords = $stores->count();      
      
        $stores = $stores->orderBy('name','desc');              

        $stores = $stores->get(['_id','name']);        

        return response($stores,200);

    }
}
