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
use MongoId;
use Input;
use DB;
use AlcoholDelivery\Setting;
use AlcoholDelivery\Email;
use AlcoholDelivery\Inventory;
use AlcoholDelivery\Stocks;
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

				$products = new Products;

				$query = [];

				if(isset($name) && trim($name)!=''){
					$products = $products->where('name','regexp', "/.*$name/i");
					$s = "/".$name."/i";
					$query[]['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
				}

				if(isset($params['categories']) && trim($params['categories'])!=''){          
					$products = $products->where('categories',$params['categories']);
					$query[]['$match']['categories'] = $params['categories'];					
				}

				if(isset($params['status']) && trim($params['status'])!=''){
					$products = $products->where('status',(int)$params['status']);					
					$query[]['$match']['status'] = (int)$params['status'];
				}

				if(isset($params['isFeatured']) && trim($params['isFeatured'])!=''){
					$products = $products->where('isFeatured',(int)$params['isFeatured']);					
					$query[]['$match']['isFeatured'] = (int)$params['isFeatured'];
				}        

				$iTotalRecords = $products->count();        

				$columns = array('_id','name','categories','price','status','isFeatured','quantity','store','updated_at');

				/*$sortField = 'created_at';
				$sortBy = -1;*/        

				$sort = ['updated_at'=>-1];

				if(isset($params['order']) && !empty($params['order'])){

					$field = $columns[$params['order'][0]['column']];
					$direction = $params['order'][0]['dir'];
					
					if($field == 'quantity'){
						$field = 'store.quantity';
					}

					$sortField = $field;
					$sortBy = ($params['order'][0]['dir'] == 'desc')?-1:1;

					$sort = [$sortField=>$sortBy];

					//$products = $products->orderBy($field,$direction);  

				}else{
					//$products = $products->orderBy('created_at','desc');  
				}

				/*$products = $products
				->with('store')
				->skip((int)$start)
				->take((int)$length);

				$products = $products->get($columns);*/

				$userStoreId = Auth::user('admin')->storeId; 

				$query[]['$lookup'] = [
					'from'=>'stocks',
					'localField'=>'_id',
					'foreignField'=>'productObjId',
					'as'=>'store'
            	];

				$project = [];                	

		        foreach ($columns as $key => $value) {
					$project[$value] = '$'.$value;
				}	        
				
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
				                        'preserveNullAndEmptyArrays' => true,                            
				                    ];				                	
				$query[]['$sort'] = $sort;                    

	        	$query[]['$skip'] = (int)$start;
	        	$query[]['$limit'] = (int)$length;	

	        	//dd($query);

		    	$products = Products::raw()->aggregate($query);

		    	//dd($products);

		    	$products = $products['result'];

				foreach($products as $i => $product) {
					$products[$i]['_id'] = (string)$product['_id'];
					$categories = Categories::whereIn('_id', $product['categories'])->get();
					$cname = [];
					foreach ($categories as $key => $value) {                
						$cname[] = $value['cat_title'];                
					}  
					$products[$i]['category'] = implode(', ', $cname);
				}

				$response = [
					'recordsTotal' => $iTotalRecords,
					'recordsFiltered' => $iTotalRecords,
					'draw' => $draw,
					'data' => $products            
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

			if(isset($params['search']['value']) && trim($params['search']['value'])!=''){
				$sval = $params['search']['value'];
				$products = $products->where('name','regexp', "/.*$sval/i");
			}

			//$products = $products->where('dealers','all',['56ed55ecc31d53b2218b4568']);

			$iTotalRecords = $products->count();      
			
			$columns = ['name','quantity','maxQuantity','threshold','_id'];

			$notordered = true;
			if ( isset( $params['order'] ) ){
					foreach($params['order'] as $orderKey=>$orderField){
							if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
									$notordered = false;                    
									$products = $products->orderBy($columns[$orderField['column']],$orderField['dir']);                    
							}
					}
			}else{
				$products = $products->orderBy('updated_at','desc');
			}

			$products = $products			
			->skip((int)$start)
			->take((int)$length);

			$products = $products->with('store')->with('supplier');
			
			$products = $products->get($columns);
			
			$response = [
				'recordsTotal' => $iTotalRecords,
				'recordsFiltered' => $iTotalRecords,
				'draw' => $draw,
				'length' => $length,
				'aaData' => $products
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

		public function getTest(){

			$faker = Faker\Factory::create();

		    $limit = 100;

		    for ($i = 0; $i < $limit; $i++) {
		        echo $faker->word(10).'<br/>';
		        echo $faker->unique()->name . ', Email Address: ' . $faker->unique()->email . ', Contact No' . $faker->unique()->phoneNumber . '<br>';
		    }

		    exit;

			$query = [];
			$userStoreId = Auth::user('admin')->storeId;
			//$userStoreId .= '12';	
			$tableFields = [
				'name'=>'$name',
                //'quantity'=>'$quantity',                
                'dealerId'=>'$dealers',
                'sku'=>'$sku'
			];

			$project = $tableFields;

			$project['store'] = [
				'$filter'=>[
	                'input' => '$store',
	                'as' => 'store',
	                'cond' => ['$eq'=>['$$store.storeId',$userStoreId]]
	            ]    
	        ];        

			$query[]['$match'] = [
				'dealerId' => ['$elemMatch'=>['$in'=>['57c43653b190ec306f8b4569']]]
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

			//$query[]['$unwind'] = ['path' => '$store','preserveNullAndEmptyArrays' => true];
			
			$model = Products::raw()->aggregate($query);
			
			dd($model);
			

			$productWithStocks = Products::where('_id','57c54d89b190ec430d8b4570')->with('stocks')->first();	

			return response($productWithStocks);

			//$product = Products::create(['name'=>'beer']);

			//dd($product);

			$userStoreId = Auth::user('admin')->storeId;
			$query = [];

			$project = [
				'_id' => 1,
				'name' => 1,				
			];

			$project['mystore'] = [
				'$filter'=>[
	                'input' => '$mystore',
	                'as' => 'mystore',
	                'cond' => ['$eq'=>['$$mystore.storeId',$userStoreId]]
	            ]    
	        ];

			$query[]['$project'] = $project;	        

	        $query[]['$sort'] = ['mystore.quantity'=>-1];



			$model = Products::raw()->aggregate($query);
	        
	        dd($model);

	        echo '<pre>';
	        print_r($model);
	        echo '</pre>';
	        exit;       


			$product = Products::find('57c51cb1b190ec430d8b4567');			

			$store = $product->mystore()->get();//->where('storeId',$userStoreId)->first();

			$mystore = $store->where('storeId',$userStoreId)->first();

			/*$store->quantity = 150;

			$store->save();	*/

			//dd($store->first());


			return response(['store'=>$store,'mystore'=>$mystore],200);

	        /*$stock = new Stocks(
	        	[
	        		'quantity' => 50,
	        		'threshold' => 10,
	        		'maxQuantity' => 100,
	        		'storeId' => '57bef1bfb190ec7c0c8b4567',
	        		'storeObjId' => new MongoId('57bef1bfb190ec7c0c8b4567'),
	        		'defaultDealerId' => '57c43653b190ec306f8b4569',
	        		'defaultDealerObjId' => new MongoId('57c43653b190ec306f8b4569'),
	        		'productObjId' => new MongoId('57c51cb1b190ec430d8b4567'),
	        	]
	        );     

	        $stock = $product->mystore()->save($stock);*/

	        return response($stock,200);

	        



	        /*$p = Products::where(['_id'=>'57035084c31d53b2218b45c8']);

	        $p = $p->with('store')->first();

	        

	        return response($p,200);*/

	        $userStoreId = Auth::user('admin')->storeId; 

	        $us = new Products;

        	$fillable = $us->getFields();        	

        	$fillable['store'] = [
        		'$filter'=>[
	                'input' => '$store',
	                'as' => 'store',
	                'cond' => ['$eq'=>['$$store.storeId',$userStoreId]]
	            ]
        	];

        	$firstFillable = $us->getFirstfield();

        	$firstFillable['_id'] = '$_id';

        	$firstFillable['stocks'] = ['$push' => '$stocks'];
        	
        	$firstFillable['suggestions'] = ['$push' => '$suggestions'];

			//$project = $fillable;

			//$project['stocks'] = ['$arrayElemAt' => [ '$stocks', 0 ]];

			$project['stocks'] = '$stocks';

			/*$project['stocks'] = [
        		'$filter'=>[
	                'input' => '$stocks',
	                'as' => 'stock',
	                'cond' => ['$eq'=>['$$stock.storeId',$userStoreId]]
	            ]
        	];*/

			$project['suggestions'] = '$suggestions';

        	$model = Products::raw()->aggregate(
	            [   
	                [
	                    '$match'=>['_id' => new MongoId('57035084c31d53b2218b45c8')]                    
	                ],
	                [
	                	'$lookup' => [
							'from'=>'stocks',
							'localField'=>'_id',
							'foreignField'=>'productObjId',
							'as'=>'store'
	                	]
	                ],
	                [
	                	'$project' => $fillable
	                ],
	                [
	                	'$unwind' => [
	                        'path' => '$store',	                        
	                        'preserveNullAndEmptyArrays' => true,                            
	                    ]
	                ],	    
	                /*[
	                	'$sort' => ['store.quantity' => -1]
	                ],
	                [
	                	'$limit' => 5
	                ]   */         
	                /*[
	                	'$unwind' => [
	                        'path' => '$stocks',	                        
	                        'preserveNullAndEmptyArrays' => true,                            
	                    ]
	                ],
	                [
						'$group' => $firstFillable	
					],*/	                
	                /*[
						'$unwind' => [
							'path' =>  '$suggestionObjectId',
							"preserveNullAndEmptyArrays" => true

						]
					],
	                [
						'$lookup' => [
							'from'=>'products',
							'localField'=>'suggestionObjectId',
							'foreignField'=>'_id',
							'as'=>'suggestions'
						]
					],*/
					
					/*[
						'$unwind' => [
							'path' =>  '$suggestions',
							"preserveNullAndEmptyArrays" => true

						]
					],
					[
						'$group' => $firstFillable	
					],
					[
						'$project' => $project
					],
					[
						'$unwind' => [
							'path' =>  '$stocks',
							"preserveNullAndEmptyArrays" => true

						]
					],*/
					/*[
						'$unwind' => [
							'path' => '$stocks',	                        
	                        'preserveNullAndEmptyArrays' => true,                            
						]
					]*/		                
	            ]
	        );       

        	dd($model);

        	echo '<pre>';
	        print_r($model);
	        echo '</pre>';
	        exit;

        	//$fillable['stocks'] = '$stocks';

        	/*$fillable['store'] = [
        		'$filter'=>[
	                'input' => '$stocks',
	                'as' => 'stock',
	                'cond' => ['$eq'=>['$$stock.storeId',new MongoId('57badb6db190ecd2108b456b')]]
	            ]
        	];*/
	        
	        //$fillable['storeQuantity'] = '$store.quantity';        					        

	        $model = Products::raw()->aggregate(
	            [   
	                [
	                    '$match'=>['_id' => new MongoId('57035084c31d53b2218b45c8')]                    
	                ],                                
	                [
	                    '$unwind' => [
	                        'path' => '$stocks',
	                        'preserveNullAndEmptyArrays' => true,                            
	                    ]
	                ],
	                [
	                    '$project'=>$fillable                        
	                ],
	                [
	                    '$match'=>['storeOId' => new MongoId('57bef1bfb190ec7c0c8b4567')]                    
	                ],
	                [
	                	'$lookup' => [
							'from'=>'dealers',
							'localField'=>'store.defaultDealer',
							'foreignField'=>'_id',
							'as'=>'dealerInfo'
	                	]
	                ],
	                [
	                    '$unwind' => [
	                        'path' => '$dealerInfo',
	                        'preserveNullAndEmptyArrays' => true,                            
	                    ]
	                ]
	            ]
	        );

	        //dd($model);

	        echo '<pre>';
	        print_r($model);
	        echo '</pre>';
	        exit;

	        return response($model,200);

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
	}	
}
		