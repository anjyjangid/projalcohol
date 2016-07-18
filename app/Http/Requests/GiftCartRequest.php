<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class GiftCartRequest extends Request
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

		$rulesCommon = [
					'type' => 'required|in:"giftcard","giftpackaging"',
				];

		switch($input['type']){

			case 'giftcard':

				$rules = [
					
					'recipient.email'=> 'required',
					'recipient.message'=> 'required|max:200',
					
					'recipient.name'=> 'required',
					'recipient.price'=> 'required|numeric',
					'recipient.quantity'=> 'required|integer|min:1',
					'recipient.sms'=> 'in:0,1',
					'recipient.mobile'=> 'required_if:recipient.sms,1',

				];
			break;
		}
		
				
		return $rules;
	}

	public function messages(){

		$messages = [
			'required' => 'This field is required',
			'recipient.message.max'=> 'message must be less than or equal to 200 characters',
			'recipient.mobile.required_if'=> 'To send SMS please provide mobile number',
			
		];                
		return $messages;
	}

	

	public function forbiddenResponse()
	{
		return Response::make('message',403);
	}

}
