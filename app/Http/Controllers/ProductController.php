<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;

use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Products as Products;


class ProductController extends Controller
{    
    /***************************************
     * Display a listing of the resource.
     * 
     * @return \Illuminate\Http\Response
    ***************************************/

    public function getproduct(Request $request){

        $params = $request->all();
        
        $products = new Products;

        $columns = array('_id',"categories","chilled","description","discountPrice","imageFiles","name","price","shortDescription","sku");

        $products = $products->where('status', 1);

        if(isset($params['type']) && $params['type']=="featured"){
            $products = $products->where('isFeatured', 1);
        }

        $products = $products->where('status', 1);

        if(isset($params['category']) && !empty($params['category'])){
            // sleep(10);
            $category = Categories::raw()->findOne(['slug' => $params['category']]);
            $catKey = (string)$category['_id'];

            $products = $products->where('categories', 'all', [$catKey]);
            
        }

        $products = $products->get($columns);

        return response($products,200);

    }

    public function getproductdetail(Request $request){

        $params = $request->all();
        
        $product = Products::find($params['product']);

        return response($product,200);

    }


}
