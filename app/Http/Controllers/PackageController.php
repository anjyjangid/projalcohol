<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Packages;
use AlcoholDelivery\Setting;
use AlcoholDelivery\Categories;
use AlcoholDelivery\Http\Controllers\Controller;

class PackageController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		//
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
	public function update(Request $request, $id)
	{
		//
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

	public function getPackages(Request $request,$type){
		
		$ptype = ($type == 'party')?1:2;
		
		$packages = new Packages;

		$packages = $packages->with('productlist')->where('status',1)->where('type',$ptype)->orderBy('created_at','desc')->get();

		if($packages){
			
			$settingObj = new Setting;
			
			$global = $settingObj->getSettings(array(
			  "key"=>'pricing',
			  "multiple"=>false
			));

			foreach ($packages as $key => $package) {
				$package->packageQuantity = 1;  
				$packageItems = $package['packageItems'];
				$packageupdate = [];
				$packagePrice = $productOrgPrice = 0;
				
				foreach ($packageItems as $pkgkey => $pkgvalue) {

				$packageupdate[$pkgkey] = $pkgvalue;
				$pkgpro = [];
				$minprice = [];
				$quantity = 1;                  
				if($ptype == 1){
					$quantity = (int)$pkgvalue['quantity'];
				}

				$isDefaultSet = false;
				foreach ($pkgvalue['products'] as $prokey => $provalue) {

					$tier = $global->settings['regular_express_delivery'];

					$value = $this->getProductById($provalue['_id'], $package['productlist']);     

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
					
					$sprice = $this->calculatePrice($value['price'],$tier);

					$pkgpro[$prokey] = [
						'_id' => $provalue['_id'],
						'cprice' => $provalue['cprice'],
						'name' => $value['name'],
						'sprice' => $sprice,
						'imageFiles' => $value['imageFiles'],
						'cartquantity' => 0,
						'customizequantity' => 0
					];
					$minprice[$prokey] = $provalue['cprice'];

					if(isset($provalue['default']) && isset($provalue['defaultQty']) && $provalue['defaultQty']>0){
						$pkgpro[$prokey]['cartquantity'] = (int)$provalue['defaultQty'];
						$pkgpro[$prokey]['customizequantity'] = (int)$provalue['defaultQty'];
						$isDefaultSet = true;
					}

				}

				if($isDefaultSet===false){

					$minDiscountPrice = min($minprice);
					$minPriceKey = array_search($minDiscountPrice, $minprice);

					$pkgpro[$minPriceKey]['cartquantity'] = (int)$quantity;
					$pkgpro[$minPriceKey]['customizequantity'] = (int)$quantity;

				}

				$packageupdate[$pkgkey]['selectedProducts'] = '';

				foreach ($pkgpro as $key => $currPro) {

					if($currPro['cartquantity']==0){continue;}

					$quantity = $currPro['cartquantity'];
					
					$productOrgPrice += ($currPro['sprice']*$quantity);
					$packagePrice += ($currPro['cprice']*$quantity);
					
					$packageupdate[$pkgkey]['selectedProducts'].= $quantity.' x '.$currPro['name'];

				}

				$packageupdate[$pkgkey]['products'] = $pkgpro;

			}
			
			$package->packageSavings = $productOrgPrice - $packagePrice;
			$package->packagePrice = $packagePrice;
			$package->packageQuantity = 1;
			$package->packageItems = $packageupdate;
			
			}
		}
		return response($packages,200);
	}

	public function getPackagedetail(Request $request,$type,$id){
		
		$ptype = ($type == 'party')?1:2;
		
		$package = new Packages;

		$package = $package->with('productlist')->where('status',1)->where('_id',$id)->where('type',$ptype)->first();
		
		if($package){
			
			$settingObj = new Setting;
			
			$global = $settingObj->getSettings(array(
			  "key"=>'pricing',
			  "multiple"=>false
			));

				
			$packageItems = $package['packageItems'];
			$packageupdate = [];
			$packagePrice = $productOrgPrice = 0;
			
			foreach ($packageItems as $pkgkey => $pkgvalue) {

				$packageupdate[$pkgkey] = $pkgvalue;
				$pkgpro = [];
				$minprice = [];
				$quantity = 1;                  
				if($ptype == 1){
					$quantity = (int)$pkgvalue['quantity'];
				}

				$isDefaultSet = false;
				foreach ($pkgvalue['products'] as $prokey => $provalue) {

					$tier = $global->settings['regular_express_delivery'];

					$value = $this->getProductById($provalue['_id'], $package['productlist']);     

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
					
					$sprice = $this->calculatePrice($value['price'],$tier);

					$pkgpro[$prokey] = [
						'_id' => $provalue['_id'],
						'cprice' => $provalue['cprice'],
						'name' => $value['name'],
						'sprice' => $sprice,
						'imageFiles' => $value['imageFiles'],
						'cartquantity' => 0,
						'customizequantity' => 0
					];
					$minprice[$prokey] = $provalue['cprice'];

					if(isset($provalue['default']) && isset($provalue['defaultQty']) && $provalue['defaultQty']>0){
						$pkgpro[$prokey]['cartquantity'] = (int)$provalue['defaultQty'];
						$pkgpro[$prokey]['customizequantity'] = (int)$provalue['defaultQty'];
						$isDefaultSet = true;
					}

				}

				if($isDefaultSet===false){

					$minDiscountPrice = min($minprice);
					$minPriceKey = array_search($minDiscountPrice, $minprice);

					$pkgpro[$minPriceKey]['cartquantity'] = (int)$quantity;
					$pkgpro[$minPriceKey]['customizequantity'] = (int)$quantity;

				}

				$packageupdate[$pkgkey]['selectedProducts'] = '';

				foreach ($pkgpro as $key => $currPro) {

					if($currPro['cartquantity']==0){continue;}

					$quantity = $currPro['cartquantity'];
					
					$productOrgPrice += ($currPro['sprice']*$quantity);
					$packagePrice += ($currPro['cprice']*$quantity);
					
					$packageupdate[$pkgkey]['selectedProducts'].= $quantity.' x '.$currPro['name'];

				}

				$packageupdate[$pkgkey]['products'] = $pkgpro;

			}
			
			$package->packageSavings = $productOrgPrice - $packagePrice;
			$package->packagePrice = $packagePrice;
			$package->packageQuantity = 1;
			$package->packageItems = $packageupdate;
			
			return response($package,200);
		}else{
			return response('No package found',404);
		}
		
	}

	protected function calculatePrice($cost = 0, $tiers){
	  if($tiers['type'] == 1){
		$p = $cost+($cost/100*$tiers['value']);
	  }else{
		$p = $cost+$tiers['value'];
	  }      
	  return round($p,2);
	}

	protected function getProductById($id, $parray){
		$return = [];
		foreach ($parray as $key => $value) {
			if($value['_id'] == $id){
				$return = $value;
				break;
			}
		}
		return $return;
	}

	
}
