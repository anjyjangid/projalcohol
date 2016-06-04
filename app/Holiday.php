<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Holiday extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'holidays';

    protected $fillable = [
		'title',
		'start',
        'd',
        'm',
        'y',
        'allDay',        
        'dow',
        'timeStamp'        
    ];
}
