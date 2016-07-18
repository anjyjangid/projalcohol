<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use DateTime;
use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Setting as Setting;


class CategoryController extends Controller
{
	/***************************************
	 * Display a listing of the resource.
	 * 
	 * @return \Illuminate\Http\Response
	***************************************/

	public function getPricing(Request $request){

		$params = $request->all();
		$categories = Categories::where("cat_status","=",1)->orderBy('created_at', 'asc')->get(['_id', 'ancestors','express_delivery_bulk','regular_express_delivery']);

		//Fetch Global Pricing
		$globalPricing = Setting::where("_id",'=',"pricing")
									->first([
										'settings.express_delivery_bulk',
										'settings.regular_express_delivery',
									]);

		$globalPricing = $globalPricing->settings;

		///////////////////////
		//conver categories object to array so can use for further processing
		$categories = $categories->toArray();
		///////////////////////
		

		////////////////////////
		//Set _id as array key//
		////////////////////////
		$categories = array_combine(array_column($categories, '_id'),$categories);
				
		foreach($categories as &$category){

			if(isset($category['ancestors'])){

				$anceskey = (string)$category['ancestors'][0]['_id'];

				if(isset($categories[$anceskey])){
					$parentCat = $categories[$anceskey];
					$category = array_merge($globalPricing,$parentCat,$category);
				}

			}else{
				$category = array_merge($globalPricing,$category);
			}
		}

		return response($categories,200);	

	}

	


}
