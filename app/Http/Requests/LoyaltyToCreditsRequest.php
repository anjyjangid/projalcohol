<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class LoyaltyToCreditsRequest extends Request
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

		$rules = [

			'id' => 'required',
			'quantity' => 'required|integer|between:1,100'

		];

		return $rules;
	}

	public function messages()
	{

		$messages = [
			'id.required' => 'select a certificate',
			'quantity.required' => 'please define quantity you want to convert',
			'quantity.between' => 'please define quantity you want to convert'
		];

		return $messages;

	}

}
