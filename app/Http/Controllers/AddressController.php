<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Http\Requests\UserAddressRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use DateTime;
use AlcoholDelivery\User as User;

class AddressController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		$loggeduser = Auth::user('user');

		if(!$loggeduser){
			return response(array("auth"=>false,"message"=>"Login required"),400);
		}

		$user = User::find($loggeduser->_id);

		$userAddress = $user->address;

		return response($userAddress,200);
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
	public function store(UserAddressRequest $request, $id='')
	{
		$inputs = $request->all();

		if(isset($inputs['LAT']) && isset($inputs['LNG'])){
			$inputs['LAT'] = (float)$inputs['LAT'];
			$inputs['LNG'] = (float)$inputs['LNG'];

			$inputs['location'] = [$inputs['LNG'],$inputs['LAT']];
		}

		if(isset($inputs['X']) && isset($inputs['Y'])){
			$inputs['X'] = (float)$inputs['X'];
			$inputs['Y'] = (float)$inputs['Y'];
		}

		$admin = Auth::user('admin');
		if(!empty($admin) && !empty($id)) {
			$user = User::find($id);
		}
		else {
			$loggeduser = Auth::user('user');
			$user = User::find($loggeduser->_id);
		}

		$user->push('address',$inputs,true);

		return response($user);		

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
	public function update(UserAddressRequest $request, $id)
	{
		$inputs = $request->all();


		$loggeduser = Auth::user('user');

		$user = User::find($loggeduser->_id);

		$address = $user->__get("address");

		$inputs['updated_at'] = new DateTime();

		if(isset($inputs['place'])){
			
			unset($inputs['place']);

		}

		$address[$id] = $inputs;

		$user->__set("address",$address);        

		$return = array("success"=>false,"message"=>"","data"=>""); 

		try {

			$user->save();

			$return['success'] = true;
			$return['message'] = "Address updated successfully";
						
		} catch(\Exception $e){
			$return['message'] = $e->getMessage();//$e->getMessage();
		}

		return response($return);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id)
	{

		$loggeduser = Auth::user('user');

		$user = User::find($loggeduser->_id);

		$address = $user->__get("address");
		
		$addressToPull = (array)$address[$id];

		//unset($address[$id]);

		$user->pull("address",$addressToPull);		

		//$user->__set("address",$address);

		$return = array("success"=>false,"message"=>"","data"=>""); 

		try {

			$user->save();

			$return['success'] = true;
			$return['message'] = "Address successfully removed";
						
		} catch(\Exception $e){
			$return['message'] = $e->getMessage();//$e->getMessage();
		}

		return response($return);

	}
}
