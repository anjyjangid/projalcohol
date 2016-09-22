<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Products;
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
        //
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

    public function getList(Request $request)
    {
        
        $model = new Products;
        $project = ['name' => 1];

        $query = [];

        //JOIN TO STOCKS TABLE TO GET STOCK FOR THE CURRENT STORE
        $query[]['$lookup'] = [
            'from'=>'stocks',
            'localField'=>'_id',
            'foreignField'=>'productObjId',
            'as'=>'store'
        ];

        //FILTER THE STORES FOR CURRENT USER
        $userStoreId = Auth::user('admin')->storeId;
        $project['store'] = [
            '$filter'=>[
                'input' => '$store',
                'as' => 'store',
                'cond' => ['$eq'=>['$$store.storeId',$userStoreId]]
            ]
        ]; 
        
        //JOIN TO ORDER TABLE TO GET QTY FOR ADVANCE ORDERS 
        $query[]['$lookup'] = [
            'from' => 'orders',
            'localField' => '_id',
            'foreignField' => 'productsLog._id',
            'as' => 'myOrders'
        ];

        //FILTER THE ORDERS BY CONDITION OF TYPE AND STATUS
        $project['advanceOrder'] = [
            '$filter'=>[
                'input' => '$myOrders',
                'as' => 'order',
                'cond' => [
                    '$and'=>[
                        ['$eq'=>['$$order.delivery.type',0]],
                        ['$eq'=>['$$order.status',0]],
                    ]
                ]
            ]
        ];

        //PROJECT ALL FIELDS
        $query[]['$project'] = $project;
        
        //UNWIND THE STORE TO GET SINGLE OBJECT
        $query[]['$unwind'] = [
            'path' => '$store',
            'preserveNullAndEmptyArrays' => true
        ];

        //JOIN TO SUPPLIER TO GET DEFAUL SUPPLIER
        $query[]['$lookup'] = [
            'from' => 'dealers',
            'localField' => 'store.defaultDealerObjId',
            'foreignField' => '_id',
            'as' => 'supplier'
        ];

        $project['supplier'] = '$supplier';
        $project['store'] = '$store';
        $project['advanceOrder'] = '$advanceOrder';
        $project['qtyOneHour'] = ['$cond'=>['$store','$store.quantity',0]];
        $project['storeMaxQty'] = ['$cond'=>['$store','$store.maxQuantity',0]];
        $project['storeThreshold'] = ['$cond'=>['$store','$store.threshold',0]];

        //PROJECT ALL FIELDS
        $query[]['$project'] = $project;

        //UNWIND THE SUPPLIER TO GET SINGLE SUPPLIER
        $query[]['$unwind'] = [
            'path' => '$supplier',
            'preserveNullAndEmptyArrays' => true
        ];        

        $query[]['$unwind'] = [
            'path' => '$advanceOrder',
            'preserveNullAndEmptyArrays' => true
        ]; 

        $project['advanceOrder'] = '$advanceOrder.productsLog';

        $query[]['$project'] = $project;

        $project['advanceOrder'] = '$advanceOrder';
        
        $project['advanceProductLog'] = [
            '$filter'=>[
                'input' => '$advanceOrder',
                'as' => 'advanceOrder',
                'cond' => ['$eq'=>['$$advanceOrder._id','$_id']]                
            ]
        ];

        $query[]['$project'] = $project;        

        $query[]['$unwind'] = [
            'path' => '$advanceProductLog',
            'preserveNullAndEmptyArrays' => true
        ];

        $group = [
            '_id' => '$_id',
            'name' => ['$first'=>'$name'],
            'store'=>['$first'=>'$store'],
            'supplier'=>['$first'=>'$supplier'],
            'qtyOneHour' => ['$first'=>'$qtyOneHour'],
            'storeMaxQty' => ['$first'=>'$storeMaxQty'],
            'storeThreshold' => ['$first'=>'$storeThreshold'],
            //'advanceOrder' => ['$push'=>'$advanceOrder'],
            'qtyAdvance' => ['$sum'=>'$advanceProductLog.quantity']
        ];

        $query[]['$group'] = $group;

        $query[]['$match'] = [
            'qtyAdvance' => ['$gt'=>0]
        ];

        /*$project['priority'] = [

        ];*/

        $model = $model->raw()->aggregate($query);

        dd($model);

        $params = $request->all();

        extract($params);

        $columns = ['_id','sTitle','sSupplier','qtyOneHour','qtyAdvance','totalQty','purchaseOrder','priority'];

        $project = ['title'=>1,'link'=>1,'status'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $query = [];
        
        $query[]['$project'] = $project;

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = Products::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Products::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);          
    }    
}
