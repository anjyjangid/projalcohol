<?php

namespace AlcoholDelivery\Console\Commands;

use Illuminate\Console\Command;
use DB;
use AlcoholDelivery\Email;
use AlcoholDelivery\Products;
use View;

class StockNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:notify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify user for stock available';

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
        $userlist = DB::collection('user')
            ->whereRaw(['productAddedNotification'=>['$exists'=>true,'$not'=>['$size'=>0]]])
            ->take(5)
            ->get();

        $plist = [];    
        $productwiseuser = [];
        foreach ($userlist as $user) {
            foreach ($user['productAddedNotification'] as $pid) {
                $pid = (string)$pid;
                if(!in_array($pid, $plist))
                    $plist[] = $pid;

                $productwiseuser[$pid][] = $user;
            }
        }                

        $model = new Products();
        $query = [];
        $query['id'] = $plist;
        $query['matchconditions'] = ['quantity' => ['$gt' => 0]];
        $products = $model->fetchProduct($query);
        //dd($products);
        $userMails = [];
        $userUpdate = [];
        if(isset($products['product'])){
            foreach ($products['product'] as $product) {
                $productId = (string)$product['_id'];
                $users = $productwiseuser[$productId];
                foreach ($users as $user) {
                    $uid = (string)$user['_id'];
                    $userUpdate['uid'][] = $user['_id'];
                    $userUpdate['pid'][] = $productId;
                    $userMails[$uid]['userdetail'] = $user;
                    $userMails[$uid]['products'][] = $product;
                }
            }
        }

        $contents = '';        

        if($userMails){
            foreach ($userMails as $userMail) {
                $view = View::make('emails.backinstock',['userMail'=>$userMail]);
                
                $contents = $view->render();

                $email = new Email('notifyuseronproductadd');

                $user = $userMail['userdetail'];

                $data = [
                    'name' => (isset($user['name']) && !empty($user['name']))?$user['name']:$user['email'],
                    'email' => $user['email'],                  
                    'products' => $contents
                ];

                $emailSent = $email->sendEmail($data);
            }
        }

        if(!empty($userUpdate)){

            DB::collection('user')->raw()
            ->update(
                [
                    '_id' => ['$in' => $userUpdate['uid']]
                ],
                [
                    '$pull' => ['productAddedNotification' => ['$in' => $userUpdate['pid']]] 
                ],
                [
                    'multiple' => true
                ]
            );

        }
    }
}
