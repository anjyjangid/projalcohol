<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\BusinessRequest;
use AlcoholDelivery\Http\Requests\BusinessAddrRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;
use MongoId;

use AlcoholDelivery\Setting;
use AlcoholDelivery\Categories;
use AlcoholDelivery\Sale;

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

	public function getAutocomplete($col, Request $request)
	{
		// prd("hi");
		$params = $request->all();
		$users = new Business;

		$columns = ['company_name','company_email'];

		if(isset($params['q']) && !empty(trim($params['q']))) {
			$users = $users->where($col,'regexp', "/.*".$params['q']."/i");
			return response($users->get($columns));
		}
	
		return response([]);
	}

	public function postAddress(BusinessAddrRequest $request, $id)
	{
		$inputs = $request->all();

		$business = Business::find($id);

		$business->push('address',$inputs,true);

		return response($business);
	}

	public function getAddresses($id) {
		$business = new Business;

		$business = $business->where('_id', $id)->first(['address']);

		return response($business);
	}

	public function postSave(BusinessRequest $request)
	{
		$inputs = $request->all();

		if(!empty($inputs['_id']))
			return $this->postUpdate($request, $inputs['_id']);
		else
			return $this->postStore($request);
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

		prd($inputs);

		$inputs['status'] = (int)$inputs['status'];

		try {
			dd($inputs);
			$business = Business::create($inputs);
		
		} catch(\Exception $e){
			
			return response(array("success"=>false,"message"=>$e->getMessage()));
				
		}
		
		return response(array("success"=>true,"message"=>"Business created successfully", '_id' => $business->_id));
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

		if(!empty($inputs['delivery_address']))
			$business->delivery_address = $inputs['delivery_address'];	
		if(!empty($inputs['billing_address']))
			$business->billing_address = $inputs['billing_address'];				

		for ($i=0; $i<count(@$inputs['products']); $i++) {
			$inputs['products'][$i]['_id'] = new MongoId($inputs['products'][$i]['_id']);
		}

		if(!empty($inputs['products']))
			$business->products = $inputs['products'];
		if(isset($inputs['status']))
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
					'path' => '$products',
					'preserveNullAndEmptyArrays' => true
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
					'path' => '$productDetails',
					'preserveNullAndEmptyArrays' => true
				]
			],
			[
				'$project' => [
					'company_name' => 1,
					'delivery_address' => 1,
					'billing_address' => 1,
					'company_email' => 1,
					'status' => 1,
					'products' => [
						'_id' => '$productDetails._id',
						'categories' => '$productDetails.categories',
						'name' => '$productDetails.name',
						'price' => '$productDetails.price',
						'regular_express_delivery' => '$productDetails.regular_express_delivery',
						'imageFiles' => '$productDetails.imageFiles',
						'disc' => '$products.disc',
						'type' => '$products.type'
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
						'status' => '$status'
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


      $settingObj = new Setting;

      $global = $settingObj->getSettings(array(
                  "key"=>'pricing',
                  "multiple"=>false
                ));

		foreach($result['products'] as $key => $value) {
		  $tier = $global->settings['regular_express_delivery'];
			// dd($value);
		  if(isset($value['regular_express_delivery']) && !empty($value['regular_express_delivery'])){
		    $tier = $value['regular_express_delivery'];          
		  }else{
		    $categories = Categories::whereIn('_id',$value['categories'])->get();
		    if($categories){
		      foreach ($categories as $ckey => $cvalue) {
		        if(isset($cvalue['regular_express_delivery']) && !empty($cvalue['regular_express_delivery'])){
		          $tier = $cvalue['regular_express_delivery'];                
		        }
		      }
		    }
		  }
		  $result['products'][$key]['sale'] = Sale::raw()->findOne(['type'=>1,'saleProductId'=>['$eq'=>$value['_id']]]);
		  $result['products'][$key]['sprice'] = $this->calculatePrice($value['price'],$tier);                        
		}
		
		return response($result, 201);
	}

    protected function calculatePrice($cost = 0, $tiers){
      if($tiers['type'] == 1){
        $p = $cost+($cost/100*$tiers['value']);
      }else{
        $p = $cost+$tiers['value'];
      }      
      return round($p,2);
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
