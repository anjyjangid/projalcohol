<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Http\Requests\GiftRequest;
use AlcoholDelivery\Gift;
use File;

class GiftController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        
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
    public function store(GiftRequest $request)
    {
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];
        $inputs['type'] = (int)$inputs['type'];
        $inputs['limit'] = (int)$inputs['limit'];

        $gift = Gift::create($inputs);

        if($gift){

            if(isset($inputs['image']) && !empty($inputs['image']))            
                $this->saveImage($gift,$inputs['image']);

            return response($gift,200);
        }else{
            return response(['message'=>'Error creating gift'],422);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $model = new Gift;

        $model = $model->find($id);

        if($model)
            return response($model,200);
        else
            return response(['message'=>'Invalid gift.'],404);
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
    public function postUpdate(GiftRequest $request, $id)
    {
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];
        $inputs['type'] = (int)$inputs['type'];
        $inputs['limit'] = (int)$inputs['limit'];

        $model = Gift::find($id);

        if($model){
            $update = $model->update($inputs);
            if(isset($inputs['image']) && !empty($inputs['image']))            
                $this->saveImage($model,$inputs['image']);

            return response($model,201);
        }else{
            return response(['message'=>'Invalid gift.'],404);
        }
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

    public function saveImage($gift,$file){        

        if(isset($file['thumb'])){
            $image = @$file['thumb'];
            $destinationPath = storage_path('gifts');
            if (!File::exists($destinationPath)){
                File::MakeDirectory($destinationPath,0777, true);
            }
            $filename = $gift->_id.'.'.$image->getClientOriginalExtension();
            $upload_success = $image->move($destinationPath, $filename);
            $gift->coverImage = ['source'=>$filename];
            $gift->save();
        }
    }

    public function postList(Request $request){
        
        $params = $request->all();        

        extract($params);

        $model = new Gift;

        $model = $model->where('type','!=', 4);
        
        if(isset($name) && trim($name)!=''){
            $sval = $name;
            $model = $model->where('title','regexp', "/.*$sval/i");
        }

        if(isset($status) && trim($status)!=''){            
            $model = $model->where('status',(int)$status);
        }

        $iTotalRecords = $model->count();        

        $columns = array('_id','title','status','type');

        $model = $model
        ->skip((int)$start)
        ->take((int)$length);

        $model = $model->get($columns);

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model
            /*'length' => $length,
            'aaData' => []*/
        ];
      
        return response($response,200);
    }

    public function postUpdatecard(GiftRequest $request){

    }    
}
