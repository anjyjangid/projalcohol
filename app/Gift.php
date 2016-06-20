<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

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
        'coverImage',
        'limit',
        'range',        
        'status'        
    ];
}
