<?php

namespace AlcoholDelivery;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Admin extends Eloquent implements AuthenticatableContract,
                                    AuthorizableContract,
                                    CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword;

    
    protected $collection = 'admin';

    /**
     * The database table used by the model.
     *
     * @var string
     */
    //protected $table = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['first_name', 'last_name', 'email', 'storeId', 'storeObjId', 'password','role', 'status'];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];

    public function userstore()
    {
        return $this->belongsTo('AlcoholDelivery\Store','storeId');
    }
}