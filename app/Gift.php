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
        'category',
        'subcategory',
        'coverImage',
        'limit',     
        'costprice',
        'gift_packaging',     
        'status'        
    ];

    public function categorydetail(){
        return $this->belongsTo('AlcoholDelivery\GiftCategory','category','_id');
    }

    public function subcategorydetail(){
        return $this->belongsTo('AlcoholDelivery\GiftCategory','subcategory','_id');
    }

    
}
