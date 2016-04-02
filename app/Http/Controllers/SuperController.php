<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Categories as Categories;
class SuperController extends Controller
{    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getCategory(Request $request)
    {
        $params = $request->all();

        $categories = new Categories;

        if(isset($params['category']) && $params['category']!=""){
            $categories = $categories->where('slug', "=", $params['category']);
        }

        $categories = $categories->get();


        if(isset($params['withChild']) && $params['withChild']){

            foreach($categories as &$category){
                $category['children'] = array(); 
                $category['children'] = Categories::where('cat_status',1)->where('ancestors.0._id','=',$category['_id'])->get(array('_id','slug','cat_title'));
            }

        }

        return response($categories);
    }

}
