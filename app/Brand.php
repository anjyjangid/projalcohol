<?php

namespace AlcoholDelivery;

use Moloquent;

class Brand extends Moloquent
{
    
    protected $primaryKey = "_id";
    protected $collection = 'brands';

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
    protected $fillable = ['title', 'link', 'image','status'];
    
}
