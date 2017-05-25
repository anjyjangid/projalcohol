<?php

namespace AlcoholDelivery\Console\Commands;

use Illuminate\Console\Command;
use DB;
use AlcoholDelivery\Email;

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
                '$match' => [
                    'saleDetail' => ['$not'=>['$eq'=>[]]]
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
            $emailTemplate = new Email('salenotification');
            $userWiseSaleProduct = [];
            foreach ($data['result'] as $key => $value) {
                $email = $value['consumer']['email'];
                $userWiseSaleProduct[$email]['consumer'] = $value['consumer'];                
                
                //ATTACH SALE TO EACH PRODUCT
                foreach ($value['products'] as $pkey => $pvalue) {
                    $pvalue['pImg'] = $this->getCoverImage($pvalue['imageFiles']);
                    $pvalue['saleDetail'] = $value['saleDetail'];
                    $userWiseSaleProduct[$email]['productsWithSale'][] = $pvalue;
                }                
                DB::collection('notifications')->delete($value['_id']);
            }

            foreach ($userWiseSaleProduct as $useremail => $value) {                
                $user_name = (isset($value['consumer']['name']))?$value['consumer']['name']:$useremail;
                $productList = '<table border="0" cellpadding="10" cellspacing="0" width="100%">';
                $i = 0;
                foreach ($value['productsWithSale'] as $pkey => $pvalue) {
                    $i += 1;
                    if($i%3==1)
                        $productList .= '<tr>';                        
                        
                        $productList .= '
                        <td style="border:0px solid #ccc; width:33%;">
                            <a href="'.url().'/product/'.$pvalue['slug'].'" style="text-decoration:none;color:#37474f;font-size:12px;">
                                <div align="center" style="min-height:153px;">
                                    <img style="max-width:100%;max-height:153px;" alt="'.$pvalue['name'].'" border="0" src="'.url().'/products/i/200/'.$pvalue['pImg'].'">
                                </div>
                                <div style="width:100%;margin-bottom:5px;text-align:center;">
                                    <div style="background:#b119ff;color:#FFF;font-size:13px;border-radius:2px;padding:1px 6px;display:inline-block;margin:0 auto;">'.$pvalue['saleDetail']['listingTitle'].'</div>
                                </div>
                                <div style="text-align:center;">'.$pvalue['name'].'</div>
                            </a>
                        </td>';
                    
                    if(count($value['productsWithSale'])==1){
                        $productList .= '<td style="width:33%;"></td><td style="width:33%;"></td></tr>';
                    }

                    if(count($value['productsWithSale'])==2 && $pkey==1){
                        $productList .= '<td style="width:33%;"></td></tr>';
                    }    
                        
                    if($i%3==0)
                        $productList .= '</tr>';        
                }
                $productList .= '</table>';
                
                $mailData = [
                    'email' => strtolower($useremail),
                    'user_name' => $user_name,
                    'product_list' => $productList
                ];

                $mailSent = $emailTemplate->sendEmail($mailData);

                $this->info($mailSent);
            }
        }
    }

    public function getCoverImage($imgArr){
        $img = 'noimage.jpg'; 
        foreach ($imgArr as $key => $value) {
            if($value['coverimage'] == 1){
                $img = $value['source'];
                break;
            }
        }
        return $img;
    }
}
