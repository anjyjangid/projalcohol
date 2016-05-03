<?php

namespace AlcoholDelivery;

use Moloquent;

class Cart extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'cart';
    public static $key;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;

     /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['_id', 'bucket'];

    public function setKey($keyVal){
        $this->key = $keyVal;
    }


}
