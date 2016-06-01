<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Products;
use DateTime;
class SiteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
    public function store(Request $request)
    {
        //
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
     */
    public function update(Request $request, $id)
    {
        //
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

    public function getSearch(Request $request,$keyword){        
        
        $products = new Products;

        if(isset($keyword) && trim($keyword)!=''){            
            $products = $products->where('name','regexp', "/.*$keyword/i")->where('status',1);
        }

        $products = $products->skip(0)->take(10)->get();        

        return response($products,200);
    }

    public function getSearchlist(Request $request){        
        
        $params = $request->all();

        extract($params);    

        $products = new Products;

        $products = $products->where('status',1);

        if(isset($keyword) && trim($keyword)!=''){            
            $products = $products->where('name','regexp', "/.*$keyword/i");
        }

        if(isset($filter) && trim($filter)!=''){
            switch ($filter) {
                case 'new':
                    $products = $products->where('created_at', '>', new DateTime('-1 months'));
                    break;
                case 'in-stock':
                    $products = $products->where('quantity','>',0);
                    break;
                default:
                    # code...
                    break;
            }
        }

        if(isset($sortby) && trim($sortby)!=''){
            $products = $products->orderBy('price', $sortby);
        }else{
            $products = $products->orderBy('created_at','desc');
        }

        $totalItem = $products->count();

        

        $products = $products->skip($skip)->take($take)->get();        

        $response = [
            'products' => $products,
            'total' => $totalItem,
        ];

        return response($response,200);
    }
}
