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
	public function edit($id)
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

		$promotion->status = (int)$inputs['status'];
		$promotion->count = count($inputs['items']);
		$promotion->items = $inputs['items'];
		$promotion->products = $inputs['products'];
		
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
	 * @param  int  $id
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

	public function postListing(Request $request,$id = false)
	{
		$params = $request->all();

		$promotions = new Promotion;                

		$columns = array('_id','title',"price","status",'count');
		$indexColumn = '_id';
		$table = 'promotions';

		/* Individual column filtering */    

		foreach($columns as $fieldKey=>$fieldTitle)
		{              

			if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
			{
							
				if($fieldTitle=="status"){

					$promotions = $promotions->where($fieldTitle, '=', (int)$params[$fieldTitle]);
				}
				else{

					$promotions = $promotions->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");

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
					
					$promotions = $promotions->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
					
				}
			}

		}
		
		/* Data set length after filtering */        

		$iFilteredTotal = $promotions->count();

		/*
		 * Paging
		 */
		if ( isset( $params['start'] ) && $params['length'] != '-1' )
		{
			$promotions = $promotions->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
		}

		$iTotal = $promotions->count();

		$promotions = $promotions->get($columns);

		$promotions = $promotions->toArray();
				
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
		if($params['order'][0]['column']==1 && $params['order'][0]['dir']=='desc'){
			$srStart = intval($iTotal);
		}

		$i = 1;

		foreach($promotions as $key=>$value) {

			$row=array();

			$row[] = '<input type="checkbox" name="id[]" value="'.$value['_id'].'">';

			if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
				$row[] = $srStart--;//$row1[$aColumns[0]];
			}else{
				$row[] = ++$srStart;//$row1[$aColumns[0]];
			}

			$status = $status_list[(int)$value['status']];

			$row[] = ucfirst($value['title']);

			$row[] = $value['price'];

			$row[] = (int)$value['count'];
			
			$row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="promotions" data-status="'.((int)$value['status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
			$row[] = '<a title="Edit : '.$value['title'].'" href="#/promotion/edit/'.$value['_id'].'" href="#/promotion/show/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
			
			$records['data'][] = $row;
		}
		
		return response($records, 201);
		
	}


}
