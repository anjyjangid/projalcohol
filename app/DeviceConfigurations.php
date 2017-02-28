<?php

namespace AlcoholDelivery;

use Moloquent;
use MongoId;
use MongoDate;

class DeviceConfigurations extends Moloquent
{
    protected $primaryKey = "_id";
	protected $collection = 'deviceConfigurations';

	/**
	 * Indicates if the model should be timestamped.
	 *
	 * @var bool
	 */
	public $timestamps = true;

	 /**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [
							'device',
							'products',
							'loyalty',
							'packages',
							'giftCards',
							'nonchilled',
							'delivery',
							'service',
							'discount',
							'timeslot',
							'payment',
							'status',
							'user',
							'reference'
						];

}
