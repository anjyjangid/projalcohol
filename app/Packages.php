<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Packages extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'packages';

    protected $fillable = [
		'type',
		'title',
        'subTitle',
        'description',
        'coverImage',
        'products',
        'video',
        'recipe',
        'packageItems',
        'status'        
    ];

    public function productlist()
    {        
        return $this->belongsToMany('AlcoholDelivery\Products', null, 'packages', 'products');
    }
}
