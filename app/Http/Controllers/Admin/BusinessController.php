<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\BusinessRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;
use MongoId;

use AlcoholDelivery\Business as Business;

class BusinessController extends Controller
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
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function postStore(BusinessRequest $request)
	{
		$businessObj = new Business;
		$inputs = $request->all();

		$inputs['status'] = (int)$inputs['status'];

		try {
			$business = Business::create($inputs);			
		
		} catch(\Exception $e){
			
			return response(array("success"=>false,"message"=>$e->getMessage()));
				
		}
		
		return response(array("success"=>true,"message"=>"Business created successfully"));
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	**/
	public function postUpdate(BusinessRequest $request, $id)
	{
		$inputs = $request->all();

		$business = business::find($id);

		$business->company_name = $inputs['company_name'];
		$business->company_email = $inputs['company_email'];
		$business->delivery_address = $inputs['delivery_address'];	
		$business->billing_address = $inputs['billing_address'];				

		for ($i=0; $i<count($inputs['products']); $i++) {
			$inputs['products'][$i]['_id'] = new MongoId($inputs['products'][$i]['_id']);
		}

		$business->products = $inputs['products'];
		$business->status = (int)$inputs['status'];    

		if($business->save()){
			return response(array("success"=>true,"message"=>"Business updated successfully"));
		}
		
		return response(array("success"=>false,"message"=>"Something went worng"));
		
	}


	public function getDetail($businessId)
	{
		// $businessObj = new Business;

		// $result = $businessObj->getBusiness(array(
		// 				"key"=>$businessId,
		// 				"multiple"=>false
		// 			));

		$result = Business::raw()->aggregate([
			[
				'$match' => [
					'_id' => new MongoId($businessId)
				]
			],
			[
				'$unwind' => [
					'path' => '$products'
				]
			],
			[
				'$lookup' => [
					'from' => 'products',
					'localField' => 'products._id',
					'foreignField' => '_id',
					'as' => 'productDetails',
				]
			],
			[
				'$unwind' => [
					'path' => '$productDetails'
				]
			],
			[
				'$project' => [
					'company_name' => 1,
					'delivery_address' => 1,
					'billing_address' => 1,
					'company_email' => 1,
					'products' => [
						'_id' => '$productDetails._id',
						'categories' => '$productDetails.categories',
						'name' => '$productDetails.name',
						'sprice' => '$productDetails.price',
						'imageFiles' => '$productDetails.imageFiles',
						'cprice' => '$products.price'
					]
				]
			],
			[
				'$group' => [
					'_id' => [
						'company_name' => '$company_name',
						'delivery_address' => '$delivery_address',
						'billing_address' => '$billing_address',
						'company_email' => '$company_email',
					],
					'products' => [
						'$push' => '$products'
					]
				]
			]
		]);

		if(!empty($result['result'])){
			$result['result'][0]['_id']['products'] = $result['result'][0]['products'];
			$result = $result['result'][0]['_id'];

			for ($i=0 ; $i<count($result['products']) ; $i++) {
				$result['products'][$i]['_id'] = (string)$result['products'][$i]['_id'];
			}
		}
		
		return response($result, 201);
	}


	public function postList(Request $request)
	{
		$params = $request->all();

        extract($params);

        $columns = ['_id','smallTitle','status'];

        $project = ['company_name'=>1,'status'=>1];

        $query = [];        
        
        $project['smallTitle'] = ['$toLower' => '$company_name'];
        
        $query[]['$project'] = $project;

        if(isset($company_name) && trim($company_name)!=''){
            $s = "/".$company_name."/i";
            $query[]['$match']['company_name'] = ['$regex'=>new \MongoRegex($s)];
        }

        if(isset($status) && trim($status)!=''){            
            $query[]['$match']['status'] = (int)$status;
        }        

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = Business::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Business::raw()->aggregate($query);
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
