<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use DB;
use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Testimonial as Testimonial;
use AlcoholDelivery\Brand as Brand;

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

        $categories = $categories->where('cat_status',1);

        $categories = $categories->get();


        if(isset($params['withChild']) && $params['withChild']){

            foreach($categories as &$category){
                $category['children'] = array(); 
                $category['children'] = Categories::where('cat_status',1)->where('ancestors.0._id','=',$category['_id'])->get(array('_id','slug','cat_title'));
            }

        }

        return response($categories);
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getTestimonial(Request $request)
    {
        $params = $request->all();

        $testimonials = Testimonial::where('status', '=', 1)->take(10)->get();
        
        return response($testimonials);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getBrand(Request $request)
    {
        $params = $request->all();

        $brands = Brand::where('status', '=', 1)->take(10)->get();
        
        return response($brands);
    }


    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getSettings(Request $request)
    {        
        $settings = DB::collection('settings')->whereIn("_id",['general','social'])->get();
        
        $settingsData = array();

        foreach($settings as $setting){        

            foreach($setting['settings'] as $subKey=>$subSetting){

                $settingsData[$setting['_id']][$subKey] = $subSetting['value'];
                
            }
        }
        
        return response($settingsData);
    }

}
