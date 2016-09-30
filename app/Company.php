<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Company extends Eloquent
{
    protected $collection = 'company';

	protected $fillable = [
		'logoImage',
		'title',
		'address',
		'city',
		'state',
		'zip',
		'country',
		'status',
		'invoiceTemplate'		
	];
}
