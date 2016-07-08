<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Http\Requests\GiftCategoryRequest;
use AlcoholDelivery\GiftCategory;
use File;
use MongoId;

class GiftCategoryController extends Controller
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
    public function store(GiftCategoryRequest $request)
    {
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];

        if(!isset($inputs['type']))
            $inputs['type'] = 'category';

        if(isset($inputs['cards'])){
            foreach ($inputs['cards'] as $key => $value) {
                unset($inputs['cards'][$key]['$$hashKey']);
                $inputs['cards'][$key]['value'] = (int)$inputs['cards'][$key]['value'];
            }
        }

        if(isset($inputs['gift_packaging'])){
            $inputs['gift_packaging']['type'] = (int)$inputs['gift_packaging']['type'];
            $inputs['gift_packaging']['value'] = (float)$inputs['gift_packaging']['value'];            
        }

        $model = GiftCategory::create($inputs);

        if($model){
            if(isset($inputs['image']) && !empty($inputs['image']))            
                $this->saveImage($model,$inputs['image']);

            return response($model,200);
        }else{
            return response(['message'=>'Error creating data'],422);
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
        /*$model = GiftCategory::find($id);

        if($model){
            return response($model,200);
        }else{
            return response(['message'=>'Invalid id.'],422);
        }*/
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $model = GiftCategory::find($id);

        if($model){
            return response($model,200);
        }else{
            return response(['message'=>'Invalid id.'],422);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function postUpdate(GiftCategoryRequest $request, $id)
    {
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];

        if(!isset($inputs['type']))
            $inputs['type'] = 'category';

        if(isset($inputs['cards'])){
            foreach ($inputs['cards'] as $key => $value) {
                unset($inputs['cards'][$key]['$$hashKey']);
                $inputs['cards'][$key]['value'] = (int)$inputs['cards'][$key]['value'];
            }
        }

        

        $model = GiftCategory::find($id);

        if(isset($inputs['gift_packaging'])){
            $inputs['gift_packaging']['type'] = (int)$inputs['gift_packaging']['type'];
            $inputs['gift_packaging']['value'] = (float)$inputs['gift_packaging']['value'];            
        }else{
            $model->unset('gift_packaging');
        }

        if($model){
            $update = $model->update($inputs);
            
            if(isset($inputs['image']) && !empty($inputs['image']))            
                $this->saveImage($model,$inputs['image']);

            return response($model,200);
        }else{
            return response(['message'=>'Error creating data'],422);
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

    /**
     * List all the parent categories from storage.
     *     
     * @return \Illuminate\Http\Response
     */
    public function getAllparent(Request $request){

        $model = GiftCategory::where('type','=','category')->whereNull('parent')->get();

        return response($model,200);

    }

    public function saveImage($giftcategory,$file){        

        
        $destinationPath = storage_path('giftcategory');
        if (!File::exists($destinationPath)){
            File::MakeDirectory($destinationPath,0777, true);
        }            
        $image = @$file['thumb'];
        if($image){
            $filename = $giftcategory->_id.'.'.$image->getClientOriginalExtension();
            $upload_success = $image->move($destinationPath, $filename);
            $giftcategory->coverImage = ['source'=>$filename];
        }            
        $iconimage = @$file['iconthumb'];                        
        if($iconimage){
            $iconfilename = $giftcategory->_id.'_icon.'.$iconimage->getClientOriginalExtension();
            $upload_success = $iconimage->move($destinationPath, $iconfilename);
            $giftcategory->iconImage = ['source'=>$iconfilename];
        }            
        $giftcategory->save();
        
    }

    public function postListcategories(Request $request){
        $params = $request->all();        

        extract($params);

        $model = new GiftCategory;

        $model = $model->where('type','=','category');

        if(isset($name) && trim($name)!=''){
            $sval = $name;
            $model = $model->where('title','regexp', "/.*$sval/i");
        }

        if(isset($status) && trim($status)!=''){            
            $model = $model->where('status',(int)$status);
        }

        if(isset($parent) && trim($parent)!=''){            
            $model = $model->where('parent','=',$parent);
        }

        $iTotalRecords = $model->count();        

        $columns = array('_id','title','parent','status');

        $model = $model->with('ancestor')
        ->skip((int)$start)
        ->take((int)$length);

        $model = $model->get($columns);

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model            
        ];
      
        return response($response,200);
    }

    public function getGiftcard(Request $request){        
        $model = GiftCategory::where('type','=','giftcard')->first();
        if($model)
            return response($model,200);
        else
            return response(['No cards found'],404);
    }

    public function getCategorylist(Request $Request,$pid = null){

        $list = GiftCategory::where('type','=','category')->get();
        
        return response($list,200);
    }
}