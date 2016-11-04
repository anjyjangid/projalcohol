<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class WishlistRequest extends Request
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
		return [
						
			'id' => 'required|unique:wishlist,products._id',
			
		];
		
	}

	public function messages()
	{

		return [

			'required' => 'This field is required'
		];   

		

	}
}
