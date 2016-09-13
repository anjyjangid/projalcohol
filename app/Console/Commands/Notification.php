<?php

namespace AlcoholDelivery\Console\Commands;

use Illuminate\Console\Command;
use DB;

class Notification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sale:notify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send sale notification to subscribers';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $data = DB::collection('notifications')->raw()->aggregate(
            [
                '$limit' => 10
            ],
            [
                '$lookup' => [
                    'from' => 'user',
                    'localField' => 'userId',
                    'foreignField' => '_id',
                    'as' => 'consumer'
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$consumer',
                    'preserveNullAndEmptyArrays' => true
                ]
            ],
            [
                '$lookup' => [
                    'from' => 'sale',
                    'localField' => 'saleID',
                    'foreignField' => '_id',
                    'as' => 'saleDetail'
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$saleDetail',
                    'preserveNullAndEmptyArrays' => true
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$matchingWish',
                    'preserveNullAndEmptyArrays' => true
                ]
            ],
            [
                '$lookup' => [
                    'from' => 'products',
                    'localField' => 'matchingWish._id',
                    'foreignField' => '_id',
                    'as' => 'products'
                ]
            ],
            [
                '$project' => [
                    '_id' => '$_id',
                    'consumer' => '$consumer',                      
                    'saleDetail' => '$saleDetail',                      
                    'matchingWish' => '$matchingWish',
                    'products' => ['$arrayElemAt' => [ '$products', 0 ]]
                ]
            ],
            [
                '$group' => [
                    '_id' => '$_id',
                    'consumer' => ['$first'=>'$consumer'],
                    'saleDetail' => ['$first'=>'$saleDetail'],
                    'products' => ['$addToSet'=>'$products']
                ]
            ]
        );

        if(isset($data['result'][0]) && !empty($data['result'][0])){
            foreach ($data['result'] as $key => $value) {
                $this->info($value['consumer']['email']);                
            }
        }
    }
}
