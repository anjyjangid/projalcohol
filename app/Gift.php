<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use AlcoholDelivery\Setting as Setting;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Gift extends Eloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'gift';

	protected $fillable = [
		'type',
		'title',
		'subTitle',
		'description',
		'category',
		'subcategory',
		'coverImage',
		'limit',     
		'costprice',
		'gift_packaging',     
		'metaTitle',
        'metaKeywords',
        'metaDescription',
		'status'        
	];

	public function categorydetail(){
		return $this->belongsTo('AlcoholDelivery\GiftCategory','category','_id');
	}

	public function subcategorydetail(){
		return $this->belongsTo('AlcoholDelivery\GiftCategory','subcategory','_id');
	}

	public function getGift($id){

		$gift = $this->with('categorydetail','subcategorydetail')->find($id);

		$gift->price = $this->calculatePrice($gift);

		unset($gift->costprice);

		return $gift;

	}

	private function calculatePrice($giftData){

		$tiers = [];

		$cost = $giftData->costprice;

		if($giftData->gift_packaging){
			$tiers = $giftData->gift_packaging;
		}elseif($giftData->subcategorydetail->gift_packaging){
			$tiers = $giftData->subcategorydetail->gift_packaging;
		}elseif($giftData->categorydetail->gift_packaging){
			$tiers = $giftData->categorydetail->gift_packaging;
		}else{
			$settingObj = new Setting;            
			$globalsetting = $settingObj->getSettings(array(
			  "key"=>'pricing',
			  "multiple"=>false
			));

			if($globalsetting)
				$tiers = $globalsetting->gift_packaging;
		}
		if($tiers['type'] == 1){
			$p = $cost+($cost/100*$tiers['value']);
		}else{
			$p = $cost+$tiers['value'];
		}      

		return round($p,2);        
	
	}
	
}
