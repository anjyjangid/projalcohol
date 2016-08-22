<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;


use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Sale extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'sale';

    protected $fillable = [
        'type',
        'listingTitle',
        'detailTitle',
        'status',        
        'saleProductId',
        'saleCategoryId',
        'conditionQuantity',
        'actionType',
        'giftQuantity',
        'discountValue',
        'discountType',
        'actionProductId',
    ];
}
