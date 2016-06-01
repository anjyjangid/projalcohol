<?php

namespace AlcoholDelivery;

// use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Subcategories extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'test';

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
    

}
