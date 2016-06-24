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
        'slug',
        'coverImage',
        'type',
        'cards',    
        'status'        
    ];    

    /*public function subcategories() {
        return $this->hasOne('AlcoholDelivery\GiftCategory', 'parent');
    }*/
    
    public function ancestor() {
        return null;
    }
}
