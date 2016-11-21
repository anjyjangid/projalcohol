<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class UserGroup extends Eloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'user_groups';

	protected $fillable = [
		'name',
		'access_list',
		'modify_list',
		'status'
	];

}
