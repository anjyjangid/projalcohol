<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\SaleRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Sale;
use MongoId;

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
        //$model = Sale::find($id);
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

        $model = new Sale();

        $project = $model->project();

        $group = $model->group();        

        $project['_id'] = '$_id';
        $project['saleProductDetail'] = ['$arrayElemAt' => [ '$saleProductDetail', 0 ]];
        $project['saleCategoryDetail'] = ['$arrayElemAt' => [ '$saleCategoryDetail', 0 ]];
        $project['actionProductDetail'] = ['$arrayElemAt' => [ '$actionProductDetail', 0 ]];

        $group['_id'] = '$_id';
        $group['saleProductDetail'] = ['$push'=>'$saleProductDetail'];
        $group['saleCategoryDetail'] = ['$push'=>'$saleCategoryDetail'];
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
    public function update(SaleRequest $request, $id)
    {
        $inputs = $request->all();

        $this->validateItems($inputs,$id);                   

        $sale = Sale::find($id);
        
        if($sale){

            $sale->update($inputs);

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
        //
    }


    public function postList(Request $request){
        
        $params = $request->all();        

        extract($params);
        
        $sale = new Sale;

        $iTotalRecords = $sale->count();        

        $columns = array('_id','title','status','type');

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

    public function validateItems(&$inputs, $id){

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

    }

}
