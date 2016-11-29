<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\GiftCategory;
use AlcoholDelivery\Gift;

class GiftCategoryController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		$model = new GiftCategory;
		$list = $model->where(['status'=>0,'parent'=>null])->get();

		if($list)
			return response($list,200);
		else
			return response(['No record found.'],404);
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
		//
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
	public function update(Request $request, $id)
	{
		//
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

	public function getListproducts(Request $request){
		
		$params = $request->all();

		extract($params);

		$model = new GiftCategory;

		$itemsModel = new Gift;

		$totalItem = 0;

		$condition = ['status'=>0];

		if(isset($category)){
			$model = $model->with('child')->where(['slug'=>$category,'status'=>0,'type'=>'category','parent'=>null])->first();
			
			if($model)
				$condition['category'] = $model->_id;
		}  

		if(isset($subcategory)){
		   $submodel = GiftCategory::where(['slug'=>$subcategory,'status'=>0,'type'=>'category','parent'=>$model->_id])->first(); 
		   if($submodel)
				$condition['subcategory'] = $submodel->_id;
		}

		if($model->_id){
			$itemsModel = $itemsModel->where($condition);
			$totalItem = $itemsModel->count();
			$itemsModel = $itemsModel->skip($skip)->take($take)->get(['_id','title','coverImage']);                
		}     

		$response = [
			'items' => $itemsModel,
			'categoryData' => $model,
			'total' => $totalItem,
		];

		return response($response,200);
	}

	public function getGiftcard(Request $request){

		$data = $request->all();

		$model = GiftCategory::where('type','!=','category')->first();

		return response($model,200);         

	}

	public function getCategorydetail(Request $request){

		$data = $request->all();

		$model = GiftCategory::with('child')->where(['slug'=>$data['category'],'type'=>'category','parent'=>null])->first();

		return response($model,200);            

	}
}
