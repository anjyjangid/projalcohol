<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Admin;

class Stocks extends Eloquent
{
    protected $primaryKey = "_id";
	protected $collection = 'stocks';

	protected $fillable = [
		'quantity',
		'threshold',
		'maxQuantity',
		'storeId',
		'storeObjId',
		'defaultDealerId',
		'defaultDealerObjId',
		'productObjId',
		'productId',
	];

	protected $hidden = [
		'storeId',
		'storeObjId',		
		'defaultDealerObjId',
		'productObjId',
		'productId',
	];

	/*function upsert($data,$productId){
		
		$userId = Auth::user('admin')->id;

		$currentUser = Admin::find($userId);

		//CHECK FOR EXISTING
		$inventory = Inventory::find();

	}*/
}
