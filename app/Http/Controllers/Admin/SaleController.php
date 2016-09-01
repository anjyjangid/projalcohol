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

        //CONVERT TO OBJECT ID FOR LOOKUP
        if(isset($inputs['saleProductId']) && !empty($inputs['saleProductId'])){
            foreach ($inputs['saleProductId'] as $key => $value) {
                $inputs['saleProductId'][$key] = $value;
                $inputs['saleProductObjectId'][$key] = new MongoId($value);
            }
        }

        if(isset($inputs['saleCategoryId']) && !empty($inputs['saleCategoryId'])){
            foreach ($inputs['saleCategoryId'] as $key => $value) {
                $inputs['saleCategoryId'][$key] = $value;
                $inputs['saleCategoryObjectId'][$key] = new MongoId($value);
            }
        }

        if(isset($inputs['actionProductId']) && !empty($inputs['actionProductId'])){
            foreach ($inputs['actionProductId'] as $key => $value) {
                $inputs['actionProductId'][$key] = $value;
                $inputs['actionProductObjectId'][$key] = new MongoId($value);
            }
        }   

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
}
