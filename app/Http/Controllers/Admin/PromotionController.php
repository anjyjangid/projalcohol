<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\PromotionRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;

use AlcoholDelivery\Promotion as Promotion;
use AlcoholDelivery\Products as Products;

class PromotionController extends Controller
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
	public function store(PromotionRequest $request)
	{

		$inputs = $request->all();
		
		$inputs['status'] = (int)$inputs['status'];

		$products = $inputs['products'];

		$inputs['items'] = [];
		$inputs['products'] = [];

		foreach($products as $product){
			
			array_push($inputs['products'], $product['_id']);

			$inputs['items'][] = [
									'_id' => new MongoId($product['_id']),
									'type'=> (int)$product['type'],
									'price' => isset($product['dprice'])?(float)$product['dprice']:null
								];
		}

		$inputs['count'] = count($inputs['items']);
		
		try {

			Promotion::create($inputs);

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Promotion created successfully"),200);
		
		
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show($id)
	{

		$result = Promotion::where("_id",$id)->first();

		return response($result, 201);

	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function getDetail($id)
	{
		$promotion = new promotion;
		$result = $promotion->getPromotion($id);

		return response($result, 201);

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(PromotionRequest $request, $id)
	{   

		$promotion = Promotion::find($id);

		if(is_null($promotion)){

			return response(array("success"=>false,"message"=>"Invalid Request :: Record you want to update is not exist"));

		}

		$inputs = $request->all();            

		$products = $inputs['products'];

		$inputs['items'] = [];
		$inputs['products'] = [];

		foreach($products as $product){
			
			array_push($inputs['products'], $product['_id']);

			$inputs['items'][] = [
									'_id' => new MongoId($product['_id']),
									'type'=> (int)$product['type'],
									'price' => isset($product['dprice'])?(float)$product['dprice']:null
								];
		}

		$promotion->title = $inputs['title'];
		$promotion->status = (int)$inputs['status'];
		$promotion->count = count($inputs['items']);
		$promotion->items = $inputs['items'];
		$promotion->products = $inputs['products'];
		$promotion->price = (int)$inputs['price'];

		try {

			$promotion->save();

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Promotion $promotion->title Updated successfully"));

	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $ids
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($ids)
	{        
		$keys = explode(",", $ids);
		
		try {

			$promotions = Promotion::whereIn('_id', $keys)->delete();

		} catch(\Illuminate\Database\QueryException $e){

			return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

		}

		return response(array($promotions,"success"=>true,"message"=>"Record(s) Removed Successfully"));
	}

	/**
	 * List all the resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request	 
	 * @return \Illuminate\Http\Response
	 */

	public function postListing(Request $request)
	{
		
		$params = $request->all();

        extract($params);

        $columns = ['_id','_id','smallTitle','price','noOfProducts','status'];

        $project = ['title'=>1,'price'=>1,'status'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $project['noOfProducts'] = ['$size'=>'$items'];

        $query = [];
        
        $query[]['$project'] = $project;

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = Promotion::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Promotion::raw()->aggregate($query);
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
