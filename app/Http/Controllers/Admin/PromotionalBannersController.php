<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;
use Image;

use AlcoholDelivery\PromotionalBanners;
use AlcoholDelivery\Http\Requests\PromotionalBannersRequest;

class PromotionalBannersController extends Controller
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

	public function getPromotionalbanner($promotionalbannerId){

		$result = PromotionalBanners::find($promotionalbannerId);
		if(!empty($result)){
			return response($result, 200);
		}else{
			return response(array("success"=>false,"message"=>"Something went wrong"));
		}
	}

	// show grid data
	public function postList(Request $request,$id = false){

		$params = $request->all();

        extract($params);

        $columns = ['_id','status','promotionalImage','promotionalImageMobile'];

        $project = ['status'=>1,'promotionalImage'=>1,'promotionalImageMobile'=>1];

        $query = [];

        $query[]['$unwind'] = [
        	'path' => '$ancestors',
        	'preserveNullAndEmptyArrays' => true
        ];
        
        $query[]['$lookup'] = [
        	'from' => 'promotionalbanners',
        	'localField' => 'ancestors._id',
        	'foreignField' => '_id',
        	'as' => 'ancestor'
        ];

        $query[]['$project'] = $project;

        $query[]['$unwind'] = [
        	'path' => '$ancestor',
        	'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$project'] = $project;

		/*if(isset($cat_title) && trim($cat_title)!=''){
			$s = "/".$cat_title."/i";
			$query[]['$match']['cat_title'] = ['$regex'=>new \MongoRegex($s)];
		}

		if(isset($cat_status) && trim($cat_status)!=''){
			
			$query[]['$match']['cat_status'] = (int)$cat_status;
		}*/

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = PromotionalBanners::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = PromotionalBanners::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);		
		
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(PromotionalBannersRequest $request){

		$inputs = $request->all();
		// echo "<pre>"; print_r($inputs); echo "</pre>"; exit;
		
		$promotionalBanners = new promotionalBanners;
		$promotionalBanners->__set("status",(int)$inputs['status']);
		$promotionalBanners->save();

		if($request->hasFile('promotionalImage')){
		    $image = $inputs['promotionalImage'];    
		    $filename = $promotionalBanners->_id.'_bannerImage'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('promotionalbanner');
		    if (!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }            
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['promotionalImage'] = $filename;
		}

		if($request->hasFile('promotionalImageMobile')){
		    $image = $inputs['promotionalImageMobile'];    
		    $filename = $promotionalBanners->_id.'_bannerImageMobile'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('promotionalbanner');
		    if (!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }            
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['promotionalImageMobile'] = $filename;
		}

		$promotionalBanners->__set("promotionalImage",$inputs['promotionalImage']);
		$promotionalBanners->__set("promotionalImageMobile",$inputs['promotionalImageMobile']);

		if($promotionalBanners->save()){
			return response(array("success"=>true,"message"=>"Promotional banner saved successfully."));
		}

		return response(array("success"=>false,"message"=>"Something went wrong"));
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
    **/
    public function postUpdate(PromotionalBannersRequest $request, $id){

        $inputs = $request->all();

        $promotionalBanners = PromotionalBanners::find($id);
		$promotionalBanners->status = (int)$inputs['status'];

		if($request->hasFile('promotionalImage')){
		    $image = $inputs['promotionalImage'];
		    $filename = $promotionalBanners->_id.'_bannerImage'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('promotionalbanner');
		    // if directory not exist then create directory
		    if(!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }
		    // if image already exist then remove old image
		    if(File::exists($destinationPath."/".$promotionalBanners->promotionalImage)){
		    	File::delete($destinationPath."/".$promotionalBanners->promotionalImage);
		    }
		    // upload new image
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['promotionalImage'] = $filename;
		}

		if($request->hasFile('promotionalImageMobile')){
		    $image = $inputs['promotionalImageMobile'];    
		    $filename = $promotionalBanners->_id.'_bannerImageMobile'.'.'.$image->getClientOriginalExtension();
		    $destinationPath = storage_path('promotionalbanner');
		    // if directory not exist then create directory
		    if(!File::exists($destinationPath)){
		        File::MakeDirectory($destinationPath,0777, true);
		    }
			// if image already exist then remove old image
		    if(File::exists($destinationPath."/".$promotionalBanners->promotionalImageMobile)){
		    	File::delete($destinationPath."/".$promotionalBanners->promotionalImageMobile);
		    }
		    // upload new image
		    $upload_success = $image->move($destinationPath, $filename);
		    $inputs['promotionalImageMobile'] = $filename;
		}

		$promotionalBanners->promotionalImage = $inputs['promotionalImage'];
		$promotionalBanners->promotionalImageMobile = $inputs['promotionalImageMobile'];

		if($promotionalBanners->save()){
			return response(array("success"=>true,"message"=>"Promotional banner updated successfully."));
		}

		return response(array("success"=>false,"message"=>"Something went wrong"));
        
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id){
        try{
    		$result = PromotionalBanners::where('_id', $id)->delete();
        	return response(array("success"=>true,"message"=>"Record(s) Removed Successfully"));
    	}catch(\Illuminate\Database\QueryException $e){
    		return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));
    	}

    	return response(array($e,"success"=>false,"message"=>"Please try again later!"));
    }
}