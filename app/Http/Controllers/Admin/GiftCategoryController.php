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
            foreach ($inputs['loyalty'] as $key => $value) {
                unset($inputs['cards'][$key]['$$hashKey']);
                $inputs['cards'][$key]['value'] = (int)$inputs['cards'][$key]['value'];
            }
        }

        if(isset($inputs['gift_packaging'])){
            $inputs['gift_packaging']['type'] = (int)$inputs['gift_packaging']['type'];
            $inputs['gift_packaging']['value'] = (float)$inputs['gift_packaging']['value'];            
        }

        if(isset($inputs['parent']) && !empty($inputs['parent'])){
            $inputs['parentObject'] = new MongoId($inputs['parent']);
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
                $inputs['cards'][$key]['value'] = (float)$inputs['cards'][$key]['value'];
            }

            foreach ($inputs['cards'] as $key => $value) {
                $inputs['cards'][$key]['loyalty'] = isset($inputs['cards'][$key]['loyalty'])?(int)$inputs['cards'][$key]['loyalty']:0;
            }
        }
        

        $model = GiftCategory::find($id);

        if(isset($inputs['gift_packaging'])){
            $inputs['gift_packaging']['type'] = (int)$inputs['gift_packaging']['type'];
            $inputs['gift_packaging']['value'] = (float)$inputs['gift_packaging']['value'];            
        }else{
            $model->unset('gift_packaging');
        }

        if(isset($inputs['parent']) && !empty($inputs['parent'])){
            $inputs['parentObject'] = new MongoId($inputs['parent']);
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

        $columns = ['_id','smallTitle','parent','status'];

        $project = ['title'=>1,'ancestor'=>1,'status'=>1,'parentObject'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $query = [];

        $query[]['$match']['type'] = 'category';

        $query[]['$lookup'] = [
            'from' => 'giftcategories',
            'localField'=>'parentObject',
            'foreignField'=>'_id',
            'as'=>'ancestor'
        ];

        $query[]['$unwind'] = [
            'path' => '$ancestor',
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

        if(isset($parent) && trim($parent)!=''){            
            $query[]['$match']['parentObject'] = new MongoId($parent);            
        }

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = GiftCategory::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = GiftCategory::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
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
