<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\CouponRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;

use AlcoholDelivery\Coupon as Coupon;
use AlcoholDelivery\Products as Products;

class CouponController extends Controller
{

	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		
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
	public function store(CouponRequest $request)
	{

		$inputs = $request->all();
		
		$inputs['status'] = (int)$inputs['status'];
		$inputs['type'] = (int)$inputs['type'];	
		
		try {

			Coupon::create($inputs);

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Coupon created successfully"),200);
		
		
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show($id)
	{

		$result = Coupon::where("_id",$id)->first();

		return response($result, 201);

	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function getDetail($id)
	{
		$coupon = new coupon;
		$result = $coupon->getCoupon($id);

		return response($result, 201);

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(CouponRequest $request, $id)
	{   

		$coupon = Coupon::find($id);

		if(is_null($coupon)){

			return response(array("success"=>false,"message"=>"Invalid Request :: Record you want to update is not exist"));

		}

		$inputs = $request->all();            

		$coupon->code = $inputs['code'];
		$coupon->status = (int)$inputs['status'];		
		$coupon->type = (int)$inputs['type'];		
		$coupon->discount = (float)$inputs['discount'];

		try {

			$coupon->save();

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Coupon Updated successfully"));

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

			$coupons = Coupon::whereIn('_id', $keys)->delete();

		} catch(\Illuminate\Database\QueryException $e){

			return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

		}

		return response(array($coupons,"success"=>true,"message"=>"Record(s) Removed Successfully"));
	}

	public function postImport(Request $request){
		$params = $request->all();


		$handle = fopen($params['csv']->getRealPath(), "r");

		$skipLines = 2;

		if ($handle) {
			$inputs = [];
			$coupons = [];
			$i = 0;
			while (($line = fgets($handle)) !== false) {
				$i++;
				if($skipLines){
					$skipLines--;
					continue;
				}

				$line = explode(',', $line);

				$line[0] = strtoupper($line[0]);

				$input = ['code'=>$line[0], 'type'=>$line[2]=='$'?1:0, 'discount'=>(int)$line[3], 'status'=>$line[8]=='0'?0:1];

				$coupons[] = $line[0];

				$req = new CouponRequest($input);

				$validator = Validator::make($req->all(), $req->rules(), $req->messages());

				if ($validator->fails()){
					$err = ['err' => $validator->errors()->all()];
					$err['row_number'] = $i;
					$err['data'] = $input;
					return response($err, 422);
				}

				$inputs[] = $req->all();
			}

			if(count($coupons) != count(array_unique($coupons)))
				return response("There are multiple entries with same coupon code!", 400);

			try {
				$resp =  \DB::collection('coupons')->insert($inputs);

				return response($resp, 200);
			} catch(\Exception $e){
				return response(array("success"=>false,"message"=>$e->getMessage()),400);
			}
			fclose($handle);
		} else {
			return response("Error reading file!", 400);
		}
	}

	public function postListing(Request $request,$id = false)
	{
		$params = $request->all();

        extract($params);

        $columns = ['_id','_id','smallTitle','discount','type','status'];

        $project = ['image'=>1,'code'=>1,'discount'=>1,'type'=>1,'status'=>1];

        $project['smallTitle'] = ['$toLower' => '$code'];

        $query = [];
        
        $query[]['$project'] = $project;

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = Coupon::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Coupon::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);


		$params = $request->all();

		$coupons = new Coupon;                

		$columns = array('_id','code',"type","discount","status");
		$indexColumn = '_id';
		$table = 'coupons';

		/* Individual column filtering */    

		foreach($columns as $fieldKey=>$fieldTitle)
		{              

			if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
			{
							
				if($fieldTitle=="status"){

					$coupons = $coupons->where($fieldTitle, '=', (int)$params[$fieldTitle]);
				}
				else{

					$coupons = $coupons->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");

				}
							
			}
		}
	
		/*
		 * Ordering
		 */        

		if ( isset( $params['order'] ) )
		{

			foreach($params['order'] as $orderKey=>$orderField){

				if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
					
					$coupons = $coupons->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
					
				}
			}

		}
		
		/* Data set length after filtering */        

		$iFilteredTotal = $coupons->count();

		/*
		 * Paging
		 */
		if ( isset( $params['start'] ) && $params['length'] != '-1' )
		{
			$coupons = $coupons->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
		}

		$iTotal = $coupons->count();

		$coupons = $coupons->get($columns);

		$coupons = $coupons->toArray();
				
		/*
		 * Output
		 */
		 
		
		$records = array(
			"iTotalRecords" => $iTotal,
			"iTotalDisplayRecords" => $iFilteredTotal,
			"data" => array()
		);

			 
		
		$status_list = array(            
			array("warning" => "in-Active"),
			array("success" => "Active")
		  );



		$srStart = intval( $params['start'] );
		if($params['order'][0]['column']==1 && $params['order'][0]['dir']=='desc'){
			$srStart = intval($iTotal);
		}

		$i = 1;

		foreach($coupons as $key=>$value) {

			$row=array();

			$row[] = '<input type="checkbox" name="id[]" value="'.$value['_id'].'">';

			if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
				$row[] = $srStart--;//$row1[$aColumns[0]];
			}else{
				$row[] = ++$srStart;//$row1[$aColumns[0]];
			}

			$status = $status_list[(int)$value['status']];

			$row[] = ucfirst($value['code']);

			$row[] = $value['discount'];

			$row[] = (int)$value['type']?'Fixed':"Percentage";
			
			$row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="coupons" data-status="'.((int)$value['status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
			$row[] = '<a title="Edit : '.$value['code'].'" href="#/coupon/edit/'.$value['_id'].'" href="#/coupon/show/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
			
			$records['data'][] = $row;
		}
		
		return response($records, 201);
		
	}


}
