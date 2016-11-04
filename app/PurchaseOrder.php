<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Admin;


class PurchaseOrder extends Eloquent
{
    protected $primaryKey = "_id";
	protected $collection = 'purchase_order';

	protected $fillable = [
        'supplier',
        'store',
        'products',
		'status',
	];

	protected $hidden = [
	];
}
