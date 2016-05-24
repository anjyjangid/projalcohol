<?php

namespace AlcoholDelivery;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class User extends Eloquent implements AuthenticatableContract,
                                    AuthorizableContract,
                                    CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword;

    
    protected $collection = 'user';

    /**
     * The database table used by the model.
     *
     * @var string
     */
    //protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'fbid',
        'mobile_number',
        'email_key',
        'status',
        'verified',
        'productAddedNotification'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];

    public function galleries()
    {
        return $this->hasMany('AlcoholDelivery\Gallery');
    }

    // ykb 28-apr-2016 //
    public function getCustomers($params = array()){

        $customer = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $customer = $customer->get();
        }else{
            $customer = $customer->first();
        }
        
        return $customer;

    }
}
