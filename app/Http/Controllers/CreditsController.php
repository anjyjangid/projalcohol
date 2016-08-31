<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\Credits as Credits;


class CreditsController extends Controller
{

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->user = Auth::user('user');

		$this->creditsModel = new Credits;
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */

	public function index(Request $request)
	{

		$params = $request->all();

		$credits = $this->creditsModel->getCredits($this->user->_id,$params);

		return response($credits,200);

	}

	//
	// Function to get credits points statics for a user credits points
	//	return total points , last earned point
	//
	public function getStatics(){

		return $this->creditsModel->getCreditsStatics($this->user->_id);

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
	public function update(Request $request, $type)
	{
		$params = $request->all();
		$params['for'] = $type;
		
		switch($type){

			case 'sharing':
				
				$isSet = $this->creditsModel->setUserCredits($this->user->_id,$params);

				if($isSet->success){

					return response(['message'=>"Credits points credit to account"],200);

				}

				return response(['message'=>$isSet->message],400);
				
			break;

		}
		
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
}
