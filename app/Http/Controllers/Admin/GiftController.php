<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Http\Requests\GiftRequest;
use AlcoholDelivery\Gift;
use File;
use MongoId;

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
        $inputs['costprice'] = (float)$inputs['costprice'];
        
        if(isset($inputs['limit']))
            $inputs['limit'] = (int)$inputs['limit'];

        if(isset($inputs['gift_packaging'])){
            $inputs['gift_packaging']['type'] = (int)$inputs['gift_packaging']['type'];
            $inputs['gift_packaging']['value'] = (float)$inputs['gift_packaging']['value'];            
        }

        if(isset($inputs['category']) && !empty($inputs['category'])){
            $inputs['categoryObject'] = new MongoId($inputs['category']);
        }

        if(isset($inputs['subcategory']) && !empty($inputs['subcategory'])){
            $inputs['subcategoryObject'] = new MongoId($inputs['subcategory']);
        }

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
        $inputs['costprice'] = (float)$inputs['costprice'];

        if(isset($inputs['limit']))
            $inputs['limit'] = (int)$inputs['limit'];

        $model = Gift::find($id);

        if(isset($inputs['gift_packaging'])){
            $inputs['gift_packaging']['type'] = (int)$inputs['gift_packaging']['type'];
            $inputs['gift_packaging']['value'] = (float)$inputs['gift_packaging']['value'];            
        }else{
            $model->unset('gift_packaging');
        }       

        if(isset($inputs['category']) && !empty($inputs['category'])){
            $inputs['categoryObject'] = new MongoId($inputs['category']);
        }

        if(isset($inputs['subcategory']) && !empty($inputs['subcategory'])){
            $inputs['subcategoryObject'] = new MongoId($inputs['subcategory']);
        }

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

        $columns = ['_id','smallTitle','category','status'];

        $project = ['title'=>1,'categorydetail'=>1,'subcategorydetail'=>1,'status'=>1,'categoryObject'=>1,'subcategoryObject'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $query = [];
        
        $query[]['$lookup'] = [
            'from' => 'giftcategories',
            'localField'=>'categoryObject',
            'foreignField'=>'_id',
            'as'=>'categorydetail'
        ];

        $query[]['$unwind'] = [
            'path' => '$categorydetail',
            'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$lookup'] = [
            'from' => 'giftcategories',
            'localField'=>'subcategoryObject',
            'foreignField'=>'_id',
            'as'=>'subcategorydetail'
        ];

        $query[]['$unwind'] = [
            'path' => '$subcategorydetail',
            'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$project'] = $project;

        if(isset($name) && trim($name)!=''){
            $s = '/'.$name.'/i';
            $query[]['$match']['title'] = ['$regex'=>new \MongoRegex($s)];
        }

        if(isset($status) && trim($status)!=''){       
            $query[]['$match']['status'] = (int)$status;            
        }

        if(isset($category) && trim($category)!=''){            
            $query[]['$match']['categoryObject'] = new MongoId($category);            
        }

        if(isset($subcategory) && trim($subcategory)!=''){            
            $query[]['$match']['subcategoryObject'] = new MongoId($subcategory);            
        }        

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = Gift::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Gift::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);        
    }

    /*public function test(Request $request){
        $model = Gift::with('categorydetail')->first();
        return dd($model);
    }*/    
}
