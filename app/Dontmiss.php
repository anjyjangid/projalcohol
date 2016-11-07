<?php

namespace AlcoholDelivery;

use Moloquent;

class Dontmiss extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'dontmiss';

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
    protected $fillable = ['quantity', 'products'];

}
