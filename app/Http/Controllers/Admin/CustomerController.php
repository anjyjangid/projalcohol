<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\CustomerRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;

use AlcoholDelivery\User as User;
use AlcoholDelivery\Email as Email;

class CustomerController extends Controller
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
	public function index(Request $request)
	{
		$params = $request->all();
		$users = new User;

		if(isset($params['name']) && trim($params['name'])!=''){
		  $pname = $params['name'];
		  $users = $users->where('name','regexp', "/.*$pname/i");
		}

		if(isset($params['mobile_number']) && trim($params['mobile_number'])!=''){
			$pmobile_number = $params['mobile_number'];
			$users = $users->where('mobile_number','regexp',"/.*$pmobile_number/i");
		}

		$columns = ['name','email','status','_id','mobile_number'];
		
		$users = $users->orderBy('name','desc')->get();

		return response($users);
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
	public function postStore(CustomerRequest $request)
	{
		$inputs = $request->all();

		try {

			$user = User::create([

				'name' => $inputs['name'],
				'mobile_number' => $inputs['mobile_number'],
				'email' => $inputs['email'],
				'password' => bcrypt($inputs['password']),
				'status' => 1,
				'verified' => 1,

			]);
		
		} catch(\Exception $e){
			
			return response(array("success"=>false,"message"=>$e->getMessage()));
				
		}

		$email = new Email('login');
		$email->sendEmail($inputs);
		
		return response(array("success"=>true,"message"=>"Customer created successfully"));
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
	public function postUpdate(CustomerRequest $request, $id)
	{
		$inputs = $request->all();

		$customer = user::find($id);
		
		$customer->name = $inputs['name'];
		$customer->email = $inputs['email'];
		//$customer->password = bcrypt($inputs['password']);
		$customer->status = (int)$inputs['status'];    
		$customer->mobile_number = $inputs['mobile_number'];
		
		if($customer->save()){
			return response(array("success"=>true,"message"=>"Customer updated successfully"));
		}
		
		return response(array("success"=>false,"message"=>"Something went worng"));
		
	}


	public function getDetail($customerId)
	{
		$customerObj = new User;

		$result = $customerObj->getCustomers(array(
						"key"=>$customerId,
						"multiple"=>false
					));
		
		return response($result, 201);
	}


	public function postList(Request $request)
	{
		$params = $request->all();
		$users = new User;

		if(isset($params['name']) && trim($params['name'])!=''){
		  $pname = $params['name'];
		  $users = $users->where('name','regexp', "/.*$pname/i");
		}

		if(isset($params['email']) && trim($params['email'])!=''){
			$pemail = $params['email'];
			$users = $users->where('email','regexp',"/.*$pemail/i");
		}

		if(isset($params['status']) && trim($params['status'])!=''){
		  $users = $users->where('status',(int)$params['status']);
		}


		$iTotalRecords = $users->count();
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


		$columns = ['name','email','status','_id'];

		//prd($params);
		if ( isset( $params['order'] ) ){
			foreach($params['order'] as $orderKey=>$orderField){
				if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
					$notordered = false;                    
					$users = $users->orderBy($columns[$orderField['column']],$orderField['dir']);                    
				}
			}
		}

		//prd($users);
		
		if($notordered){
		  $users = $users->orderBy('_id','desc');
		}

		$users = $users->skip($iDisplayStart)        
		->take($iDisplayLength)->get();

		$ids = $iDisplayStart;
		
		/*foreach($users as $i => $user) 
		{
			$records["data"][] = array(
			  "name" => $user->name,
			  "email" => $user->email,
			  "status" => $user->status,
			  "_id" => $user->_id,
			);
		}*/

		$records["data"] = $users;

		$records["draw"] = $sEcho;
		$records["recordsTotal"] = $iTotalRecords;
		$records["recordsFiltered"] = $iTotalRecords; 

		return response($records);
	}
	

}
