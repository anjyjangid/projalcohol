<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class UserAddressRequest extends Request
{    
	/**
	 * Determine if the user is authorized to make this request.
	 *
	 * @return bool
	 */
	public function authorize()
	{
		return true;
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{		

		$input = Input::all();

		$rules = [
			
			'firstname' => 'required|string|max:100',
			'lastname' => 'required|string|max:100',
			'HBRN' => 'required',
			'PostalCode' => 'required',			
			/*'company'=> 'string|max:100',
			'building'=>'string|max:100',
			'street'=>'required|string|max:100',
			'postal'=>'required|string|max:10',
			'house'=>'required|string|max:10',
			'floor'=>'integer|max:1000',
			'unit'=>'integer|max:100',
			'instruction'=>'string|max:500'*/

		];

		if(isset($input['manualForm'])){
			$rules['house'] = 'required';
		}


		/*if(isset($input['place'])){

			foreach($input['place']['address_components'] as $addresscom){

				if($addresscom['types'][0]=="route"){
					$this->request->add(['street' => $addresscom['long_name']]);
					$rules['street']='string|max:100';
				}

				if($addresscom['types'][0]=="postal_code"){

					$this->request->add(['postal' => $addresscom['long_name']]);
					$rules['postal']='string|max:10';
				}				

			}

			$this->request->add(['geometry'=>$input['place']['geometry']['location']]);

			$rules['postal']='string|max:10';
			$rules['house']='string|max:10';
		}*/
		
		return $rules;
	}

	public function messages()
	{

		$messages = [

				'required' => 'Field is required'
		];    

		return $messages;

	}

	// public function response(array $errors){
		
	//     return $errors;

	// }

	public function forbiddenResponse()
	{
		return Response::make('message',403);
	}

}
