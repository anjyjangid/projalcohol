<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class PageList extends Eloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'page_list';

    protected $fillable = [
    'page_url',
    'page_state',
    'status'
    ];

}
