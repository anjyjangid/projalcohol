<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\BusinessRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;

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
		$business->delivery_address = $inputs['delivery_address'];	
		$business->billing_address = $inputs['billing_address'];				

		$business->status = (int)$inputs['status'];    

		if($business->save()){
			return response(array("success"=>true,"message"=>"Business updated successfully"));
		}
		
		return response(array("success"=>false,"message"=>"Something went worng"));
		
	}


	public function getDetail($businessId)
	{
		$businessObj = new Business;

		$result = $businessObj->getBusiness(array(
						"key"=>$businessId,
						"multiple"=>false
					));
		
		return response($result, 201);
	}


	public function postList(Request $request)
	{
		$params = $request->all();
		$business = new Business;

		if(isset($params['company_name']) && trim($params['company_name'])!=''){
		  $pname = $params['company_name'];
		  $business = $business->where('company_name','regexp', "/.*$pname/i");
		}

		if(isset($params['status']) && trim($params['status'])!=''){
		  $business = $business->where('status',(int)$params['status']);
		}


		$iTotalRecords = $business->count();
		$iDisplayLength = intval($_REQUEST['length']);
		$iDisplayLength = $iDisplayLength < 0 ? $iTotalRecords : $iDisplayLength; 
		$iDisplayStart = intval($_REQUEST['start']);
		$sEcho = intval($_REQUEST['draw']);
		
		$records = array();
		$records["data"] = array(); 

		$end = $iDisplayStart + $iDisplayLength;
		$end = $end > $iTotalRecords ? $iTotalRecords : $end;

		$fstatus = [['danger'=>'Disabled'],['success'=>'Enabled']];

		$notordered = true;


		$columns = ['_id','company_name','status'];

		if ( isset( $params['order'] ) ){
			foreach($params['order'] as $orderKey=>$orderField){
				if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
					$notordered = false;   
					$business = $business->orderBy($columns[$orderField['column']],$orderField['dir']);                        
				}
			}
		}

		if($notordered){
		  $business = $business->orderBy('_id','desc');
		}

		$business = $business->skip($iDisplayStart)        
		->take($iDisplayLength)->get();

		$ids = $iDisplayStart;

		$records["data"] = $business;

		$records["draw"] = $sEcho;
		$records["recordsTotal"] = $iTotalRecords;
		$records["recordsFiltered"] = $iTotalRecords; 

		return response($records);
	}
	

}
