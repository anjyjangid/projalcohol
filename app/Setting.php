<?php

namespace AlcoholDelivery;

use Moloquent;

class Setting extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'settings';

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
    protected $fillable = ['title', 'description', 'contacts', 'address','status'];

    
    public function getSettings($params = array()){

        $setting = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $setting = $setting->get();
        }else{
            $setting = $setting->first();
        }
        
        
        return $setting;

    }


}
