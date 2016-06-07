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

use AlcoholDelivery\Orders as Orders;
use AlcoholDelivery\User as User;

class OrderController extends Controller
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
	public function getDetail($id)
	{
		$order = Orders::find($id);

		if(!empty($order)){

			$order = $order->toArray();



			$order['user'] = user::where('_id',"=",$order['user'])->first(['name','email','mobile_number','status','created_at','address']);
			$order['user'] = $order['user']->toArray();

			$order['dateslug'] = date("F d, Y H:i:s",strtotime($order['created_at']));
			$order['status'] = 0;
			$order['timeslot']['dateslug'] = date("F d, Y",$order['timeslot']['datekey']);


			return response($order,200);

		}

		return response(['success'=>false,"message"=>"Order not found"],400);		
		
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
		
		return response(array("success"=>false,"message"=>"Something went worng"));
		
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

	public function getOrder($dealerId){

		$dealerObj = new Orders;

		$result = $dealerObj->getDealers(array(
						"key"=>$dealerId,
						"multiple"=>false
					));
		
		return response($result, 201);

	}

	public function postOrders(Request $request)
	{
		
		//return response('NOT ',401);
		
		$params = $request->all();

		$orders = new Orders;

			//$columns = array('_id',"created_at",'contacts','address','title','status');
		
		/* Individual column filtering */

		// foreach($columns as $fieldKey=>$fieldTitle)
		// {

		//     if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
		//     {   
		//         if($fieldTitle=="status"){
					
		//             $dealers = $dealers->where($fieldTitle, "=",(int)$params[$fieldTitle]);

		//         }else{

		//             $dealers = $dealers->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");

		//         }

		//     }
		// }
					  

					  
		/*
		 * Ordering
		 */
		
			// if ( isset( $params['order'] ) )
			// {

			//     foreach($params['order'] as $orderKey=>$orderField){

			//         if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
						
			//             $dealers = $dealers->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
						
			//         }
			//     }

			// }
		
		/* Data set length after filtering */        

		$iFilteredTotal = $orders->count();

		/*
		 * Paging
		 */
			// if ( isset( $params['start'] ) && $params['length'] != '-1' )
			// {
			//     $dealers = $dealers->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
			// }

		$iTotal = $orders->count();

		$orders = DB::collection('orders')->raw(function($collection) use($params){
			return $collection->aggregate(array(      
				array(
					'$limit' => intval( $params['length'] )
				),          
				array(
					'$skip' => intval( $params['start'] )
				),
				array(
					'$project' => array(
						'_id'=>1,
						'service'=>1,
						'reference'=>1,
						'delivery.type'=>1,
						'nonchilled'=>1,
						'total'=>1,
						// 'quantity' => array(
						// 	'$size' => '$products'
						// ),
						'created_at'=>1,
						'timeslot'=>1,
						'user'=>1
					),
				),				
				array(
					'$sort' => array('created_at'=> -1) 
				)
			));
		});

		
		/*
		 * Output
		 */
		
		

		foreach($orders['result'] as $key=>$order) {
			$users[] = (string)$order['user'];
		}
		
		

		$users = User::whereIn('_id', $users)->get(["email","name"]);
		$users = $users->toArray();
		foreach($users as $key=>$user){
			$users[$user['_id']] = $user;
			unset($users[$key]);
		}

		$records = array(
			"iTotalRecords" => $iTotal,
			"iTotalDisplayRecords" => $iFilteredTotal,
			"data" => array()
		);

		$status_list = array(            
			array("warning" => "Under Process"),
			array("notice" => "Dispatch"),
			array("success" => "Delivered")
		);

		$deliveryType = array(			
			array("notice" => "Express"),
			array("success" => "Advance")
		);


		$srStart = intval( $params['start'] );
        if($params['order'][0]['column']==1 && $params['order'][0]['dir']=='desc'){
            $srStart = intval($iTotal);
        }

		$i = 1;
		
		foreach($orders['result'] as $key=>$order) {

			$row=array();

			if($params['order'][0]['column']==1 && $params['order'][0]['dir']=='desc'){
				$row[] = $srStart--;//$row1[$aColumns[0]];
			}else{
				$row[] = ++$srStart;//$row1[$aColumns[0]];
			}

			$status = $status_list[0];
			
			$row[] = $order['reference'];

			$row[] = ucfirst(getUserName($users[(string)$order['user']]));
			
			$row[] = rand(3,10); //"$order['quantity']";

			
			$delivery = $deliveryType[(int)$order['delivery']['type']];			
			$row[] = '<span class="label label-sm label-'.(key($delivery)).'">'.(current($delivery)).'</span>';

			$row[] = '<span class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span>';

			// $row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$order['_id'].'\')" id="'.$order['_id'].'" data-table="dealer" data-status="0" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';

			$row[] = '<a title="" ui-sref=userLayout.orders.show({order:"'.$order['_id'].'"}) class="btn btn-xs default"><i class="fa fa-search"></i></a>';
			
			$records['data'][] = $row;
		}
		
		return response($records, 201);
		
	}

	public function missingMethod($parameters = array())
	{
	    prd('Method Missing');
	}

}
