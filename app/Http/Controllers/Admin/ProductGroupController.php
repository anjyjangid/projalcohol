<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\ProductGroupRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\ProductGroups;


class ProductGroupController extends Controller
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
    public function store(ProductGroupRequest $request)
    {
        $inputs = $request->all();
        
        $this->castVariables($inputs);

        $productgroup = ProductGroups::create($inputs);

        if($productgroup){
            return response($productgroup,201);
        }else{          
            return response('Unable to add group',422);
        } 

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
    public function update(ProductGroupRequest $request, $id)
    {
        $inputs = $request->all();
        
        $this->castVariables($inputs);

        $productgroup = ProductGroups::find($id);

        if($productgroup){
            $productgroup->update($inputs);

            return response($productgroup,201);
        }else{
            return response('Unable to update group',400);
        }
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

        $query = [];

        if(isset($name) && trim($name)!=''){
            $s = "/".$name."/i";
            $query[]['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
        }

        $columns = ['_id','name','created_at','updated_at'];

        $project = ['name'=>1,'created_at'=>1,'updated_at'=>1];

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
        
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }
        
        $query[]['$sort'] = $sort;

        $model = ProductGroups::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = ProductGroups::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);
    }    

    public function getDetail($id)
    {               
        $model = ProductGroups::where('_id',$id)->first();           
        return response($model,200);
    }

    private function castVariables(&$inputs){
        $inputs['tradeQuantity'] = (int)$inputs['tradeQuantity'];
        $inputs['tradeValue'] = (int)$inputs['tradeValue'];
        $inputs['cartonQuantity'] = (int)$inputs['cartonQuantity'];
        $inputs['cartonPurchased'] = (int)$inputs['cartonPurchased'];
        if(isset($inputs['minOrder']))
            $inputs['minOrder'] = (int)$inputs['minOrder'];
    }

    public function getListgroup(){
        $groups = ProductGroups::get(['_id','name']);                
        return response($groups,201);
    }
}
