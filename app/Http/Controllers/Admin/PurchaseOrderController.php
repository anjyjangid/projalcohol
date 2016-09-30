<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\PurchaseOrder;
use Illuminate\Support\Facades\Auth;
use MongoId;

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
                    'supplierName' => '$suppliers.title'
                ]
            ]
        ];

        if(isset($params['order']) && !empty($params['order'])) {
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];
            $query[]['$sort'] = $sort;
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
                    'results' => [
                        '$slice' => ['$results', (int)$skip, (int)$length]
                    ],
                ]
            ]
        ];

        $limitQuery = [];

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
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
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
}
