<?php

namespace AlcoholDelivery;

use Moloquent;

class Orders extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'orders';

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
    protected $fillable = ['timeslot', 'status' , 'service', 'delivery' , 'nonchilled','products','user','total'];

    public function getOrders($params = array()){
        
    }

    public function generate($params = array()){
        
        $order = new Orders;
        $order->timeslot = array(

            "date" => new MongoDate(strtotime("2016-05-15 00:00:00")),
            "from" => 720,
            "to"   => 840

        );
        $order->save();
        
    }


}
