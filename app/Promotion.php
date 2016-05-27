<?php

namespace AlcoholDelivery;

use Moloquent;

class Promotion extends Moloquent
{
    
    protected $primaryKey = "_id";
    protected $collection = 'promotions';

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
    protected $fillable = ['title', 'price', 'products', 'items', 'status', 'count'];
    
}
