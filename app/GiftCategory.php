<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class GiftCategory extends Eloquent
{
    protected $primaryKey = "_id";
    protected $foreignKey = "parent";
    protected $collection = 'giftcategories';

    protected $fillable = [
		'title',
        'subTitle',
        'description',
        'parent',
        'parentObject',
        'slug',
        'iconImage',
        'coverImage',
        'type',
        'cards',
        'gift_packaging',
        'metaTitle',
        'metaKeywords',
        'metaDescription',
        'status'        
    ];    

    public function ancestor() {
        return $this->belongsTo('AlcoholDelivery\GiftCategory', 'parent');
    }

    public function child() {
        return $this->hasMany('AlcoholDelivery\GiftCategory', 'parent');
    }

    public function categoryproduct(){
        return $this->hasMany('AlcoholDelivery\Gift','category');
    }

    public function subcategoryproduct(){
        return $this->hasMany('AlcoholDelivery\Gift','subcategory');
    }   
    
}
