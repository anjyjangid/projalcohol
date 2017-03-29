<?php

namespace AlcoholDelivery;

use Moloquent;

class PromotionalBanners extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'promotionalbanners';

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
    protected $fillable = [
        'status',
        'image',
        'imagemobile',
    ];
    
    public function get($params = array()){

        $result = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $response = $result->get();
        }else{
            $response = $result->first();
        }

        return $response;
    }
}
