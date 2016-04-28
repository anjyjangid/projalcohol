<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

class Packages extends Model
{
    protected $primaryKey = "_id";
    protected $collection = 'packages';

    protected $fillable = [
		'type',
		'title',
        'subTitle',
        'description',
        'image',
        'products',
        'video',
        'recipe',
        'packageItems'        
    ];

    public function productlist()
    {        
        return $this->belongsToMany('AlcoholDelivery\Products', null, 'packages', 'products');
    }
}
