<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class CustomerRequest extends Request
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

		$rules = [];

		$rules = [
			'name' => 'required|string|max:255',            
			'email' => 'required|email|max:255|unique:user,email,'.@$input['_id'].",_id",            
			'mobile_number'=> 'required|numeric|digits_between:6,15',            
			'status'=> 'required|integer|in:0,1',
		];

		if(!isset($input['_id']) && empty($input['_id'])){
			$rules['status'] = 'integer|in:0,1';        
		}

		if(isset($input['country_code']) && $input['country_code']==65){

			$rules['mobile_number'].="|digits:8";         

		}

		return $rules;
	}

	public function messages()
	{

		$input = Input::all();
		
		$messages = [

			'required' => 'This field is required',
			'mobile_number.required' => 'Mobile number is required',
			'mobile_number.numeric' => 'please enter valid mobile number',
			'mobile_number.digits_between' => 'please enter valid mobile number'
		];

		if(isset($input['country_code']) && $input['country_code']==65){
			
			$messages['mobile_number.digits'] = 'please enter valid 8 digit number';

		}

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
