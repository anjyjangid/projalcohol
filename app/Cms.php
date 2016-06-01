<?php

namespace AlcoholDelivery;

use Moloquent;

class Cms extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'pages';

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
    protected $fillable = ['title','description','content','status'];
    
    public function getpages($params = array()){

        $page = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $page = $page->get();
        }else{
            $page = $page->first();
        }
        
        
        return $page;

    }


}
