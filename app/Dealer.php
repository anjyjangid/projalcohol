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
    protected $fillable = ['title', 'description', 'contacts', 'address','status','products'];

    
    public function getDealers($params = array()){

        $dealer = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $dealer = $dealer->get();
        }else{
            $dealer = $dealer->first();
        }
        
        
        return $dealer;

    }


    public function productlist()
    {        
        return $this->belongsToMany('AlcoholDelivery\Products', null, 'dealers', 'products');
    }


}
