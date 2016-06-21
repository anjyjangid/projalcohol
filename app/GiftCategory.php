<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class GiftCategory extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'giftcategories';

    protected $fillable = [
		'title',
        'parent',
        'slug',
        'status'        
    ];
}
