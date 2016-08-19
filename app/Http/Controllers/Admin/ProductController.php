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

				//prd($inputs);

				$inputs['quantity'] = (int)$inputs['quantity'];
				$inputs['price'] = (float)$inputs['price'];        
				$inputs['chilled'] = (int)$inputs['chilled'];
				$inputs['status'] = (int)$inputs['status'];
				$inputs['isFeatured'] = (int)$inputs['isFeatured'];
				$inputs['threshold'] = (int)$inputs['threshold'];
				$inputs['maxQuantity'] = (int)$inputs['maxQuantity'];	

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

				if (isset($inputs['advance_order_bulk']['bulk']) && !empty($inputs['advance_order_bulk']['bulk']))
				{
						foreach ($inputs['advance_order_bulk']['bulk'] as $dKey => $discount)
						{
								unset($inputs['advance_order_bulk']['bulk'][$dKey]['$$hashKey']);
								$inputs['advance_order_bulk']['bulk'][$dKey] = [
									'from_qty' => (int)$discount['from_qty'],
									'to_qty' => (int)$discount['to_qty'],
									'type' => (int)$discount['type'],
									'value' => (float)$discount['value'],
								];                                
						}
				}

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
				}

				$inputs['bulkDisable'] = (int)($inputs['bulkDisable']);

				$inputs['loyalty'] = (int)($inputs['loyalty']);

				if (isset($inputs['advance_order']['value']) && !empty($inputs['advance_order']['value'])){
							$inputs['advance_order']['value'] = (float)$inputs['advance_order']['value'];
				}

				if (isset($inputs['regular_express_delivery']['value']) && !empty($inputs['regular_express_delivery']['value'])){
							$inputs['regular_express_delivery']['value'] = (float)$inputs['regular_express_delivery']['value'];
				}

				$product = Products::create($inputs);            

				if($product){
					
					$dealers = Dealer::whereIn('_id',$product->dealers)->get();

					//ADD PRODUCT IDS IN DEALERS TABLE
					foreach ($dealers as $dkey => $dvalue) {
						$dvalue->push('products',$product->_id,true);
					}

					$files = $inputs['imageFiles'];
					
					$this->saveImages($product,$files);
					
					return $product;

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
				$galleryObj = new Products;
				return $galleryObj->getSingleProduct($id);
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

				$inputs['quantity'] = (int)$inputs['quantity'];
				$inputs['price'] = (float)$inputs['price'];        
				$inputs['chilled'] = (int)$inputs['chilled'];
				$inputs['status'] = (int)$inputs['status'];
				$inputs['isFeatured'] = (int)$inputs['isFeatured'];    
				$inputs['threshold'] = (int)$inputs['threshold'];
				$inputs['maxQuantity'] = (int)$inputs['maxQuantity'];
				$inputs['deliveryType'] = (int)$inputs['deliveryType'];
				$inputs['isLoyalty'] = (int)$inputs['isLoyalty'];
				
				$suggestions = [];
				foreach($inputs['suggestions'] as $product){
					array_push($suggestions, new MongoId($product['_id']));
				}
				$inputs['suggestions'] = $suggestions;

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

				$unset = [];

				if (isset($inputs['advance_order_bulk']['bulk']) && !empty($inputs['advance_order_bulk']['bulk']))
				{
						foreach ($inputs['advance_order_bulk']['bulk'] as $dKey => $discount)
						{
								unset($inputs['advance_order_bulk']['bulk'][$dKey]['$$hashKey']);
								$inputs['advance_order_bulk']['bulk'][$dKey] = [
									'from_qty' => (int)$discount['from_qty'],
									'to_qty' => (int)$discount['to_qty'],
									'type' => (int)$discount['type'],
									'value' => (float)$discount['value'],
								];                                
						}
				}else{
						$unset[] = 'advance_order_bulk';
				}

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
						$unset[] = 'express_delivery_bulk';
				}

				$bd = (isset($inputs['bulkDisable']))?$inputs['bulkDisable']:0;
				$inputs['bulkDisable'] = (int)($bd);

				$inputs['loyalty'] = (int)($inputs['loyalty']);

				if (isset($inputs['advance_order']['value']) && !empty($inputs['advance_order']['value'])){
							$inputs['advance_order']['value'] = (float)$inputs['advance_order']['value'];
				}else{
						$unset[] = 'advance_order';
				}

				if (isset($inputs['regular_express_delivery']['value']) && !empty($inputs['regular_express_delivery']['value'])){
							$inputs['regular_express_delivery']['value'] = (float)$inputs['regular_express_delivery']['value'];
				}else{
						$unset[] = 'regular_express_delivery';
				}

				$product = Products::find($id);

				if($product){          
										
					$files = $inputs['imageFiles'];

					$existingdealer = (!empty($product->dealers))?$product->dealers:[];

					//CHECK IF DEALER IS REMOVED
					$removed = array_diff($existingdealer, $inputs['dealers']);
					if($removed){
						$rdealers = Dealer::whereIn('_id',$removed)->get();
						foreach ($rdealers as $rdkey => $rdvalue) {
							$rdvalue->pull('products',$product->_id);
						}
					}

					//UPDATE PRODUCT          
					$update = $product->update($inputs);

					$dealers = Dealer::whereIn('_id',$product->dealers)->get();

					//ADD PRODUCT IDS IN DEALERS TABLE
					foreach ($dealers as $dkey => $dvalue) {
						$dvalue->push('products',$product->_id,true);
					}          

					//UNSET THE PRICING IF EXISTS AND NOT SET
					foreach ($unset as $key => $value) {
						$product->unset($value);
					}   

					$this->saveImages($product,$files);
				}
				
				return response($product,200);
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

				if(isset($name) && trim($name)!=''){
						$products = $products->where('name','regexp', "/.*$name/i");            
				}

				if(isset($params['categories']) && trim($params['categories'])!=''){          
					$products = $products->where('categories',$params['categories']);
				}

				if(isset($params['status']) && trim($params['status'])!=''){
					$products = $products->where('status',(int)$params['status']);
				}

				if(isset($params['isFeatured']) && trim($params['isFeatured'])!=''){
					$products = $products->where('isFeatured',(int)$params['isFeatured']);
				}        

				$iTotalRecords = $products->count();        

				$columns = array('_id','name','categories','price','status','isFeatured','quantity');        

				if(isset($params['order']) && !empty($params['order'])){

					$field = $columns[$params['order'][0]['column']];
					$direction = $params['order'][0]['dir'];
					$products = $products->orderBy($field,$direction);  

				}else{
					$products = $products->orderBy('created_at','desc');  
				}

				$products = $products
				->skip((int)$start)
				->take((int)$length);

				$products = $products->get($columns);

				foreach($products as $i => $product) {
						$categories = Categories::whereIn('_id', $product->categories)->get();
						$cname = [];
						foreach ($categories as $key => $value) {                
							$cname[] = $value->cat_title;                
						}  
						$products[$i]->category = implode(', ', $cname);
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

			/*$r = DB::collection('products')->raw(function($collection)
			{
					return $collection->aggregate(array(
							array(
									'$project' => array(
											'name'=>'$name',
											'quantity'=>'$quantity',
											'maxQuantity'=>'$maxQuantity',
											'threshold'=>'$threshold',
											'sum' => array(
													'$subtract' => array(
														'$maxQuantity',
														'$quantity'
													)
											),                      
									),                  
							),
							array(
									'$sort' => array('sum'=>-1)
							),
							array(
									'$skip' => 0
							),
							array(
									'$limit' => 5
							)
							array(
									'$match' => array(
										'sum' => 70
									)
							)   
					));
			});     

			return response($r);*/


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
			}

			$products = $products
			->skip((int)$start)
			->take((int)$length);

			$products = $products->with('supplier');

			if($notordered){
				$products = $products->orderBy('quantity','asc')->orderBy('threshold','asc')->orderBy('maxQuantity','asc');
			}

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
}
		