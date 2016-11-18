<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\ProductRequest;
use AlcoholDelivery\Http\Controllers\Controller;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Products;
use AlcoholDelivery\User;
use AlcoholDelivery\Dealer;
use AlcoholDelivery\Store;
use MongoId;
use Input;
use DB;
use AlcoholDelivery\Setting;
use AlcoholDelivery\Email;
use AlcoholDelivery\Inventory;
use AlcoholDelivery\Stocks;
use AlcoholDelivery\Sale;
use AlcoholDelivery\Orders;
use Illuminate\Support\Facades\Auth;

use Faker;

class ProductController extends Controller
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
	public function store(ProductRequest $request)
	{    
			
		$inputs = $request->all();
		
		$this->castVariables($inputs);

		$product = Products::create($inputs);            

		if($product){
			
			//UPDATE STOCKS FOR THE LOGGEDIN STORE
			$product->updateStocks($inputs,$product->_id);

			$dealers = Dealer::whereIn('_id',$inputs['dealerId'])->get();
			//ADD PRODUCT IDS IN DEALERS TABLE
			foreach ($dealers as $dkey => $dvalue) {
				$dvalue->push('productId',$product->_id,true);
				$dvalue->push('productObjectId',new MongoId($product->_id),true);
			}

			//ADD REFRENCE TO SUGGESTION PRODUCTS
			if(!empty($inputs['suggestionId'])){
				$suggested = Products::whereIn('_id',$inputs['suggestionId'])->get();
				foreach ($suggested as $key => $value) {
					$value->push('suggestedId',$product->_id,true);
					$value->push('suggestedObjectId',new MongoId($product->_id),true);
				}
			}	

			//STORE THE PRODUCT IMAGES
			$files = $inputs['imageFiles'];				

			$this->saveImages($product,$files);

			return response($product,201);

		}else{          
			return response('Unable to add product',422);
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
			$galleryObj = new Products;
			return $galleryObj->getSingleProduct($id);								
	}

	public function getDetail($id)
	{				
		$model = Products::where('_id',$id)->with('store')->with('suggestions')->first();			
		return response($model,200);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function postUpdate(ProductRequest $request, $id)
	{
		$inputs = $request->all();				
		
		$this->castVariables($inputs);

		$product = Products::find($id);
		
		if($product){          

			//UPDATE STOCKS FOR THE LOGGEDIN STORE
			$product->updateStocks($inputs,$product->_id);

			$dealers = Dealer::whereIn('_id',$inputs['dealerId'])->get();
			//ADD PRODUCT IDS IN DEALERS TABLE
			foreach ($dealers as $dkey => $dvalue) {
				$dvalue->push('productId',$product->_id,true);
				$dvalue->push('productObjectId',new MongoId($product->_id),true);
			}
			//UPDATE FOR REMOVED DEALERS
			$removedDealers = array_diff($product->dealerId, $inputs['dealerId']);
			if($removedDealers){
				$rdealers = Dealer::whereIn('_id',$removedDealers)->get();
				foreach ($rdealers as $rdkey => $rdvalue) {
					$rdvalue->pull('productId',$product->_id);
					$rdvalue->pull('productObjectId',new MongoId($product->_id));
				}
			}
			
			//ADD REFRENCE TO SUGGESTION PRODUCTS
			if(!empty($inputs['suggestionId'])){
				$suggested = Products::whereIn('_id',$inputs['suggestionId'])->get();
				foreach ($suggested as $key => $value) {
					$value->push('suggestedId',$product->_id,true);
					$value->push('suggestedObjectId',new MongoId($product->_id),true);
				}
			}

			//UPDATE FOR REMOVED SUGGESTION
			$removedSuggestion = array_diff($product->suggestionId, $inputs['suggestionId']);
			if($removedSuggestion){
				$rsuggestions = Products::whereIn('_id',$removedSuggestion)->get();
				foreach ($rsuggestions as $rdkey => $rdvalue) {
					$rdvalue->pull('suggestedId',$product->_id);
					$rdvalue->pull('suggestedObjectId',new MongoId($product->_id));
				}
			}

			//UNSET THE PRICING IF EXISTS AND NOT SET
			if(isset($inputs['unsetFields']) && !empty($inputs['unsetFields'])){
				foreach ($inputs['unsetFields'] as $key => $value) {
					$product->unset($value);
				}	
			}

			//STORE THE PRODUCT IMAGES
			$files = $inputs['imageFiles'];
			$this->saveImages($product,$files);

			//UPDATE PRODUCT
			$product->update($inputs);

			return response($product,201);

		}else{
			return response('Product not found.',422);
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


	public function postProductlist(Request $request){

		$params = $request->all();        

		extract($params);

		$query = [];

		if(isset($name) && trim($name)!=''){
			$s = "/".$name."/i";
			$query[]['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
		}

		if(isset($params['categories']) && trim($params['categories'])!=''){          
			$query[]['$match']['categories'] = $params['categories'];					
		}

		if(isset($params['status']) && trim($params['status'])!=''){
			$query[]['$match']['status'] = (int)$params['status'];
		}

		if(isset($params['isFeatured']) && trim($params['isFeatured'])!=''){
			$query[]['$match']['isFeatured'] = (int)$params['isFeatured'];
		}

		$columns = array('_id','smallTitle','categories','price','status','isFeatured','quantity','store','updated_at');

		$project = ['name'=>1,'categoriesObject'=>1,'price'=>1,'status'=>1,'isFeatured'=>1,'updated_at'=>1];
		
		$project['smallTitle'] = ['$toLower' => '$name'];

		$project['category'] = ['$arrayElemAt'=> [ '$categoriesObject', 0 ]];

		$project['subcategory'] = ['$arrayElemAt'=> [ '$categoriesObject', 1 ]];			

		//GET CURRENT USER STOCK FOR THE PRODUCT
		$userStoreId = Auth::user('admin')->storeId; 

    	$query[]['$lookup'] = [
			'from'=>'stocks',
			'localField'=>'_id',
			'foreignField'=>'productObjId',
			'as'=>'store'
    	];

    	//FILTER A PARTICULAR STOCK BY USER ID
    	$project['store'] = [
    		'$filter'=>[
                'input' => '$store',
                'as' => 'store',
                'cond' => ['$eq'=>['$$store.storeId',$userStoreId]]
            ]
    	];	    	

		$query[]['$project'] = $project;
		
		//GET PARENT CATEGORY DETAIL
		$query[]['$lookup'] = [
			'from'=>'categories',
			'localField'=>'category',
			'foreignField'=>'_id',
			'as'=>'categoryDetail'
    	];

    	//GET SUB CATEGORY DETAIL
		$query[]['$lookup'] = [
			'from'=>'categories',
			'localField'=>'subcategory',
			'foreignField'=>'_id',
			'as'=>'subcategoryDetail'
    	];

		//Get 0th element from all the lookup field
		$query[]['$unwind'] = [
			'path' => '$store',
			'preserveNullAndEmptyArrays' => true
		];
		$query[]['$unwind'] = [
			'path' => '$categoryDetail',
			'preserveNullAndEmptyArrays' => true
		];
		$query[]['$unwind'] = [
			'path' => '$subcategoryDetail',
			'preserveNullAndEmptyArrays' => true
		];    	

		$project['store'] = '$store';
		$project['quantity'] = ['$cond'=>['$store','$store.quantity',0]];			
		$project['categoryDetail'] = '$categoryDetail';
		$project['subcategoryDetail'] = '$subcategoryDetail';

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

	protected function saveImages($product,$files){

		if($product){
					$filearr = [];
					foreach ($files as $key => $file) {
							$image = @$file['thumb']; 

							if($image){

									$destinationPath = storage_path('products');
									$filename = $product->_id.'_'.$key.'.'.$image->getClientOriginalExtension();
									
									if (!File::exists($destinationPath.'/200')){
											File::MakeDirectory($destinationPath.'/200',0777, true);
									}
									if (!File::exists($destinationPath.'/400')){
											File::MakeDirectory($destinationPath.'/400/',0777, true);
									}

									Image::make($image)->resize(400, null, function ($constraint) {
											$constraint->aspectRatio();
									})->save($destinationPath.'/400/'.$filename);

									Image::make($image)->resize(200, null, function ($constraint) {
											$constraint->aspectRatio();
									})->save($destinationPath.'/200/'.$filename);

									$upload_success = $image->move($destinationPath, $filename);  

							}else{
								$filename = @$file['source'];
							}

							$cover = (int)@$file['coverimage'];

							$filearr[] = [
									'source' => $filename,
									'label' => @$file['label'],
									'order' => @$file['order'],
									'coverimage' => $cover,
							];
					}

					if(!empty($filearr)){
							$product->imageFiles = $filearr;
							$product->save();
					}
			}

	}

	public function postOrderproduct(Request $request){

		$params = $request->all();

		$products = new Products;

		extract($params);      

		$query = [];

		if(isset($params['search']['value']) && trim($params['search']['value'])!=''){
			$sval = $params['search']['value'];
			$products = $products->where('name','regexp', "/.*$sval/i");
			
			$query[]['$match']['name'] = ['$regex'=>new \MongoRegex("/".$sval."/i")];
		}

		$query[]['$lookup'] = [
			'from'=>'stocks',
			'localField'=>'_id',
			'foreignField'=>'productObjId',
			'as'=>'store'
    	];
		
		$project = ['_id'=>1,'name'=>1];
		
		$userStoreId = Auth::user('admin')->storeId; 

		$project['store'] = [
    		'$filter'=>[
                'input' => '$store',
                'as' => 'store',
                'cond' => ['$eq'=>['$$store.storeId',$userStoreId]]
            ]
    	];

    	$query[]['$project'] = $project;

		$query[]['$unwind'] = [
			'path' => '$store',
			'preserveNullAndEmptyArrays' => true
		];    	

		$project['store'] = '$store';
		$project['quantity'] = ['$cond'=>['$store','$store.quantity',0]];
		$project['maxQuantity'] = ['$cond'=>['$store','$store.maxQuantity',0]];
		$project['threshold'] = ['$cond'=>['$store','$store.threshold',0]];		


		$query[]['$project'] = $project;

		$project['reqFactor'] = [
			'$cond' => [
                ['$gt'=>['$maxQuantity',0]],
				[
					'$subtract' => [
	                	['$divide'=>['$quantity','$maxQuantity']],
	                	['$divide'=>['$threshold','$maxQuantity']]
	                ]	
	            ],
	            null
            ]
		];

		$project['quantity'] = '$quantity';
		$project['maxQuantity'] = '$maxQuantity';
		$project['threshold'] = '$threshold';

		$query[]['$project'] = $project;

		$query[]['$lookup'] = [
			'from'=>'dealers',
			'localField'=>'_id',
			'foreignField'=>'productObjectId',
			'as'=>'supplier'
    	];


    	$columns = ['name','quantity'];

    	$sort = ['reqFactor'=>1];

		if(isset($params['order']) && !empty($params['order'])){
			$field = $columns[$params['order'][0]['column']];
			$direction = $params['order'][0]['dir'];
			$sortField = $field;
			$sortBy = ($params['order'][0]['dir'] == 'desc')?-1:1;
			$sort = [$sortField=>$sortBy];			
		}

		$query[]['$sort'] = $sort;

		$model = Products::raw()->aggregate($query);

		$result = [];
		
		if(isset($model['result'])){
			$result =  $model['result'];
		}

		$iTotalRecords = count($result);

		$query[]['$skip'] = (int)$start;
        	
    	if($length > 0)
    		$query[]['$limit'] = (int)$length;	

		$model = Products::raw()->aggregate($query);

		$dataResult = [];
		
		if(isset($model['result'])){
			$dataResult = $model['result'];
		}

		$response = [
			'recordsTotal' => $iTotalRecords,
			'recordsFiltered' => $iTotalRecords,
			'draw' => $draw,
			'length' => $length,
			'data' => $dataResult
		];

		return response($response,200);				
	}
	 
	public function postUpdateinventory(Request $request){

			$inputs = $request->all();
			
			$id = $inputs['_id'];

			$validator = Validator::make($inputs, [
					'quantity' => 'required|numeric',
					'threshold' => 'required|numeric|lt:maxQuantity',
					'maxQuantity' => 'required|numeric|gte:quantity',
			],[
				'maxQuantity.gte' => 'The value should be greater than or equals to the quantity.',
				'threshold.lt' => 'The value should be less than maximum quantity.',
			]);

			if ($validator->fails()){
					return response($validator->errors(), 422);
			}

			$product = Products::find($id);

			//$product->upda

			$product->quantity = $inputs['quantity'];
			$product->threshold = $inputs['threshold'];
			$product->maxQuantity = $inputs['maxQuantity'];

			//NOTIFY USER FOR AVAILABILITY
			if($product->quantity > 0){
				$userlist = User::where('productAddedNotification','all',[$id]);
				foreach ($userlist as $key => $value) {
					$username = (isset($value->name))?$value->name:$value->email;
					$data = [
						'email' => $value->email,
						'p_id' => $id,
						'username' => $username,
						'product_name' => $product->name
					];

					$email = new Email('notifyuseronproductadd');
					$email->sendEmail($data);

				}
			}

			if($product->save()){
				return response($product, 200);
			}else{
				return response('Error in updating inventory.', 422);
			}
	} 

	public function getSearchproduct(Request $request){
		
		$params = $request->all();
		$products = new Products;
		
		if(isset($params['parentCategory']) && trim($params['parentCategory'])!=''){          
			
			$products = $products->where('categories',$params['parentCategory']);

			if(isset($params['subCategory']) && trim($params['subCategory'])!=''){

				$products = $products->where('categories',$params['subCategory']);

			}

		}

		if(isset($params['qry']) && trim($params['qry'])!=''){
			$name = $params['qry'];
			$products = $products->where('name','regexp', "/.*$name/i");
		}

		$products = $products->where('status',1)->orderBy('name','desc')->get();

		return response($products,200);

	}

	public function getProductsearch(Request $request){

		$params = $request->all();

		if(!empty($params['categories']))
			$params['categories'] = explode(',', $params['categories']);
		$params['type'] = 0;
		$result = (new Products)->fetchProducts($params);


		$result = $result['products'];
		
		if(!empty($result['products'])){


			foreach ($result as $key => &$product) {
				$product['_id'] = (string)$product['_id'];
			}
		}

		return response($result, 200);
	}

	public function getTest(Request $request){

		$model = \AlcoholDelivery\PurchaseOrder::find('582d8af76e245f41af986a20');

        if($model){
            if(isset($model->advanceOrderId)){

            	//return gettype($model->advanceOrderId);	

                $orders = \AlcoholDelivery\Orders::whereRaw(['_id'=>['$in'=>$model->advanceOrderId]])->get();
                // prd($orders);
                return response(['PO'=>$model,'ORDER'=>$orders]);
            }
        }

        return response('Error');

		//USER ADDRESS UPDATE
		/*$users = User::whereRaw(['address'=>['$exists'=>true]])->get();

		foreach ($users as $key => $value) {			
			foreach($value->address as $address){
				
				if(isset($address['LNG']))
					User::raw()->update(['email'=>$value['email'],'address.LAT'=>$address['LAT']],['$set'=>['address.$.location'=>[$address['LNG'],$address['LAT']]]]);

			}			
		}*/
			
		$deliveryOrders = DB::collection('orders')->where('doStatus',1)->get(['reference']);

		return response($deliveryOrders);

		$query = [];
		
		$orderId = new MongoId('57ff62b0b190ec570e8b4592');

		$order = Orders::whereRaw(['_id'=>$orderId])->get(['_id','productsLog'])->first();

		$proQty = [];
		$ids = [];

		foreach ($order['productsLog'] as $key => $value) {
			$id = (string)$value['_id'];
			$proQty[$id] = $value['quantity'];
			$ids[] = $value['_id'];
		}	

		//dd($proQty,$ids);	

		$query[]['$match'] = [
			'_id' => ['$in'=>$ids]
		];

		$query[]['$lookup'] = [
			'from' => 'stocks',
			'localField' => '_id',
			'foreignField' => 'productObjId',
			'as' => 'storeStocks'
		];

		$query[]['$project'] = ['quantity'=>1,'storeStocks'=>1];

		$query[]['$unwind'] = [
			'path' => '$storeStocks',
			'preserveNullAndEmptyArrays' => true
		];

		$query[]['$sort'] = ['storeStocks.storeObjId' => 1];

		$query[]['$group'] = [
			'_id' => '$_id',
			'quantity' => ['$first' => '$quantity'],
			'storeStocks' => ['$push' => '$storeStocks']
		];
				
		$model = Products::raw()->aggregate($query);

		return response($model);

		$inventoryLog = [];
		exit;
		foreach ($model['result'] as $key => $value) {
			
			$product = Products::find($value['_id']);

			$qtyReq = $proQty[(string)$value['_id']];

			foreach ($value['storeStocks'] as $storeStockskey => $storeStocksvalue) {
				
				$storeStock = Stocks::find($storeStocksvalue['_id']);				
				$qtyFullFilled = true;
				//CHECK REQUIRED QTY MEETS THE STORE QTY
				if($storeStock->quantity < $qtyReq){
					$newQty = 0;
					$qtyToPull = $storeStock->quantity;
					$qtyFullFilled = false;
				}else{
					$newQty = $storeStock->quantity-$qtyReq;					
					$qtyToPull = $qtyReq;
				}

				//UPDATE QTY FOR THE STORE
				$storeStock->quantity = $newQty;
				$storeStock->save();

				//PREPARE TRANSACTION OF PRODUCT FOR THE STORE
				$inventoryLog[] = [
					'productId' => $value['_id'],
					'orderId' => $orderId,
					'storeId' => $storeStocksvalue['_id'],
					'quantity' => $qtyToPull
				];
				
				if($qtyFullFilled){
					break; //REQUIRED QTY MEETS THE STORE QTY THEN BREAK THE LOOP
				}else{
					$qtyReq -= $qtyToPull; //UPDATE THE REQUIRED QTY FIELD FOR NEXT STORE IN THE LOOP
				}
			}

			/*UPDATE TOTAL QTY IN PRODUCT COLLECTION*/
			$product->quantity -= $proQty[(string)$value['_id']];
			$product->save();

		}
		
		//INSERT INVENTORY LOG
		if($inventoryLog){
			$r = DB::collection('inventoryLog')->insert($inventoryLog);
		}
		

		//return response($model);

		

		/*$create = DB::collection('mytest')->insert(
			[
				'name' => 'test',
				'inventory' => [
					[
						'storeId' => new MongoId(),
						'productId' => new MongoId(),
						'quantity' => 5
					]
				]
			]
		);*/



		/*$u = DB::collection('mytest')->raw()->update(
			['inventory.storeId' => new MongoId('57e3dd31b190ec1b0d8b456a')],
			['$set' => ['inventory.$.quantity' => 9]]
		);
		dd($u);*/

	}

	private function castVariables(&$inputs){

		$inputs['price'] = (float)$inputs['price'];        
		$inputs['chilled'] = (int)$inputs['chilled'];
		$inputs['status'] = (int)$inputs['status'];
		$inputs['isFeatured'] = (int)$inputs['isFeatured'];
		$inputs['deliveryType'] = (int)$inputs['deliveryType'];
		$inputs['isLoyalty'] = (int)$inputs['isLoyalty'];		

		if(isset($inputs['loyaltyValueType'])){
			$inputs['loyaltyValueType'] = (int)$inputs['loyaltyValueType'];
		}

		if(isset($inputs['loyaltyValuePoint'])){
			$inputs['loyaltyValuePoint'] = (float)$inputs['loyaltyValuePoint'];
		}

		if(isset($inputs['loyaltyValuePrice'])){
			$inputs['loyaltyValuePrice'] = (float)$inputs['loyaltyValuePrice'];
		}
								
		
		if(isset($inputs['outOfStockType']))
			$inputs['outOfStockType'] = (int)$inputs['outOfStockType'];

		if(isset($inputs['availabilityDays']))
			$inputs['availabilityDays'] = (int)$inputs['availabilityDays'];
		
		if(isset($inputs['availabilityTime']))
			$inputs['availabilityTime'] = (int)$inputs['availabilityTime'];       

		$inputs['unsetFields'] = [];
		if (isset($inputs['express_delivery_bulk']['bulk']) && !empty($inputs['express_delivery_bulk']['bulk']))
		{
			foreach ($inputs['express_delivery_bulk']['bulk'] as $dKey => $discount)
			{
				unset($inputs['express_delivery_bulk']['bulk'][$dKey]['$$hashKey']);
				$inputs['express_delivery_bulk']['bulk'][$dKey] = [
					'from_qty' => (int)$discount['from_qty'],
					'to_qty' => (int)$discount['to_qty'],
					'type' => (int)$discount['type'],
					'value' => (float)$discount['value'],
				];                                
			}
		}else{
			$inputs['unsetFields'][] = 'express_delivery_bulk';
		}

		$inputs['bulkDisable'] = (int)($inputs['bulkDisable']);

		$inputs['loyalty'] = (int)($inputs['loyalty']);		

		if (isset($inputs['regular_express_delivery']['value']) && !empty($inputs['regular_express_delivery']['value'])){
			$inputs['regular_express_delivery']['value'] = (float)$inputs['regular_express_delivery']['value'];
		}else{
			$inputs['unsetFields'][] = 'regular_express_delivery';
		}

		//DEALERS WITH TRADE DEALS
		$dealerId = [];
		$dealerObjectId = [];				
		foreach ($inputs['dealerData'] as $key => $value) {
			unset($inputs['dealerData'][$key]['$$hashKey']);
			
			array_push($dealerObjectId, new MongoId($value['dealerId']));
			array_push($dealerId, (string)$value['dealerId']);
			//$inputs['dealers'][] = $value['dealerId'];
			if(isset($value['tradeQuantity']))
				$inputs['dealerData'][$key]['tradeQuantity'] = (int)$value['tradeQuantity'];
			if(isset($value['tradeValue']))
				$inputs['dealerData'][$key]['tradeValue'] = (int)$value['tradeValue'];
		}			

		$inputs['dealerId'] = $dealerId;
		$inputs['dealerObjectId'] = $dealerObjectId;

		//DEALERS WITH TRADE DEALS

		//SUGGESTIONS 
		$suggestionId = [];
		$suggestionObjectId = [];
		if(isset($inputs['suggestions']) && !empty($inputs['suggestions'])){
			foreach($inputs['suggestions'] as $product){
				array_push($suggestionObjectId, new MongoId($product['_id']));
				array_push($suggestionId, (string)$product['_id']);
			}
			$inputs['suggestionId'] = $suggestionId;
			$inputs['suggestionObjectId'] = $suggestionObjectId;
		}else{
			$inputs['suggestionId'] = [];
			$inputs['suggestionObjectId'] = [];
		}
		//SUGGESTIONS	
		
		//ADDING CATEGORY ID AS OBJECT
		$categoriesObject = [];
		if(isset($inputs['categories']) && !empty($inputs['categories'])){
			foreach($inputs['categories'] as $categories){
				$categoriesObject[] = new MongoId($categories);
			}
			$inputs['categoriesObject'] = $categoriesObject;
		}
	}

	public function getUpdatep(Request $request){

		/*$query = [];
		$query[]['$match'] = [
			'_id' => new MongoId('57c6b38eb190ecc02e8b4577')
		];

		$query[]['$unwind'] = [
			'path' => 'categoriesObject',
			'preserveNullAndEmptyArrays' => true
		];

		$query[]['$lookup'] = [
			'from'=>'categories',
			'localField'=>'categoriesObject',
			'foreignField'=>'_id',
			'as'=>'productCategories'
		];

		$p = Products::raw()->aggregate($query);

		dd($p);*/

		$giftcategory = \AlcoholDelivery\GiftCategory::all();

		foreach ($giftcategory as $key => $value) {
			if(isset($value->parent)){
				$value->parentObject = new MongoId($value->parent);
				$value->save();
			}
		}

		//dd($giftcategory);

		$gift = \AlcoholDelivery\Gift::all();

		foreach ($gift as $key => $value) {
			if(isset($value->category)){
				$value->categoryObject = new MongoId($value->category);
			}
			if(isset($value->subcategory)){
				$value->subcategoryObject = new MongoId($value->subcategory);
			}
			$value->save();
		}
		
		dd($gift);

		$products = Products::all();	

		foreach ($products as $key => $product) {			
			
			$categoriesObject = [];
			foreach($product->categories as $categories){
				$categoriesObject[] = new MongoId($categories);
			}
			$product->categoriesObject = $categoriesObject;
			$product->save();			
		}

		dd('done');

	}	

	public function postStores(Request $request){

		$req = $request->all();
		
		extract($req);	

		$stores = Store::all()->toArray();		

		$query = [];

		$query[]['$lookup'] = [
			'from' => 'stocks',
			'localField' => '_id',
			'foreignField' => 'productObjId',
			'as' => 'storeproduct'
		];		

		$storeFields = [];
		$unwinds = [];		
		$sortCol[] = '';
		$columns[] = ['title'=>'Product Name','data'=>'name'];		
		$pro = [];
		$storeQtyKeys = [];
		$pro2 = [];
		$sortCol[] = 'name';
		foreach ($stores as $key => $value) {
			$qkey = 'store'.$key;
			$storeQtyKeys[] = '$'.$qkey;
			$columns[] = ['title'=>$value['name'],'data'=>$qkey];
			$unwinds[]['$unwind'] = [
                'path' => '$'.$value['_id'],
                'preserveNullAndEmptyArrays' => true,                            
            ];
			$storeFields[$value['_id']] = [
				'$filter'=>[
	                'input' => '$storeproduct',
	                'as' => 'storeproduct',
	                'cond' => ['$eq'=>['$$storeproduct.storeId',$value['_id']]]
            	]
            ];

            $pro[$qkey] = [
            	'$cond'=>['$'.$value['_id'],'$'.$value['_id'].'.quantity',0]
            ];

            $pro2[$qkey] = '$'.$qkey;
            $sortCol[] = $qkey;
		}

		
		$columns[] = ['title'=>'Total Qty','data'=>'totalQty'];
		$sortCol[] = 'totalQty';
		//RETURN IN CASE ONLY COLOUMNS HAS TO DRAWN
		if(isset($req['storeOnly']) && $req['storeOnly'] == 1){
			return response($columns,200);
		}

		$storeFields['name'] = '$name';
		
		$query[]['$project'] = $storeFields;

		$query = array_merge($query,$unwinds);		

		$pro['name'] = '$name';

		$query[]['$project'] = $pro;		

		$pro['totalQty'] = ['$sum'=>$storeQtyKeys];				

		$pro = array_merge($pro,$pro2);

		$query[]['$project'] = $pro;

		if(isset($order[0]['column']) && $order[0]['column']!=''){

			$ordCol = $sortCol[$order[0]['column']];
			$ordDir = ($order[0]['dir'] == 'desc')?-1:1;

			$query[]['$sort'] = [$ordCol=>$ordDir];

		}

		$query[]['$skip'] = (int)$start;

		if(isset($length) && $length>0)
			$query[]['$limit'] = (int)$length;

		$products = new Products;

		if(isset($search['value']) && trim($search['value'])!=''){
			$name = $search['value'];
			$products = $products->where('name','regexp', "/.*$name/i");
			$s = "/".$name."/i";
			$query[]['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
		}



		$model = Products::raw()->aggregate($query);	

		//return response($query);

		$iTotalRecords = $products->count();

		$data = [
			'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
			'data' => $model['result']			
		];

		return response($data);

	}

	public function compareData($old,$new){
        return array_values(array_diff(array_merge($old,$new),$old));
    }
}
		