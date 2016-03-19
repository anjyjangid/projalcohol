<?php

namespace AlcoholDelivery;

use Moloquent;

class Dealer extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'dealers';

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
    protected $fillable = ['title', 'contacts', 'address','status'];

    


}
