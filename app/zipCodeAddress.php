<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class zipCodeAddress extends Eloquent
{
    protected $collection = 'zipCodeAddress';
}