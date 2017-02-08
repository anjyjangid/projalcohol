<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class ProductGroups extends Eloquent
{
    protected $primaryKey = "_id";
	protected $collection = 'productgroups';

	protected $fillable = [
		'name',
        'tradeQuantity',
        'tradeValue',
        'cartonQuantity',
        'cartonPurchased',
        'minOrder',
	];	
}
