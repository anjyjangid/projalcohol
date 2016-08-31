<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use DB;
use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Testimonial as Testimonial;
use AlcoholDelivery\Brand as Brand;
use AlcoholDelivery\Cms as Cms;
use AlcoholDelivery\Promotion as Promotion;

class SuperController extends Controller
{    
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getCategory(Request $request)
	{
		$params = $request->all();

		$categories = new Categories;

		if(isset($params['category']) && $params['category']!=""){
			$categories = $categories->where('slug', "=", $params['category']);
		}

		$categories = $categories->where('cat_status',1);

		$categories = $categories->get();

		if(isset($params['withChild']) && $params['withChild']){

			foreach($categories as &$category){
				$category['children'] = array();
				$category['children'] = Categories::where('cat_status',1)->where('ancestors.0._id','=',$category['_id'])->get(array('_id','slug','cat_title','metaTitle','metaDescription','metaKeywords'));
			}

		}	
		
		
		if(isset($params['withCount']) && $params['withCount']){

			// db.products.aggregate([{$group:{_id:"$categories",count:{$sum:1}}}])

			$products = DB::collection('products')->raw(function($collection){

				return $collection->aggregate(array(
					array(
						'$match' => array(
							'status' => 1
						)
					),
					array(
						'$group' => array(
							'_id'=>'$categories',
							'count' => array(
								'$sum' => 1
							)
						)
					)
				));
			});

			$processedPro = [];
			foreach($products['result'] as $product){

				$cat = array_pop($product['_id']);

				$processedPro[$cat] = $product['count'];

			}

			foreach($categories as &$category){

				$category['productCount'] = isset($processedPro[$category['_id']])?$processedPro[$category['_id']]:0;

			}

		}

		return response($categories);
	}


	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getTestimonial(Request $request)
	{
		$params = $request->all();

		$testimonials = Testimonial::where('status', '=', 1)->take(10)->get();
		
		return response($testimonials);
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getBrand(Request $request)
	{
		$params = $request->all();

		$brands = Brand::where('status', '=', 1)->get();
		
		return response($brands);
	}


	
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getSettings(Request $request)
	{        
		$settings = DB::collection('settings')->whereIn("_id",['general','social','loyalty'])->get();
		
		$settingsData = array();

		foreach($settings as $setting){        

			foreach($setting['settings'] as $subKey=>$subSetting){

				$settingsData[$setting['_id']][$subKey] = $subSetting['value'];
				
			}
		}

		$today = strtotime(date('Y-m-d'))*1000;

		$holidays = DB::collection('holidays')->where('timeStamp','>',$today)->orWhere('_id','weekdayoff')
		->get(['_id','dow','timeStamp']);

		$pages = DB::collection('pages')->where('status',1)
		->get(['linkTitle','section','slug']);

		$settingsData['holiDays'] = $holidays;
		$settingsData['today'] = $today;
		$settingsData['pages'] = $pages;

		return response($settingsData);
	}


	public function getCmsdata(Request $request,$slug)
	{
		$params = $request->all();

		$cms = new Cms;

		/*if(isset($params['cmsid']) && $params['cmsid']!=""){
			$cms = $cms->where('_id', "=", $params['cmsid']);
		}*/

		$cms = $cms->where('slug',$slug)->where('status',1)->first();
		
		return response($cms,200);

		/*if(!empty($cms))
		{
			$cms->title = ucwords($cms->title);
			return response($cms);
		}
		else 
			return response(array());*/
	}


	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getPromotions()
	{	

		$promotion = new promotion;	

		$promotions = $promotion->getAllPromotions();
	
		return response($promotions);
	}

}
