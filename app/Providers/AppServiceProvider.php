<?php

namespace AlcoholDelivery\Providers;

use Illuminate\Support\ServiceProvider;
use Validator;
use Input;
use AlcoholDelivery\Http\Validator\CustomValidationRule;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        Validator::extend('gte', function($attribute, $value, $parameters) {
            return $value >= Input::get($parameters[0]) ;
        });

        Validator::extend('lt', function($attribute, $value, $parameters) {
            return $value < Input::get($parameters[0]) ;
        });

        Validator::extend('mobile', function($attribute, $value, $parameters) {
            return preg_match("/^\+?\d[0-9-]{9,12}/", $value);
        });

        
        
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        require base_path().'/app/Helpers/globalFunction.php';
    }
}
