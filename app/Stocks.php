<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Admin;
use MongoId;
use AlcoholDelivery\Products;

class Stocks extends Eloquent
{
    protected $primaryKey = "_id";
	protected $collection = 'stocks';

	protected $fillable = [
		'quantity',
		'threshold',
		'maxQuantity',
		'storeId',
		'storeObjId',
		'defaultDealerId',
		'defaultDealerObjId',
		'productObjId',
		'productId',
	];

	protected $hidden = [
		'storeId',
		'storeObjId',
		'defaultDealerObjId',
		'productObjId',
		'productId',
	];

	/*function upsert($data,$productId){

		$userId = Auth::user('admin')->id;

		$currentUser = Admin::find($userId);

		//CHECK FOR EXISTING
		$inventory = Inventory::find();

	}*/

	public static function orderList($params){

        extract($params);

        $model = new Products;
        $project = ['name' => 1];

        $query = [];

        //FILTER TO PROCESS ONLY THE REQUIRED PRODUCTS
        if(isset($products) && count($products) > 0){

            foreach( $products as $i => $product) {
                $products[$i] = new MongoId($product);
            }

            $query[]['$match'] = [
                '_id' => [
                    '$in' => $products
                ]
            ];
        }

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
                        ['$eq'=>['$$order.delivery.type',1]],
                        ['$eq'=>['$$order.doStatus',0]],
                        // ['$lte']
                    ]
                ]
            ]
        ];

        if(isset($params['filter']['from']) && isset($params['filter']['to'])) {
            /*$project['advanceOrder']['$filter']['cond']['$and'][] = [
                '$gte' => [
                    '$$order.timeslot.datekey',
                    strtotime($params['filter']['from'])
                ]
            ];*/
            $project['advanceOrder']['$filter']['cond']['$and'][] = [
                '$lte' => [
                    '$$order.timeslot.datekey',
                    strtotime($params['filter']['to'])
                ]
            ];
        }

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
        $project['storeQty'] = ['$cond'=>['$store','$store.quantity',0]];
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


        $project['qtyOneHour'] = ['$subtract'=>['$storeMaxQty','$storeQty']];

        $project['advanceOrderId'] = '$advanceOrder._id';

        $project['advanceOrder'] = '$advanceOrder.productsLog';

        $query[]['$project'] = $project;

        $project['advanceOrder'] = '$advanceOrder';

        $project['advanceOrderId'] = '$advanceOrderId';

        $project['advanceProductLog'] = [
            '$filter'=>[
                'input' => '$advanceOrder',
                'as' => 'advanceOrder',
                'cond' => ['$eq'=>['$$advanceOrder._id','$_id']]
            ]
        ];

        $project['qtyOneHour'] = '$qtyOneHour';

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
            'storeQty' => ['$first'=>'$storeQty'],
            'storeMaxQty' => ['$first'=>'$storeMaxQty'],
            'storeThreshold' => ['$first'=>'$storeThreshold'],
            'advanceOrderId' => ['$push'=>'$advanceOrderId'],
            'qtyAdvance' => [
                '$sum'=>[
                    '$subtract'=>[
                        '$advanceProductLog.quantity',
                        [
                            '$cond'=>[
                                '$advanceProductLog.received',
                                '$advanceProductLog.received',
                                0
                            ]
                        ]
                    ]
                ]
            ]
        ];

        //UPDATE THIS FIELD IN CASE CURRENT STORE LOGIN IS NOT MAIN STORE

        //GET MAIN STORE ID
        //$userStoreId = Auth::user('admin')->storeId;
        $mainStore = Admin::whereRaw(['role'=>1])->first();
        if($mainStore && $mainStore['storeId'] != $userStoreId){
            $group['qtyAdvance'] = ['$sum'=>0];
            $project['advanceOrderId'] = '$null';
        }
       
        $query[]['$group'] = $group;

        
        /*$query[]['$match'] = [
            'qtyAdvance' => ['$gt'=>0]
        ];*/



        /*
        * PRIORITY FORMULA
        * (CQ - AO) / MQ - RT/MQ
        */
        $project['qtyAdvance'] = '$qtyAdvance';

        //SET ALL ATTR 0 IF maxQty of store is zero

        $project['priority'] = [
            '$cond' => [
                ['$gt'=>['$storeMaxQty',0]],
                [
                    '$subtract' => [
                        [
                            '$multiply' => [
                                [
                                    '$divide' => [
                                        [
                                            '$subtract' => [
                                                '$storeQty','$qtyAdvance'
                                            ]
                                        ],
                                        '$storeMaxQty'
                                    ]
                                ],
                                100
                            ]
                        ],
                        [
                            '$multiply' => [
                                [
                                    '$divide' => [
                                        '$storeThreshold','$storeMaxQty'
                                    ]
                                ],
                                100
                            ]
                        ]
                    ]
                ],
                null
            ]
        ];

        $project['totalQty'] = ['$add' => ['$qtyOneHour','$qtyAdvance']];

        $project['purchaseOrder'] = ['$add'=>[0,0]];

        $project['sTitle'] = ['$toLower' => '$name'];

        $project['sSupplier'] = ['$toLower' => '$supplier.title'];
        $project['supplierName'] = ['$cond'=>['$supplier','$supplier.title','No Supplier']];

        $query[]['$project'] = $project;

        // FETCH ALL PURCHASE ORDER FOR SUPPLIER
        $query[]['$lookup'] = [
            'from'=>'purchase_order',
            'localField'=>'supplier._id',
            'foreignField'=>'supplier',
            'as'=>'purchase_orders'
        ];


        $project['purchase_orders'] = [
            '$filter' => [
                'input' => '$purchase_orders',
                'as' => 'purchase_orders',
                'cond' => [
                    '$and' => [
                        ['$eq' => [ '$$purchase_orders.store', new MongoId($userStoreId) ]],
                        ['$lte' => [ '$$purchase_orders.status' , 1 ]]
                    ]
                ]
            ]
        ];

        $query[]['$project'] = $project;

        $query[]['$unwind'] = [
            'path' => '$purchase_orders',
            'preserveNullAndEmptyArrays' => true
        ];

        $project['purchase_orders'] = [
            '$filter' => [
                'input' => '$purchase_orders.products',
                'as' => 'product',
                'cond' => [
                    '$eq' => [ '$$product._id', '$_id' ]
                ]
            ]
        ];

        $query[]['$project'] = $project;

        $query[]['$unwind'] = [
            'path' => '$purchase_orders',
            'preserveNullAndEmptyArrays' => true
        ];

        unset($project['purchase_orders']);

        $project['purchaseOrder'] = [
            '$cond' => [
                '$purchase_orders',
                '$purchase_orders.order',
                0
            ]
        ];

        $query[]['$project'] = $project;

        //DEFAULT SORT BY PRIORITY
        $sort = ['priority'=>1];

        //COL ARRAY FOR SORTING
        $columns = ['_id','sTitle','sSupplier','qtyOneHour','qtyAdvance','totalQty','purchaseOrder','priority'];
        if(isset($params['order']) && !empty($params['order'])) {
            $field = $columns[$params['order'][0]['column']-1];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];
        }
        if(!empty($params['filter']['supplier'])){
            if(!empty($params['filter']['supplier'])){
                $query[]['$match'] = [
                    'supplier._id' => new MongoId($params['filter']['supplier'])
                ];
            }
        }

        $query[]['$sort'] = $sort;

        $model = $model->raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Products::raw()->aggregate($query);
        }

        // jprd($query);

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => @$draw,
            'data' => $model['result']
        ];

        return $response;
	}

    public static function neworderList($params){

        extract($params);

        $model = new Products;
        $project = ['name' => 1,'groupId' => 1];

        $query = [];

        //FILTER TO PROCESS ONLY THE REQUIRED PRODUCTS
        if(isset($products) && count($products) > 0){

            foreach( $products as $i => $product) {
                $products[$i] = new MongoId($product);
            }

            $query[]['$match'] = [
                '_id' => [
                    '$in' => $products
                ]
            ];
        }

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
                        ['$eq'=>['$$order.delivery.type',1]],
                        ['$eq'=>['$$order.doStatus',0]],
                        // ['$lte']
                    ]
                ]
            ]
        ];

        if(isset($params['filter']['from']) && isset($params['filter']['to'])) {
            /*$project['advanceOrder']['$filter']['cond']['$and'][] = [
                '$gte' => [
                    '$$order.timeslot.datekey',
                    strtotime($params['filter']['from'])
                ]
            ];*/
            $project['advanceOrder']['$filter']['cond']['$and'][] = [
                '$lte' => [
                    '$$order.timeslot.datekey',
                    strtotime($params['filter']['to'])
                ]
            ];
        }

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
        $project['storeQty'] = ['$cond'=>['$store','$store.quantity',0]];
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


        $project['qtyOneHour'] = ['$subtract'=>['$storeMaxQty','$storeQty']];

        $project['advanceOrderId'] = '$advanceOrder._id';

        $project['advanceOrder'] = '$advanceOrder.productsLog';

        $query[]['$project'] = $project;

        $project['advanceOrder'] = '$advanceOrder';

        $project['advanceOrderId'] = '$advanceOrderId';

        $project['advanceProductLog'] = [
            '$filter'=>[
                'input' => '$advanceOrder',
                'as' => 'advanceOrder',
                'cond' => ['$eq'=>['$$advanceOrder._id','$_id']]
            ]
        ];

        $project['qtyOneHour'] = '$qtyOneHour';

        $query[]['$project'] = $project;

        $query[]['$unwind'] = [
            'path' => '$advanceProductLog',
            'preserveNullAndEmptyArrays' => true
        ];

        $group = [
            '_id' => '$_id',
            'name' => ['$first'=>'$name'],
            'groupId' => ['$first'=>'$groupId'],
            'store'=>['$first'=>'$store'],
            'supplier'=>['$first'=>'$supplier'],
            'qtyOneHour' => ['$first'=>'$qtyOneHour'],
            'storeQty' => ['$first'=>'$storeQty'],
            'storeMaxQty' => ['$first'=>'$storeMaxQty'],
            'storeThreshold' => ['$first'=>'$storeThreshold'],
            'advanceOrderId' => ['$push'=>'$advanceOrderId'],
            'qtyAdvance' => [
                '$sum'=>[
                    '$subtract'=>[
                        '$advanceProductLog.quantity',
                        [
                            '$cond'=>[
                                '$advanceProductLog.received',
                                '$advanceProductLog.received',
                                0
                            ]
                        ]
                    ]
                ]
            ]
        ];

        //UPDATE THIS FIELD IN CASE CURRENT STORE LOGIN IS NOT MAIN STORE

        //GET MAIN STORE ID
        //$userStoreId = Auth::user('admin')->storeId;
        $mainStore = Admin::whereRaw(['role'=>1])->first();
        if($mainStore && $mainStore['storeId'] != $userStoreId){
            $group['qtyAdvance'] = ['$sum'=>0];
            $project['advanceOrderId'] = '$null';
        }
       
        $query[]['$group'] = $group;

        
        /*$query[]['$match'] = [
            'qtyAdvance' => ['$gt'=>0]
        ];*/



        /*
        * PRIORITY FORMULA
        * (CQ - AO) / MQ - RT/MQ
        */
        $project['qtyAdvance'] = '$qtyAdvance';

        //SET ALL ATTR 0 IF maxQty of store is zero

        $project['priority'] = [
            '$cond' => [
                ['$gt'=>['$storeMaxQty',0]],
                [
                    '$subtract' => [
                        [
                            '$multiply' => [
                                [
                                    '$divide' => [
                                        [
                                            '$subtract' => [
                                                '$storeQty','$qtyAdvance'
                                            ]
                                        ],
                                        '$storeMaxQty'
                                    ]
                                ],
                                100
                            ]
                        ],
                        [
                            '$multiply' => [
                                [
                                    '$divide' => [
                                        '$storeThreshold','$storeMaxQty'
                                    ]
                                ],
                                100
                            ]
                        ]
                    ]
                ],
                null
            ]
        ];

        $project['totalQty'] = ['$add' => ['$qtyOneHour','$qtyAdvance']];

        $project['purchaseOrder'] = ['$add'=>[0,0]];

        $project['sTitle'] = ['$toLower' => '$name'];

        $project['sSupplier'] = ['$toLower' => '$supplier.title'];
        $project['supplierName'] = ['$cond'=>['$supplier','$supplier.title','No Supplier']];

        $query[]['$project'] = $project;

        // FETCH ALL PURCHASE ORDER FOR SUPPLIER
        $query[]['$lookup'] = [
            'from'=>'purchase_order',
            'localField'=>'supplier._id',
            'foreignField'=>'supplier',
            'as'=>'purchase_orders'
        ];


        $project['purchase_orders'] = [
            '$filter' => [
                'input' => '$purchase_orders',
                'as' => 'purchase_orders',
                'cond' => [
                    '$and' => [
                        ['$eq' => [ '$$purchase_orders.store', new MongoId($userStoreId) ]],
                        ['$lte' => [ '$$purchase_orders.status' , 1 ]]
                    ]
                ]
            ]
        ];

        $query[]['$project'] = $project;

        $query[]['$unwind'] = [
            'path' => '$purchase_orders',
            'preserveNullAndEmptyArrays' => true
        ];

        $project['purchase_orders'] = [
            '$filter' => [
                'input' => '$purchase_orders.products',
                'as' => 'product',
                'cond' => [
                    '$eq' => [ '$$product._id', '$_id' ]
                ]
            ]
        ];

        $query[]['$project'] = $project;

        $query[]['$unwind'] = [
            'path' => '$purchase_orders',
            'preserveNullAndEmptyArrays' => true
        ];

        unset($project['purchase_orders']);

        $project['purchaseOrder'] = [
            '$cond' => [
                '$purchase_orders',
                '$purchase_orders.order',
                0
            ]
        ];


        //NEW PO AND STOCK ORDER LIST WORK

        $query[]['$lookup'] = [
            'from'=>'productgroups',
            'localField'=>'groupId',
            'foreignField'=>'_id',
            'as'=>'groupdetail'
        ];

        $query[]['$unwind'] = [
            'path' => '$groupdetail',
            'preserveNullAndEmptyArrays' => true
        ];

        $project['groupdetail'] = 1;

        //NEW PO AND STOCK ORDER LIST WORK

        $query[]['$project'] = $project;

        //DEFAULT SORT BY PRIORITY
        $sort = ['priority'=>1];

        //COL ARRAY FOR SORTING
        $columns = ['_id','sTitle','sSupplier','qtyOneHour','qtyAdvance','totalQty','purchaseOrder','priority'];
        if(isset($params['order']) && !empty($params['order'])) {
            $field = $columns[$params['order'][0]['column']-1];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];
        }
        if(!empty($params['filter']['supplier'])){
            if(!empty($params['filter']['supplier'])){
                $query[]['$match'] = [
                    'supplier._id' => new MongoId($params['filter']['supplier'])
                ];
            }
        }

        $query[]['$sort'] = $sort;

        $model = $model->raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Products::raw()->aggregate($query);
        }

        // jprd($query);

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => @$draw,
            'data' => $model['result']
        ];

        return $response;
    }
}
