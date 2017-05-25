<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Http\Requests\UserAddressRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use DateTime;
use AlcoholDelivery\User;
use mongoId;

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
	public function store(UserAddressRequest $request, $id=''){
		$inputs = $request->all();

		if(isset($inputs['LATITUDE']) && isset($inputs['LONGITUDE'])){
			$inputs['LAT'] = (float)$inputs['LATITUDE'];
			$inputs['LNG'] = (float)$inputs['LONGITUDE'];
			unset($inputs['LATITUDE']);
			unset($inputs['LONGITUDE']);
			unset($inputs['LONGTITUDE']);
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

		/*if(!isset($inputs['house']) || (isset($inputs['house']) && $inputs['house']=='')){
			$this->filterStreet($inputs);
		}*/

		if(isset($inputs['BUILDING']) && $inputs['BUILDING']!=''){
			$inputs['CATEGORY'] = 'Building';
			$inputs['BLDG_NAME'] = $inputs['BUILDING'];
			unset($inputs['BUILDING']);
		}

		if(isset($inputs['POSTAL']) && $inputs['POSTAL']!=''){			
			$inputs['PostalCode'] = $inputs['POSTAL'];
			unset($inputs['POSTAL']);
		}

		if(isset($inputs['BLK_NO']) && $inputs['BLK_NO']!=''){			
			$inputs['house'] = $inputs['BLK_NO'];
			unset($inputs['BLK_NO']);
		}

		if(isset($inputs['ROAD_NAME']) && $inputs['ROAD_NAME']!=''){			
			$inputs['HBRN'] = $inputs['ROAD_NAME'];
			unset($inputs['ROAD_NAME']);
		}

		if(isset($inputs['default']) && $inputs['default']===true){

			$address = $user->address;

			foreach ($address as &$value) {
				$value['default'] = false;
			}

			$user->__set('address',$address);

			$user->save();

			$inputs['default'] = true;

		}else{

			$inputs['default'] = false;

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

prd($inputs);
		$loggeduser = Auth::user('user');

		$user = User::find($loggeduser->_id);

		$address = $user->__get("address");

		$inputs['updated_at'] = new DateTime();

		if(isset($inputs['place'])){
			
			unset($inputs['place']);

		}

		if(isset($inputs['default']) && $inputs['default']==true){
			
			foreach ($address as &$value) {
				$value['default'] = false;
			}

			$inputs['default'] = true;

		}else{

			$inputs['default'] = false;

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


	public function updateUserAddress(UserAddressRequest $request, $userId, $addressId)
	{
		$inputs = $request->all();		

		$user = User::find($userId);

		$address = $user->__get("address");

		$inputs['updated_at'] = new DateTime();

		if(isset($inputs['place'])){
			
			unset($inputs['place']);

		}

		if(isset($inputs['default']) && $inputs['default']==true){
			
			foreach ($address as &$value) {
				$value['default'] = false;
			}

			$inputs['default'] = true;

		}else{

			$inputs['default'] = false;

		}

		$address[$addressId] = $inputs;

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

	function filterStreet(&$address){
		$result = '';
		$addresspart = explode(' ', $address['HBRN']);
		if(preg_match('/^[0-9]+$/', $addresspart[0], $street)){			
			$result = $street[0];
		}elseif(preg_match('/[0-9,].*[A-Za-z]/', $addresspart[0], $streetwithalphabet)){		
			$result = $streetwithalphabet[0];			
		}

		if($result!=''){
			unset($addresspart[0]);
			$address['HBRN'] = implode(' ', $addresspart);
			$address['house'] = $result;
		}
	}
}
