<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\PurchaseOrder;
use AlcoholDelivery\Stocks;
use AlcoholDelivery\Products;
use AlcoholDelivery\Orders;
use Illuminate\Support\Facades\Auth;
use MongoId;
use MongoDate;
use DB;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function postIndex(Request $request)
    {
        // dd("ji");
        $params = $request->all();
        extract($params);

        $userStoreId = Auth::user('admin')->storeId;

        if(!isset($skip))
            $skip = 0;

        if(!isset($length))
            $length = 10;

        $query =[
            [
                '$match' => [
                    'store' => new MongoId($userStoreId)
                ]
            ],[
                '$lookup' => [
                    'from' => 'dealers',
                    'localField' => 'supplier',
                    'foreignField' => '_id',
                    'as' => 'suppliers'
                ],
            ],[
                '$unwind' => [
                    'path' => '$suppliers',
                    'preserveNullAndEmptyArrays' => true
                ],
            ],[
                '$project' => [
                    'status' => 1,
                    'supplier' => 1,
                    'count' => 1,
                    'createTime' => 1,
                    'supplierName' => '$suppliers.title'
                ]
            ]
        ];

        $columns = [null, 'createTime', 'supplier', 'status'];
        if(isset($params['order']) && !empty($params['order'])) {
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $query[]['$sort'] = [ $field => $direction ];
        }

        $countQuery = [
            [
                '$group' => [
                    '_id' => new MongoId($userStoreId),
                    'total' => [ '$sum' => 1 ],
                    'results' => [ '$push' => '$$ROOT' ]
                ]
            ],[
                '$project' => [
                    '_id' => 0,
                    'total' => 1,
                    'createTime' => 1,
                    'results' => [
                        '$slice' => ['$results', (int)$skip, (int)$length]
                    ],
                ]
            ]
        ];

        $response = PurchaseOrder::raw()->aggregate(array_merge($query, $countQuery));

        $response["result"] = array_shift($response["result"]);

        // jprd($response);
        return response( [
            'data' => $response["result"]['results'],
            'draw' => @$draw,
            'recordsFiltered' => @$response["result"]['total'],
            'recordsTotal' => @$response["result"]['total']
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // jprd($id);
        $response = PurchaseOrder::raw()->aggregate([
            [
                '$match' => [ '_id' => new MongoId($id) ]
            ],[
                '$lookup' => [
                    'from' => 'dealers',
                    'localField' => 'supplier',
                    'foreignField' => '_id',
                    'as' => 'supplier'
                ]
            ],[
                '$unwind' => [
                    'path' => '$supplier'
                ]
            ],[
                '$unwind' => [
                    'path' => '$products'
                ]
            ],[
                '$lookup' => [
                    'from' => 'products',
                    'localField' => 'products._id',
                    'foreignField' => '_id',
                    'as' => 'productDetails'
                ]
            ],[
                '$unwind' => [
                    'path' => '$productDetails'
                ]
            ],[
                '$project' => [
                    'const' => [
                        'supplierId' => '$supplier._id',
                        'supplierTitle' => '$supplier.title',
                        'status' => '$status'
                    ],
                    'product' => [
                        '_id' => '$products._id',
                        'order' => '$products.order',
                        'received' => '$products.received',
                        'name' => '$productDetails.name',
                    ]
                ]
            ],[
                '$group' => [
                    '_id' => '$const',
                    'products' => [ '$push' => '$product' ]
                ]
            ]
        ]);
        return response( $response['result'] , 200 );
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        
        $model = PurchaseOrder::find($id);

        $advanceOrders = [];
        if($model){
            if(isset($model->advanceOrderId)){
                $advanceOrders = Orders::whereRaw(['_id'=>['$in'=>$model->advanceOrderId],'doStatus'=>0])->get();
            }
        }

        $params = $request->all();

        extract($params);

        if(isset($status) && $model->status<1){
            $model->status = 3;
            $model->save();
            /*$response = PurchaseOrder::raw()->update(['_id' => new MongoId($id), 'status'=> ['$lte' => 1]], ['$set' => ['status'=>3]]);*/
        }
        if(isset($products)) {

            $hasUpdate = false;
            $isComplete = true;
            $received = false;

            $user = Auth::user('admin');
            $userStoreId = $user->storeId;
            $inventoryLog = [];
            //IF ADVANCE ORDER ARE ASSOCIATED WITH PO THEN PROCESS THEM FIRST
            if(!empty($advanceOrders)){
                //$this->processAdvanceOrder($advanceOrders,$products,$inventoryLog,$user,$id);
            }

            foreach ($products as $i => $product) {
                if(!isset($product['received']))
                    $products[$i]['received'] = 0;

                $products[$i]['_id'] = new MongoId($product['_id']['$id']);

                if(isset($product['add']) && $product['add']>0){
                    $products[$i]['received'] += $product['add'];
                    $products[$i]['order'] -= $product['add'];

                    $hasUpdate = true;

                    Stocks::raw()->update(["productId" => $product['_id']['$id'], "storeId" => $userStoreId], ['$inc' => ['quantity' => $product['add']]]);
                    Products::raw()->update(["_id" => $products[$i]['_id']], ['$inc' => ['quantity' => $product['add']]]);

                    //PREPARE TRANSACTION OF PRODUCT FOR THE STORE
                    $inventoryLog[] = [
                        'productId' => new MongoId($product['_id']['$id']),
                        'purchaseOrderId' => new MongoId($id),
                        'storeId' => new MongoId($userStoreId),
                        'actionUserId' => new MongoId($user->_id),
                        'quantity' => $product['add'],
                        'type' => 1,
                        'created_at' => new MongoDate(strtotime(date('Y-m-d H:i:s')))
                    ];                    
                }

                unset($products[$i]['add']);
                unset($products[$i]['name']);

                if($products[$i]['order'] > 0)
                    $isComplete = false;
                if($products[$i]['received'] > 0)
                    $received = true;
            }

            //INSERT INVENTORY LOG
            if($inventoryLog){
                $r = DB::collection('inventoryLog')->insert($inventoryLog);
            }

            //PROCESS ADVANCE ORDER
            
            if($isComplete)
                $status = 2;
            else if($received)
                $status = 1;
            else
                $status = 0;

            if($hasUpdate)
                $response = PurchaseOrder::raw()->update(['_id' => new MongoId($id)], ['$set' => ['products'=>$products, 'status'=>$status]]);

            
        }

        if(!isset($response))
            return response( "nothing to update" , 500 );

        return response( $response , 200 );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /*
    * Process advance order on PO Update
    * @param 
    * object $advanceOrders
    * array $products
    * array $inventoryLog
    */
    private function processAdvanceOrder($advanceOrders,&$products,&$inventoryLog,$user,$id){

        $userStoreId = $user->storeId;
        
        $received = [];
        foreach ($products as $key => $product) {
            $productId = (string)$product['_id']['$id'];

            //PREPARE TRANSACTION OF PRODUCT FOR THE STORE
            $inventoryLogVal = [
                'productId' => new MongoId($productId),
                'orderId' => new MongoId($key),
                'storeId' => new MongoId($userStoreId),
                'purchaseOrderId' => new MongoId($id),
                'actionUserId' => new MongoId($user->_id),
                'quantity' => $productsLog['quantity'],
                'type' => 1,
                'created_at' => new MongoDate(strtotime(date('Y-m-d H:i:s')))
            ];

            $received[$productId] = $product['add'];
        }

        $taken = [];
        $orderProcessed = [];
        foreach ($advanceOrders as $akey => $advanceOrder) {
            $key = (string)$advanceOrder['_id'];
            if(isset($advanceOrder->productsLog)){
                foreach ($advanceOrder->productsLog as $pkey => $productsLog) {
                    
                    //IF THE ORDER IS ALREADY DISCARDED THEN SKIP THE LOOP
                    if(isset($orderProcessed[$key]) && $orderProcessed[$key] == 0) continue;
                    
                    $vkey = (string)$productsLog['_id'];
                    $vvalue = $productsLog['quantity'];

                    if(isset($received[$vkey]) && $received[$vkey]>=$vvalue){
                        $received[$vkey] -= $vvalue;
                        $taken[$key][$vkey] = $vvalue;
                        $orderProcessed[$key] = 1;
                    }else{
                        if(isset($taken[$key])){
                            foreach($taken[$key] as $tkey => &$tvalue) {
                                $received[$tkey] += $tvalue;
                                $tvalue = 0;
                            }
                        }
                        $orderProcessed[$key] = 0;
                    }
                }
            }
        }

        //UPDATE REMAINING QTY FOR 1 HR AFTER DEDUCTING QTY FOR ADVANCE ORDER FOR EACH PRODUCT
        foreach ($products as $key => $product) {
            $productId = (string)$product['_id']['$id'];
            $product['add'] = $received[$productId];
        }

        //PREPARE ADVANCE ORDER WITH INVENTORY LOG
        foreach ($advanceOrders as $akey => $advanceOrder) {
            $key = (string)$advanceOrder['_id'];
            //ORDER COMPLETE
            if(isset($orderProcessed[$key]) && $orderProcessed[$key]==1){                
                if(isset($advanceOrder->productsLog)){
                    foreach ($advanceOrder->productsLog as $pkey => $productsLog) {
                        
                        //PREPARE TRANSACTION OF PRODUCT FOR THE STORE
                        $inventoryLogVal = [
                            'productId' => new MongoId($productsLog['_id']),
                            'orderId' => new MongoId($key),
                            'storeId' => new MongoId($userStoreId),
                            'purchaseOrderId' => new MongoId($id),
                            'actionUserId' => new MongoId($user->_id),
                            'quantity' => $productsLog['quantity'],
                            'type' => 1,
                            'created_at' => new MongoDate(strtotime(date('Y-m-d H:i:s')))
                        ];

                        //IN TRANSACTION
                        $inventoryLog[] = $inventoryLogVal;

                        //CHANGE TYPE
                        $inventoryLogVal['type'] = 0;

                        //OUT TRANSACTION
                        $inventoryLog[] = $inventoryLogVal;                        
                    }
                }
                //READY ORDER FOR PRINT
                $advanceOrder->doStatus = 1;
                $advanceOrder->save();
            }else{
                //LOGIN FOR ORDER NOT COMPLETED AFTER PO RECEIVED
            }
        }
    }
}
