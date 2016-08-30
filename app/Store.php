<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;


class Store extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'stores';

    protected $fillable = [
        'name',
        'address',
        'latitude',
        'longitude',
        'location',
        'metaTitle',
        'metaKeywords',
        'metaDescription',
        'email',
        'telephone',
    ];
}
