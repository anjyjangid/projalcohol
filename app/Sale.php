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
        'saleProductObjectId',
        'saleCategoryId',
        'saleCategoryObjectId',
        'conditionQuantity',
        'actionType',
        'giftQuantity',
        'discountValue',
        'discountType',
        'actionProductId',
        'actionProductObjectId'
    ];

    protected $hidden = [
        'saleProductObjectId'
    ];

    public function project(){
        $fields = $this->fillable;
        $ret = [];
        foreach ($fields as $key => $value) {
            $ret[$value] = '$'.$value;
        }

        return $ret;
    }

    public function group(){
        $fields = $this->fillable;
        $ret = [];
        foreach ($fields as $key => $value) {            
            $ret[$value] = ['$first' => '$'.$value];
        }

        return $ret;
    }
}