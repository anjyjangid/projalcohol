<?php

namespace AlcoholDelivery;

use Moloquent;

class Testimonial extends Moloquent
{
    
    protected $primaryKey = "_id";
    protected $collection = 'testimonial';

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
    protected $fillable = ['name', 'content', 'image','status'];
    
}
