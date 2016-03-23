<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Products extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'products';

    protected $fillable = [
    		'name',
            'description',
            'shortDescription',
            'categories',
            'sku',
            'price',
            'discountPrice',
            'chilled',
            'status',
            'metaTitle',
            'metaKeywords',
            'metaDescription',
            'images',
            'isFeatured'
            
    ];

    public function pcategories()
    {        
        //return $this->belongsToMany('AlcoholDelivery\Categories', null, 'products', 'categories');
    }

    public function getSingleProduct($id)
    {
        return Products::where('_id', $id)->first();       
    }
}
