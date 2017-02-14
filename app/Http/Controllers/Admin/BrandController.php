<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\BrandRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;
use Image;

use AlcoholDelivery\Brand as Brand;

class BrandController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        
    }
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
    public function store(BrandRequest $request)
    {    

       	if ($request->hasFile('image'))
        {
            if ($request->file('image')->isValid()){

                $image = $request->file('image');
                $detail = pathinfo($request->file('image')->getClientOriginalName());
                $thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();    
                $path = public_path('assets/resources/brand');
                

                if (!File::exists($path)){
                    File::MakeDirectory($path,0777, true);
                }
                            
                if (!File::exists($path.'/200')){
                    File::MakeDirectory($path.'/200',0777, true);
                }
                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400/',0777, true);
                }

                Image::make($image)->save($path.'/'.$thumbNewName);

                Image::make($image)->resize(200, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/200/'.$thumbNewName);

                Image::make($image)->resize(400, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/400/'.$thumbNewName);            

            }else{

                return response('There is some issue with image file', 400);

            }
            
        }
       

       	$inputs = $request->all();
        
        $inputs['status'] = (int)$inputs['status'];

        $inputs['image'] = $thumbNewName;

       	
        try {

            Brand::create($inputs);

        } catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()));

        }
       	
        return response(array("success"=>true,"message"=>"Brand created successfully"));
       	
       	
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {

        $result = Brand::where("_id",$id)->first(array("title","image","link","status"));

        return response($result, 201);

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
    public function postUpdate(BrandRequest $request, $id)
    {   

        $brand = Brand::find($id);

        if(is_null($brand)){

            return response(array("success"=>false,"message"=>"Invalid Request :: Record you want to update is not exist"));

        }

        $inputs = $request->all();

        if ($request->hasFile('image'))
        {
            if ($request->file('image')->isValid()){

                $image = $request->file('image');
                $detail = pathinfo($request->file('image')->getClientOriginalName());
                $thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();    
                $path = public_path('assets/resources/brand');
                

                if (!File::exists($path)){
                    File::MakeDirectory($path,0777, true);
                }
                            
                if (!File::exists($path.'/200')){
                    File::MakeDirectory($path.'/200',0777, true);
                }
                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400/',0777, true);
                }

                Image::make($image)->save($path.'/'.$thumbNewName);

                Image::make($image)->resize(200, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/200/'.$thumbNewName);

                Image::make($image)->resize(400, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/400/'.$thumbNewName);            

                $brand->image = $thumbNewName;

            }else{

                return response('There is some issue with image file', 400);

            }
            
        }
        


        $brand->title = $inputs['title'];
        $brand->link = $inputs['link'];        
        $brand->status = (int)$inputs['status'];        
                
        try {

            $brand->save();

        } catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()));

        }
        
        return response(array("success"=>true,"message"=>"Brand $brand->title Updated successfully"));
                    
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($ids)
    {   
        prd("asdasd");
        $keys = explode(",", $ids);
        
        try {

            $brands = Brand::whereIn('_id', $keys)->delete();

        } catch(\Illuminate\Database\QueryException $e){

            return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

        }

        return response(array($brands,"success"=>true,"message"=>"Record(s) Removed Successfully"));
    }

    public function postListing(Request $request,$id = false)
    {

        $params = $request->all();

        extract($params);

        $columns = ['_id','_id','image','smallTitle','link','status'];

        $project = ['image'=>1,'title'=>1,'link'=>1,'status'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $query = [];
        
        $query[]['$project'] = $project;

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = Brand::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Brand::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);       
        
    }


}
