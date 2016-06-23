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
        'parent',
        'slug',
        'coverImage',
        'status'        
    ];    

    /*public function subcategories() {
        return $this->hasOne('AlcoholDelivery\GiftCategory', 'parent');
    }*/
    
    public function ancestor() {
        return null;
    }
}
