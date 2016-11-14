<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\DealerRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;
use AlcoholDelivery\Products;
use DB;

use AlcoholDelivery\Dealer as Dealer;
use Illuminate\Support\Facades\Auth;

class DealerController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('admin');        
    }
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
    public function store(DealerRequest $request)
    {        
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];

        $dealer = Dealer::create($inputs);    

        return $dealer;
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
    **/
    public function update(DealerRequest $request, $id)
    {
        $inputs = $request->all();

        $dealer = dealer::find($id);
        
        $dealer->title = $inputs['title'];
        $dealer->address = $inputs['address'];
        $dealer->contacts = $inputs['contacts'];
        $dealer->status = (int)$inputs['status'];    
        $dealer->description = $inputs['description'];
        
        if($dealer->save()){
            return response(array("success"=>true,"message"=>"Dealer updated successfully"));
        }
        
        return response(array("success"=>false,"message"=>"Something went wrong"));
        
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($ids)
    {        
        $keys = explode(",", $ids);
    	
    	try {

    		$dealers = Dealer::whereIn('_id', $keys)->delete();

    	} catch(\Illuminate\Database\QueryException $e){

    		return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

    	}

        return response(array("success"=>true,"message"=>"Record(s) Removed Successfully"));
    }

    public function getDealer($dealerId){

        $dealerObj = new Dealer;

        $result = $dealerObj->getDealers(array(
                        "key"=>$dealerId,
                        "multiple"=>false
                    ));
        
        return response($result, 201);

    }

    public function postDealers(Request $request)
    {
        
        $params = $request->all();

        extract($params);

        $columns = ['_id','smallTitle','status'];

        $project = ['title'=>1,'status'=>1,'contacts'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $query = [];

        if(isset($name) && trim($name)!=''){
            $s = "/".$name."/i";
            $query[]['$match']['title'] = ['$regex'=>new \MongoRegex($s)];
        }
        
        $query[]['$project'] = $project;

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = Dealer::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Dealer::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);        
        
    }    
    
    public function getList(){
        $dealers = Dealer::where('status','=',1)->get(['_id','title']);                
        return response($dealers,201);
    }

    public function getDealerproduct(Request $request,$id){
        
        $dealerObj = new Dealer;

        $dealer = $dealerObj->getDealers(array(
                        "key"=>$id,
                        "multiple"=>false
                    ));

        if($dealer && isset($dealer['address']['country'])){
            $country = DB::collection('countries')->where('_id', $dealer['address']['country'])->first();
        }

        $query = [];

        $userStoreId = Auth::user('admin')->storeId;

        $project = [
            'name'=>'$name',            
            'dealerId'=>'$dealers',
            'sku'=>'$sku'
        ];

        $project['store'] = [
            '$filter'=>[
                'input' => '$store',
                'as' => 'store',
                'cond' => ['$eq'=>['$$store.storeId',$userStoreId]]
            ]    
        ];

        $query[]['$match'] = [
            'dealerId' => ['$elemMatch'=>['$in'=>[$id]]]
        ];

        $query[]['$lookup'] = [
            'from'=>'stocks',
            'localField'=>'_id',
            'foreignField'=>'productObjId',
            'as'=>'store'
        ];          

        $query[]['$project'] = $project;

        $query[]['$unwind'] = ['path' => '$store','preserveNullAndEmptyArrays' => true];

        $project['store'] = '$store';

        $project['quantity'] = ['$cond'=>['$store','$store.quantity',0]];

        $project['maxQuantity'] = ['$cond'=>['$store','$store.maxQuantity',0]];

        $project['threshold'] = ['$cond'=>['$store','$store.threshold',0]];

        $project['sum'] = [
            '$cond' => [
                '$store',
                [
                    '$subtract' => [
                        ['$divide'=>['$store.quantity','$store.maxQuantity']],
                        ['$divide'=>['$store.threshold','$store.maxQuantity']]
                    ]
                ],
                -1,
            ]               
        ];

        $query[]['$project'] = $project;        

        $query[]['$sort'] = ['sum'=>1];                
        
        $products = Products::raw()->aggregate($query);             
        
        $res = [
            'dealer' => $dealer,
            'products' => $products['result'],
            'country' => $country
        ];    

        return response($res,200);
    }
}
