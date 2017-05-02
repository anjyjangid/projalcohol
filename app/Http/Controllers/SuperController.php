<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use DB;
use AlcoholDelivery\Categories;
use AlcoholDelivery\Testimonial;
use AlcoholDelivery\Brand;
use AlcoholDelivery\Cms;
use AlcoholDelivery\Promotion;
use AlcoholDelivery\Setting;
use AlcoholDelivery\PromotionalBanners;

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

		if(isset($params['onlyParent']) && $params['onlyParent']){
			$categories = $categories->where('ancestors','exists',false);
		}

		$categories = $categories->get();

		if(empty($categories) || !is_object($categories) || empty($categories->toArray())){
			return response([],404);
		}

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
						'$project' => array('categories' => 1)
					),
					array(
						'$unwind' => array(
							'path' => '$categories',
							'preserveNullAndEmptyArrays' => true	
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

				$cat = $product['_id'];

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
	public function getPromotionalbanners(Request $request)
	{
		$params = $request->all();

		$user = Auth::user('user');
		$status = $user?2:1;
		$promotionalbanners = PromotionalBanners::where('status', '!=', $status)->orderBy('displayorder', 'asc')->get();
		
		return response($promotionalbanners);
	}


	
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getSettings(Request $request)
	{        

		$settings = DB::collection('settings')->whereIn("_id",['general','social','loyalty','announcementBar','homeBanner'])->get();
		
		$settingsData = array();
		
		foreach($settings as $key=>$setting){

			if($setting['_id']=="homeBanner" && $setting['settings']['status']!=1){
				unset($settings[$key]);
				continue;
			}

			foreach($setting['settings'] as $subKey=>$subSetting){
				if(isset($subSetting['value'])){
					$settingsData[$setting['_id']][$subKey] = $subSetting['value'];
				}else{
					$settingsData[$setting['_id']][$subKey] = $subSetting;
				}
			}
		}

		$today = strtotime(date('Y-m-d'))*1000;
		$holidays = DB::collection('holidays')
						->where('timeStamp','>',$today)
						->orWhere('_id','weekdayoff')
						->get(['_id','dow','timeStamp']);

		$pages = DB::collection('pages')
					->where('status',1)
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

	public function getCatlist(Request $request){
		
		$params = $request->all();

		$query = [];

		//FILTER ONLY PARENT CATEGORY
		$query[]['$match']['ancestors'] = null;

		//FILTER ONLY ENABLED CATEGORY
		$query[]['$match']['cat_status'] = 1;

		//GET ALL CHILD CATEGORIES
		$query[]['$lookup'] = [
			'from' => 'categories',
			'localField' => '_id',
			'foreignField' => 'ancestors._id',
			'as' => 'child'
		];
		

		$project = [
			'cat_title' => 1,
			'slug' => 1,
			'isMenu' => 1,
			'cat_status' => 1,
			'cat_thumb' => 1,
			'cat_lthumb' => 1,
			'metaTitle' => 1,
			'metaKeywords' => 1,
			'metaDescription' => 1
		];

		//FILTER ONLY ENABLED CHILD CATEGORY
		$project['activeChild'] = [
    		'$filter'=>[
                'input' => '$child',
                'as' => 'child',
                'cond' => ['$eq'=>['$$child.cat_status',1]]
            ]
    	];

    	$query[]['$project'] = $project;

    	//unwind child for getting product in it
    	$query[]['$unwind'] = [
            'path' => '$activeChild',
            'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$lookup'] = [
			'from' => 'products',
			'localField' => 'activeChild._id',
			'foreignField' => 'categoriesObject',
			'as' => 'activeChild.products'
		];

		// $project['activeChild'] = '$activeChild';
		$project['activeChild'] = [
			'_id' => 1,
			'cat_title' => 1,
			'slug' => 1,
			'cat_status' => 1,
			'metaTitle' => 1,
			'metaKeywords' => 1,
			'metaDescription' => 1,
			'products' => ['$size'=>'$activeChild.products']
		];
		$query[]['$project'] = $project;

		$group = [
			'_id' => '$_id',
			'cat_title' => ['$first' => '$cat_title'],
			'slug' => ['$first' => '$slug'],
			'isMenu' => ['$first' => '$isMenu'],
			'cat_status' => ['$first' => '$cat_status'],
			'cat_thumb' => ['$first' => '$cat_thumb'],
			'cat_lthumb' => ['$first' => '$cat_lthumb'],
			'metaTitle' => ['$first' => '$metaTitle'],
			'metaKeywords' => ['$first' => '$metaKeywords'],
			'metaDescription' => ['$first' => '$metaDescription'],
			'activeChild' => ['$push' => '$activeChild']			
		];

		$query[]['$group'] = $group;

		$model = Categories::raw()->aggregate($query);

		return response($model,200);

	}

	public function getServerTime(){

		$working = Setting::where("_id","=","workinghrs")->first(['settings.from','settings.to']);
		
		$currentTime = strtotime("+8 hours");

		$date = date("Y-m-d",time());
		$fromTime = $date." ".((int)($working['settings']['from']/60)).":".((int)$working['settings']['from']%60).":00";

		$toMinute = (int)$working['settings']['to']%60;
		$toMinute = str_pad($toMinute, 2, "0", STR_PAD_LEFT);
		$toTime = $date." ".((int)($working['settings']['to']/60)).":".$toMinute.":00";
		$toTimeString = $date." ".((int)($working['settings']['to']/60)).":".$toMinute.":00";
		
		$setting = [
			'currentTime' => $currentTime,
			'from' => strtotime($fromTime),
			'to' => strtotime($toTime),
			'string' => [
				'from' => date('H:i A',strtotime($fromTime)),
				'to' => date('h:i A',strtotime($toTimeString))
			]
		];

		return $setting;
	}

}
