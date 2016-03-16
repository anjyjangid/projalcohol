<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Products extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'products';

    protected $fillable = [
    		'p_name',
            'p_description',
            'p_shortDescription',
            'p_categories',
            'p_sku',
            'p_price',
            'p_discountPrice',
            'p_chilled',
            'p_status',
            'p_metaTitle',
            'p_metaKeywords',
            'p_metaDescription',
    ];
}
