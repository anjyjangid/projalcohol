<?php

namespace AlcoholDelivery;

// use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Categories extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'categories';

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
    protected $fillable = ['cat_title', 'cat_thumb', 'cat_lthumb','ancestors','cat_status'];


}
