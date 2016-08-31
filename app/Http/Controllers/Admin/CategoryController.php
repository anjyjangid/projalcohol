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

use AlcoholDelivery\Categories as Categories;

class CategoryController extends Controller
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
	public function store(Request $request)
	{
		$inputs = $request->all();
		
		
		if(isset($inputs['thumb']) && $inputs['thumb']=="undefined"){
			unset($inputs['thumb']);
		}
		if(isset($inputs['lthumb']) && $inputs['lthumb']=="undefined"){
			unset($inputs['lthumb']);
		}

		// validation rules

		$rules = [
			'title' => 'required',
			'slug'  => 'required',
			'isMenu'=> 'required|integer|in:0,1',
			'thumb' => 'required|mimes:jpeg,jpg,png|max:8000',
			'metaTitle' => 'required|max:100',
            'metaKeywords' => 'required|max:150',
            'metaDescription' => 'required|max:150',
		];

		if(!isset($inputs['ptitle']) || $inputs['ptitle']==""){
			$rules['lthumb'] = 'required|mimes:jpeg,jpg,png|max:8000';
		}

		$validator = Validator::make($inputs, $rules);

		// if validation fails
		if ($validator->fails()) {
			
			return response($validator->errors(), 422);
		}
		
		$category = new Categories;

		// Pricing section checks start
		if (isset($inputs['advance_order_bulk']['bulk']) && !empty($inputs['advance_order_bulk']['bulk']))
		{
			foreach ($inputs['advance_order_bulk']['bulk'] as $dKey => $discount)
			{
				unset($inputs['advance_order_bulk']['bulk'][$dKey]['$$hashKey']);
				$inputs['advance_order_bulk']['bulk'][$dKey] = [
				  'from_qty' => (int)$discount['from_qty'],
				  'to_qty' => (int)$discount['to_qty'],
				  'type' => (int)$discount['type'],
				  'value' => (float)$discount['value'],
				];                                
			}
			$category->advance_order_bulk = $inputs['advance_order_bulk'];
		}

		if (isset($inputs['express_delivery_bulk']['bulk']) && !empty($inputs['express_delivery_bulk']['bulk']))
		{
			foreach ($inputs['express_delivery_bulk']['bulk'] as $dKey => $discount)
			{
				unset($inputs['express_delivery_bulk']['bulk'][$dKey]['$$hashKey']);
				$inputs['express_delivery_bulk']['bulk'][$dKey] = [
				  'from_qty' => (int)$discount['from_qty'],
				  'to_qty' => (int)$discount['to_qty'],
				  'type' => (int)$discount['type'],
				  'value' => (float)$discount['value'],
				];                                                
			}

			$category->express_delivery_bulk = $inputs['express_delivery_bulk'];
		}

		if (isset($inputs['advance_order']['value']) && !empty($inputs['advance_order']['value'])){
			  $inputs['advance_order']['value'] = (float)$inputs['advance_order']['value'];
			  $category->advance_order = $inputs['advance_order'];
		}

		if (isset($inputs['regular_express_delivery']['value']) && !empty($inputs['regular_express_delivery']['value'])){
			  $inputs['regular_express_delivery']['value'] = (float)$inputs['regular_express_delivery']['value'];
			  $category->regular_express_delivery = $inputs['regular_express_delivery'];
		}

		// Pricing section checks ends
		
		$fileUpload = $this->uploadthumb($request);

		

		if($inputs['ptitle']){

			$parentCategories = Categories::find($inputs['ptitle']);

			$ancestors = $parentCategories->ancestors;

			if(empty($ancestors)){
				$ancestors = [];
			}
			
			array_unshift($ancestors, ["_id" => new MongoId($parentCategories->_id),'title' =>$parentCategories->cat_title]);

			$category->ancestors = $ancestors;

		}

		$category->cat_title = $inputs['title'];
		$category->slug = $inputs['slug'];
		$category->isMenu = (int)$inputs['isMenu'];
		$category->cat_status = 0;
		$category->cat_thumb = $fileUpload->original['thumb'];
		$category->cat_lthumb = isset($fileUpload->original['lthumb'])?$fileUpload->original['lthumb']:'';

		$category->metaTitle = @$inputs['metaTitle'];
		$category->metaKeywords = @$inputs['metaKeywords'];
		$category->metaDescription = @$inputs['metaDescription'];


		if (isset($inputs['bulkDiscount']) && is_array($inputs['bulkDiscount']))
		{
			foreach ($inputs['bulkDiscount'] as $dKey => $discount)
			{
				unset($inputs['bulkDiscount'][$dKey]['$$hashKey']);
				$category->bulkDiscount[$dKey]['quantity'] = (int)$inputs['bulkDiscount'][$dKey]['quantity'];
				$category->bulkDiscount[$dKey]['type'] = (int)$inputs['bulkDiscount'][$dKey]['type'];
				$category->bulkDiscount[$dKey]['value'] = (float)$inputs['bulkDiscount'][$dKey]['value'];
			}
		}

		try {

			$category->save();

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}

		return response(array("success"=>true,"message"=>"Category created successfully"));

	}

	public function uploadthumb(Request $request){
		
		$files = array();

		if ($request->hasFile('thumb'))
		{
			if ($request->file('thumb')->isValid()){

				$image = $request->file('thumb');
				$detail = pathinfo($request->file('thumb')->getClientOriginalName());
				$thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();	
				$path = public_path('assets/resources/category/thumb');
				
				Image::make($image)->save($path.'/'.$thumbNewName);
				
				if (!File::exists($path.'/200')){
					File::MakeDirectory($path.'/200',0777, true);
				}
				if (!File::exists($path.'/400')){
					File::MakeDirectory($path.'/400/',0777, true);
				}

				Image::make($image)->resize(200, null, function ($constraint) {
					$constraint->aspectRatio();
				})->save($path.'/200/'.$thumbNewName);

				Image::make($image)->resize(400, null, function ($constraint) {
					$constraint->aspectRatio();
				})->save($path.'/400/'.$thumbNewName);

				$files['thumb'] = $thumbNewName;

			}
			
		}

		if ($request->hasFile('lthumb'))
		{
			if ($request->file('lthumb')->isValid()){
				
				$image = $request->file('lthumb');
				$detail = pathinfo($request->file('lthumb')->getClientOriginalName());
				$lthumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();	
				$path = public_path('assets/resources/category/lthumb');
				
				Image::make($image)->save($path.'/'.$lthumbNewName);

				if (!File::exists($path.'/400')){
					File::MakeDirectory($path.'/400',0777, true);
				}

				Image::make($image)->resize(400, null, function ($constraint) {
					$constraint->aspectRatio();
				})->save($path.'/400/'.$lthumbNewName);

				$files['lthumb'] = $lthumbNewName;
			}
			
		}

		return response($files);

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
	public function postUpdate(Request $request, $id)
	{
		$inputs = $request->all();

		$rules = [
			'title' => 'required',
			'slug'  => 'required',
			'isMenu'=> 'required|integer|in:0,1',	
			'metaTitle' => 'max:100',
            'metaKeywords' => 'max:150',
            'metaDescription' => 'max:150',		
		];
			

		if ($request->hasFile('thumb')){
			$rules['thumb'] = 'mimes:jpeg,jpg,png|max:8000';
		}
		if ($inputs['thumb']=='undefined'){
			$rules['thumb'] = 'required|mimes:jpeg,jpg,png|max:8000';
		}

		if ($request->hasFile('lthumb')){
			$rules['lthumb'] = 'mimes:jpeg,jpg,png|max:8000';
		}
		if ($inputs['lthumb']=='undefined'){
			$rules['lthumb'] = 'required|mimes:jpeg,jpg,png|max:8000';
		}


		$validator = Validator::make($inputs, $rules);

		// if validation fails
		if ($validator->fails()) {
			
			return response($validator->errors(), 422);
		}
		

		
		$category = Categories::find($id);

		// Pricing section checks start
		if (isset($inputs['advance_order_bulk']['bulk']) && !empty($inputs['advance_order_bulk']['bulk']))
		{
			foreach ($inputs['advance_order_bulk']['bulk'] as $dKey => $discount)
			{
				unset($inputs['advance_order_bulk']['bulk'][$dKey]['$$hashKey']);
				$inputs['advance_order_bulk']['bulk'][$dKey] = [
				  'from_qty' => (int)$discount['from_qty'],
				  'to_qty' => (int)$discount['to_qty'],
				  'type' => (int)$discount['type'],
				  'value' => (float)$discount['value'],
				];                                
			}
			$category->advance_order_bulk = $inputs['advance_order_bulk'];
		}else{
            $unset[] = 'advance_order_bulk';
        }

		if (isset($inputs['express_delivery_bulk']['bulk']) && !empty($inputs['express_delivery_bulk']['bulk']))
		{
			foreach ($inputs['express_delivery_bulk']['bulk'] as $dKey => $discount)
			{
				unset($inputs['express_delivery_bulk']['bulk'][$dKey]['$$hashKey']);
				$inputs['express_delivery_bulk']['bulk'][$dKey] = [
				  'from_qty' => (int)$discount['from_qty'],
				  'to_qty' => (int)$discount['to_qty'],
				  'type' => (int)$discount['type'],
				  'value' => (float)$discount['value'],
				];                                                
			}

			$category->express_delivery_bulk = $inputs['express_delivery_bulk'];
		}else{
            $unset[] = 'express_delivery_bulk';
        }

		if (isset($inputs['advance_order']['value']) && !empty($inputs['advance_order']['value'])){
			  $inputs['advance_order']['value'] = (float)$inputs['advance_order']['value'];
			  $category->advance_order = $inputs['advance_order'];
		}else{
            $unset[] = 'advance_order';
        }

		if (isset($inputs['regular_express_delivery']['value']) && !empty($inputs['regular_express_delivery']['value'])){
			  $inputs['regular_express_delivery']['value'] = (float)$inputs['regular_express_delivery']['value'];
			  $category->regular_express_delivery = $inputs['regular_express_delivery'];
		}else{
            $unset[] = 'regular_express_delivery';
        }

		// Pricing section checks ends
		
		$fileUpload = $this->uploadthumb($request);

		$category->cat_title = $inputs['title'];
		$category->slug = $inputs['slug'];
		$category->isMenu = (int)$inputs['isMenu'];
		
		$category->cat_thumb = isset($fileUpload->original['thumb'])?$fileUpload->original['thumb']:$inputs['thumb'];
		$category->cat_lthumb = isset($fileUpload->original['lthumb'])?$fileUpload->original['lthumb']:$inputs['lthumb'];

		$category->metaTitle = @$inputs['metaTitle'];
		$category->metaKeywords = @$inputs['metaKeywords'];
		$category->metaDescription = @$inputs['metaDescription'];

		try {

			$category->save();
			
			if(!empty($unset)){
				$category->unset($unset);
			}

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}

		return response(array("success"=>true,"message"=>"Category updated successfully"));

		
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($ids)
	{        
		$keys = explode(",", $ids);
		
		try {

			$dealers = Categories::whereIn('_id', $keys)->delete();

		} catch(\Illuminate\Database\QueryException $e){

			return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

		}

		return response(array("success"=>true,"message"=>"Record(s) Removed Successfully"));
	}

	public function getAllparent(Request $request){
		$categories = [];

		$id = $request->one;
		
		if($id=="parents"){
			$categories = Categories::whereNull('ancestors')->get();
		}elseif($id == 'all'){
			$categories = Categories::all()->toArray();
		}else{
			$categories = Categories::where('ancestors.0._id','=',$id)->get();
		}

		return response($categories,200);
	}

	public function postCategorylist(Request $request,$id = false)
	{        
		$params = $request->all();

		$categories = new Categories;        
		

		//$columns = array('_id',"cat_title",'cat_title','ancestors','updated_at','cat_status');
		$columns = array("cat_title",'cat_title','ancestors','updated_at','cat_status');
		$indexColumn = '_id';      
		$table = 'categoies';
			   

			
		/* Individual column filtering */

		if($id){
			$categories = $categories->where('ancestors._id', '=', $id);
		}

		foreach($columns as $fieldKey=>$fieldTitle)
		{              

			if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
			{
							
				if($fieldTitle=='ancestors'){
					$categories = $categories->where($fieldTitle.".0.title", 'regex', "/.*$params[$fieldTitle]/i");

				}elseif($fieldTitle=="cat_status"){

					$categories = $categories->where($fieldTitle, '=', (int)$params[$fieldTitle]);
				}
				else{
					$categories = $categories->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");
				}
							
			}
		}
	
			
		/*
		 * Ordering
		 */        

		if ( isset( $params['order'] ) )
		{

			foreach($params['order'] as $orderKey=>$orderField){

				if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
					
					$categories = $categories->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
					
				}
			}

		}
		
		/* Data set length after filtering */        

		$iFilteredTotal = $categories->count();

		/*
		 * Paging
		 */
		if ( isset( $params['start'] ) && $params['length'] != '-1' )
		{
			$categories = $categories->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
		}

		$iTotal = $categories->count();

		$categories = $categories->get($columns);

		$categories = $categories->toArray();
				
		/*
		 * Output
		 */
		 
		
		$records = array(
			"iTotalRecords" => $iTotal,
			"iTotalDisplayRecords" => $iFilteredTotal,
			"data" => array()
		);

			 
		
		$status_list = array(            
			array("warning" => "in-Active"),
			array("success" => "Active")
		  );



		$srStart = intval( $params['start'] );
		if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
			$srStart = intval($iTotal);
		}

		$i = 1;
		foreach($categories as $key=>$value) {

			$row=array();

			if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
				$row[] = $srStart--;//$row1[$aColumns[0]];
			}else{
				$row[] = ++$srStart;//$row1[$aColumns[0]];
			}

			$status = $status_list[(int)$value['cat_status']];
			
			//$row[] = '<input type="checkbox" name="id[]" value="'.$value['_id'].'">';
					
			$row[] = ucfirst($value['cat_title']);
			$row[] = isset($value['ancestors'][0]['title'])?ucfirst($value['ancestors'][0]['title']):'';
			$row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="category" data-status="'.((int)$value['cat_status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
			/*$row[] = '<a title="View : '.$value['cat_title'].'" ui-sref=userLayout.categories.show({categoryid:"'.$value['_id'].'"}) class="btn btn-xs default"><i class="fa fa-search"></i></a>'.
					 '<a title="Edit : '.$value['cat_title'].'" ui-sref=userLayout.categories.edit({categoryid:"'.$value['_id'].'"}) class="btn btn-xs default"><i class="fa fa-edit"></i></a>';*/

			$row[] = '<a title="Edit : '.$value['cat_title'].'" ui-sref=userLayout.categories.edit({categoryid:"'.$value['_id'].'"}) class="btn btn-xs default"><i class="fa fa-edit"></i></a>';		 
			
			$records['data'][] = $row;
		}
		
		return response($records, 201);
		
	}

	public function getDetail($categoryId){
		
		$categoryObj = new Categories;

		$result = $categoryObj->getCategory(array(
						"key"=>$categoryId,
						"multiple"=>false
					));
		
		return response($result, 201);

	}

	public function getSearchcategory(Request $request){

	  $params = $request->all();

      $categories = new Categories;

      extract($params);      

      if(isset($qry) && trim($qry)!=''){        
        $categories = $categories->where('cat_title','regexp', "/.*$qry/i");
      }     

      $iTotalRecords = $categories->count();      
      
      $columns = ['cat_title','_id','ancestors','cat_thumb'];

      $categories = $categories
      ->skip(0)
      ->take((int)$length);
      
      $categories = $categories->orderBy('cat_title','desc');      

      $categories = $categories->get($columns);      

      foreach ($categories as $key => $value) {
      	$categories[$key]['name'] = $value->cat_title;
      	if(isset($value->ancestors)){
      		$categories[$key]['name'] = $value->ancestors[0]['title'].' > '.$value->cat_title;
      	}
      }
      
      return response($categories,200);
    }

}
