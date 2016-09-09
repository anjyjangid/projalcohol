<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\SaleRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Sale;
use AlcoholDelivery\Products;
use AlcoholDelivery\User;
use MongoId;
use File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use DB;

class SaleController extends Controller
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
    public function store(SaleRequest $request)
    {
        $inputs = $request->all();

        $this->validateItems($inputs);
        
        $sale = Sale::create($inputs);
        
        if($sale){
            
            if(isset($inputs['image']) && !empty($inputs['image']))
                $this->saveImage($sale,$inputs['image']);

            $this->notifySale($inputs);

            return response($sale,201);
        }

        return response('Unable to add sale, please try again.',422);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $model = new Sale();
        $project = $model->project();
        $group = $model->group(); 

        $project['_id'] = '$_id';
        $group['_id'] = '$_id';

        $query = [];

        $query[]['$match'] = ['_id'=> new MongoId($id)];

        $query[]['$unwind'] = [
            'path' => '$saleProductObjectId',
            'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$lookup'] = [
            'from'=>'products',
            'localField'=>'saleProductObjectId',
            'foreignField'=>'_id',
            'as'=>'saleProductDetail'
        ];

        $project['saleProductDetail'] = ['$arrayElemAt' => [ '$saleProductDetail', 0 ]];        
        $group['saleProductDetail'] = ['$push'=>'$saleProductDetail'];

        $query[]['$project'] = $project;
        $query[]['$group'] = $group;                

        $query[]['$unwind'] = [
            'path' => '$saleCategoryObjectId',
            'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$lookup'] = [
            'from'=>'categories',
            'localField'=>'saleCategoryObjectId',
            'foreignField'=>'_id',
            'as'=>'saleCategoryDetail'
        ];

        $project['saleProductDetail'] = '$saleProductDetail';        
        $group['saleProductDetail'] = ['$first'=>'$saleProductDetail'];

        $project['saleCategoryDetail'] = ['$arrayElemAt' => [ '$saleCategoryDetail', 0 ]];        
        $group['saleCategoryDetail'] = ['$push'=>'$saleCategoryDetail'];

        $query[]['$project'] = $project;
        $query[]['$group'] = $group;               
        

        $query[]['$unwind'] = [
            'path' => '$actionProductObjectId',
            'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$lookup'] = [
            'from'=>'products',
            'localField'=>'actionProductObjectId',
            'foreignField'=>'_id',
            'as'=>'actionProductDetail'
        ];   

        $project['saleProductDetail'] = '$saleProductDetail';        
        $group['saleProductDetail'] = ['$first'=>'$saleProductDetail'];

        $project['saleCategoryDetail'] = '$saleCategoryDetail';        
        $group['saleCategoryDetail'] = ['$first'=>'$saleCategoryDetail'];

        $project['actionProductDetail'] = ['$arrayElemAt' => [ '$actionProductDetail', 0 ]];        
        $group['actionProductDetail'] = ['$push'=>'$actionProductDetail'];

        $query[]['$project'] = $project;
        $query[]['$group'] = $group;               

        $model = Sale::raw()->aggregate($query);                

        if($model['ok'] == 1 && isset($model['result'][0])){
            
            if(!empty($model['result'][0]['saleCategoryDetail'])){
              $categories = &$model['result'][0]['saleCategoryDetail'];  
              foreach ($categories as $key => $value) {
                $categories[$key]['name'] = $value['cat_title'];
                if(isset($value['ancestors'])){
                    $categories[$key]['name'] = $value['ancestors'][0]['title'].' > '.$value['cat_title'];
                }
              }

            }

            return response($model['result'][0],200);
        }

        return response('Sale not found',422);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function postUpdate(SaleRequest $request, $id)
    {
        $inputs = $request->all();

        $sale = Sale::find($id);

        $this->validateItems($inputs,$sale);                   
        
        if($sale){

            $sale->update($inputs);

            if(isset($inputs['image']) && !empty($inputs['image']))
                $this->saveImage($sale,$inputs['image']);

            $this->notifySale($inputs);

            return response($sale,201);
        }

        return response('Unable to add sale, please try again.',422);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        
        $sale = Sale::find($id);

        if($sale){
            $delete = $sale->delete();
            if($delete)
                return response(['message'=>'Deleted successfully!'],200);
            else
                return response(['message'=>'Could not delete sale, Please try again'],400);
        }

        return response(['message'=>'Invalid sale'],400);
    }


    public function postList(Request $request){
        
        $params = $request->all();        

        extract($params);
        
        $sale = new Sale;

        $iTotalRecords = $sale->count();        

        $columns = array('_id','title','type');

        $sale = $sale
        ->skip((int)$start)
        ->take((int)$length);

        $sale = $sale->get();

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $sale            
        ];

        return response($response,200);
    }

    public function validateItems(&$inputs,$oldData = null){

        //CONVERT TO OBJECT ID FOR LOOKUP
        $id = [];
        $Objid = [];
        if(isset($inputs['saleProductId']) && !empty($inputs['saleProductId'])){
            foreach ($inputs['saleProductId'] as $key => $value) {
                $id[] = $value;
                $Objid[] = new MongoId($value);
            }
        }
        $inputs['saleProductId'] = $id;
        $inputs['saleProductObjectId'] = $Objid;

        $id = [];
        $Objid = [];
        if(isset($inputs['saleCategoryId']) && !empty($inputs['saleCategoryId'])){
            foreach ($inputs['saleCategoryId'] as $key => $value) {
                $id[] = $value;
                $Objid[] = new MongoId($value);
            }
        }
        $inputs['saleCategoryId'] = $id;
        $inputs['saleCategoryObjectId'] = $Objid;       

        $id = [];
        $Objid = [];
        if(isset($inputs['actionProductId']) && !empty($inputs['actionProductId'])){
            foreach ($inputs['actionProductId'] as $key => $value) {
                $id[] = $value;
                $Objid[] = new MongoId($value);
            }
        }
        $inputs['actionProductId'] = $id;
        $inputs['actionProductObjectId'] = $Objid;    

        $inputs['type'] = (int)$inputs['type'];
        
        if(isset($inputs['conditionQuantity']) && !empty($inputs['conditionQuantity']))
            $inputs['conditionQuantity'] = (int)$inputs['conditionQuantity'];

        if(isset($inputs['giftQuantity']) && !empty($inputs['giftQuantity']))
            $inputs['giftQuantity'] = (int)$inputs['giftQuantity'];

        if(isset($inputs['discountValue']) && !empty($inputs['discountValue']))
            $inputs['discountValue'] = (int)$inputs['discountValue'];

        if(isset($inputs['discountType']) && !empty($inputs['discountType']))
            $inputs['discountType'] = (int)$inputs['discountType'];

        $inputs['saleProducts'] = $inputs['saleProductObjectId'];
        $inputs['saleCategories'] = $inputs['saleCategoryObjectId'];

        //CHECK IN CASE OF UPDATE FOR NEW CATEGORY AND PRODUCTS ADDED IN SALE FOR NOTIFICATION
        if($oldData){
            $inputs['saleProducts'] = $this->compareData($oldData->saleProductObjectId,$inputs['saleProductObjectId']);
            $inputs['saleCategories'] = $this->compareData($oldData->saleCategoryObjectId,$inputs['saleCategoryObjectId']);
        }
        
        //GET ALL PRODUCTS IN CATEGORY
    }

    public function saveImage($sale,$file){        

        if(isset($file['thumb'])){
            $image = @$file['thumb'];
            $destinationPath = storage_path('sale');
            if (!File::exists($destinationPath)){
                File::MakeDirectory($destinationPath,0777, true);
            }
            $filename = $sale->_id.'.'.$image->getClientOriginalExtension();
            $upload_success = $image->move($destinationPath, $filename);
            $sale->coverImage = ['source'=>$filename];
            $sale->save();
        }
    }

    public function compareData($old,$new){
        return array_values(array_diff(array_merge($old,$new),$old));
    }

    public function notifySale($inputs){

        //GET ALL PRODUCTS IN CATEGORY
        if(!empty($inputs['saleCategories'])){

            $model = Products::raw()->aggregate(
                [
                    
                    '$match' => [
                        'categoriesObject' => [
                            '$elemMatch'=>[
                                '$in'=>$inputs['saleCategories']
                            ]
                        ]
                    ],                  
                    

                ],
                [
                    '$group' => [
                        '_id' => null,                      
                        'categoryProduct' => [
                            '$addToSet'=>'$_id' 
                        ],                                          
                    ],
                ]
            );

            //MERGE CATEGORY PRODUCT AND PRODUCT IN SALE
            if(isset($model['result'][0]) && !empty($model['result'][0])){
                $inputs['saleProducts'] = array_unique(array_merge($inputs['saleProducts'],$model['result'][0]['categoryProduct']));
            }
        }
        
        //GET ALL USERS WHO HAVE SALE NOTIFICATION ENABLED FOR THE MATCHING SALE PRODUCT 
        if(!empty($inputs['saleProducts'])){

            $productObjectId = $inputs['saleProducts'];

            $usersWithSaleProduct = User::raw()->aggregate(
                [
                    '$match' => [
                        'wishlist._id' => [
                            '$in' => $productObjectId
                        ]
                    ]
                ],
                [
                    '$project' => [
                        '_id' => 1,
                        'email' => 1,
                        'matchingWish' => [
                            '$filter' => [
                                'input' => '$wishlist',
                                'as' => 'wish',
                                'cond' => [
                                    '$eq'=>['$$wish.notify',1]                                  
                                ]
                            ]
                        ],                      
                    ]
                ],
                [
                    '$unwind' => [
                        'path' => '$matchingWish',
                        'preserveNullAndEmptyArrays' => true
                    ]
                ],
                [
                    '$match' => [
                        'matchingWish._id' => ['$in' => $productObjectId]
                    ]
                ],
                [
                    '$group' => [
                        '_id' => '$_id',
                        'matchingWish' => ['$addToSet'=>'$matchingWish'],
                        'email' => ['$first'=>'$email']
                    ]
                ]               
            );        
            //$r = DB::collection('test')->insert($usersWithSaleProduct['result'], ['upsert' => true]);
        }

    }

}
