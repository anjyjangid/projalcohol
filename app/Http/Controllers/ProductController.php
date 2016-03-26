<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;

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

        if(isset($params['category']) && !empty($params['category'])){
            $products = $products->where('categories', $params['category']);
        }

        

        $products = $products->get($columns);

        return response($products,200);

    }


}
