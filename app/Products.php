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
            'quantity',
            'price',            
            'chilled',
            'status',
            'metaTitle',
            'metaKeywords',
            'metaDescription',
            'images',
            'isFeatured',
            'bulkDisable',
            'advance_order',
            'regular_express_delivery',
            'advance_order_bulk',
            'express_delivery_bulk',
            'loyalty',
            'threshold',
            'maxQuantity',
            'dealers',
            'packages'
    ];

    public function pcategories()
    {        
        //return $this->belongsToMany('AlcoholDelivery\Categories', null, 'products', 'categories');
    }

    public function supplier()
    {        
        return $this->belongsToMany('AlcoholDelivery\Dealer', null, 'products', 'dealers');
    }

    public function getSingleProduct($id)
    {
        return Products::where('_id', $id)->first();       
    }

    public function packagelist()
    {        
        return $this->belongsToMany('AlcoholDelivery\Packages', null, 'products', 'packages');
    }
}
