<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Products;
use AlcoholDelivery\Stocks;
use AlcoholDelivery\PurchaseOrder;
use MongoId;
use Illuminate\Support\Facades\Auth;

class StocksController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
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
        //
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

    public function postGeneratePo(Request $request)
    {
        $params = $request->all();
        $params["start"] = 0;
        $params["length"] = -1;

        $stockList = Stocks::orderList($params);

        $stockList = $stockList['data'];
        // return response($stockList,200);

        $purchaseOrders = array();

        $responses = array();
        foreach ($stockList as $i => $stock) {
            if($stock['totalQty'] > $stock['purchaseOrder']) {
                $productTrade = Products::raw()->aggregate([
                    [
                        '$match' => [
                            '_id' => $stock['_id'],
                            'dealerData' => [
                                '$elemMatch' => [
                                    'dealerId' => (string) $stock['supplier']['_id'],
                                    'tradeValue' => [
                                        '$gte' => 1
                                    ]
                                ]
                            ]
                        ]
                    ],[
                        '$project' => [ 'dealerData' => 1 ]
                    ],[
                        '$unwind' => [
                            'path' => '$dealerData'
                        ]
                    ],[
                        '$match' => [
                            'dealerData.dealerId' => (string) $stock['supplier']['_id']
                        ]
                    ],[
                        '$project' => [
                            'tradeValue' => '$dealerData.tradeValue',
                            'tradeQuantity' => '$dealerData.tradeQuantity'
                        ]
                    ]
                ]);

                if(count($productTrade['result'])>0)
                    $tradeOffer = $productTrade['result'][0]['tradeValue'] + $productTrade['result'][0]['tradeQuantity'];

                if(!isset($tradeOffer) || $tradeOffer<1)
                    $tradeOffer = 1;

                $query1 = [
                    'find' => [
                        'store' => $stock['store']['storeObjId'],
                        'supplier' => $stock['supplier']['_id'],
                        'products._id' => $stock['_id'],
                        'status' => 0
                    ],
                    'update' => [
                        '$set' => [
                            'products.$.order' => ceiling($stock['totalQty'], $tradeOffer)
                        ]
                    ]
                ];

                $query2 = [
                    'find' => [
                        'store' => $stock['store']['storeObjId'],
                        'supplier' => $stock['supplier']['_id'],
                        'status' => 0
                    ],
                    'update' => [
                        '$push' => [
                            'products' => [
                                '_id' => $stock['_id'],
                                'order' => ceiling($stock['totalQty'], $tradeOffer)
                            ]
                        ]
                    ],
                    'options' => [
                        'upsert' => true
                    ]
                ];

                try{
                    $response = PurchaseOrder::raw()->update($query1['find'], $query1['update']);
                    if($response['n'] == 0)
                        $response = PurchaseOrder::raw()->update($query2['find'], $query2['update'], $query2['options']);
                }
                catch(\Exception $e) {
                    $response['ok'] = 0;
                    $response['error'] = $e;
                }

                $responses[] = $response;
            }
        }

        $success = 0;
        foreach ($responses as $response) {
            $success += $response['ok'];
        }

        $responses = [ "success" => ((count($responses)==$success)?1:(($success==0)?-1:0)), "products" => count($responses) ];
        return response($responses, 200);
    }

    public function postList(Request $request)
    {

        $params = $request->all();

        $response = Stocks::orderList($params);

        return response($response,200);
    }
}
