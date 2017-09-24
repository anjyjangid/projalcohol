<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class QueryRequest extends Request
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

		if($this->type == 'bulkcorporate-discounts'){                
			$rules = [
				'name' => 'required|max:50',
				'companyName' => 'max:100',                
				'businessNature' => 'max:100',
				'phoneNumber' => 'numeric|digits_between:8,10',
				//'contactName' => 'required|max:50',
				'email' => 'required|email',
			];
		}

		if($this->type == 'suggest-a-product') {            
			$rules = [
				'productname' => 'required|max:100',
				'brandname' => 'required|max:100',
				'category' => 'required',                
				'email' => 'required|email'                
			];
		}

		if($this->type == 'event-planner') {            
			$rules = [
				'name' => 'required|max:50',
				'companyName' => 'max:100',
				'email' => 'required|email',
				'phoneNumber' => 'numeric|digits_between:8,10',
				'dateOfEvent' => 'date_format:d/m/Y|after:now',
				'locationOfEvent' => 'max:100',
				'noOfPax' => 'numeric'
			];
		}

		if($this->type == 'contact-us') {            
			$rules = [
				'subject' => 'required|max:50',
				'name' => 'required|max:50',
				'email' => 'required|email',
				'feedback' => 'required'
			];
		}

		if($this->type == 'careers') {
			$rules = [				
				'fname' => 'required|max:50',
				'lname' => 'required|max:50',
				'email' => 'required|email',
				'phone' => 'required|numeric|digits_between:6,15',
				'resume' => 'required|mimes:doc,docx,pdf|max:5000',
				'github_profile' => 'url|regex:/https?:\/\/(.*\.)?github\.com\//',
				'linkedin_profile' => 'url|regex:/https?:\/\/(.*\.)?linkedin\.com\//',
				'website' => 'url'
			];
		}

		if($this->type == 'press-media') {
			$rules = [				
				'fname' => 'required|max:50',
				'lname' => 'max:50',
				'organisation' => 'required|max:150',
				'jobtitle' => 'required',
				'email' => 'required|email',
				'phone' => 'required|numeric|digits_between:6,15',
				'type_of_enquiry' => "required",
				'message' => 'required|max:300'
			];
		}

		$rules['additionalComment'] = 'max:200';

		return $rules;
	}

	public function messages() {

		$messages = [

				'phoneNumber.digits_between' => 'Number must be between 8 to 10 digits'
		];

		$extraMessags = [];

		switch($this->type) {

			case 'careers' :
				
				$extraMessags = [
					'github_profile.url' => 'The github account url format is invalid.',
					'linkedin_profile.url' => 'The linkedin account url format is invalid.',
					'github_profile.regex' => 'The github account url format is invalid.',
					'linkedin_profile.regex' => 'The linkedin account url format is invalid.',
					'website.url' => 'The url format is invalid.'
				];

			break;

			case 'press-media':

				$extraMessags = [
					'fname.required' => 'The first name is required',					
					'organisation.required' => 'The Organisation / Business Name or URL is required',
					
					'phone.required' => 'The contact number is required',
					'phone.numeric' => 'The contact number should be numeric',
					'phone.digits_between' => 'The contact number should be between 8 to 15',

					'type_of_enquiry.required' => 'The Type of enquiry is required',

					'message.max' => 'Max 300 character is allowed'
					
				];

			break;

		}

		$messages = array_merge($messages,$extraMessags);

		return $messages;
	}

}
