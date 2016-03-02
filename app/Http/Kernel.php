<?php

namespace AlcoholDelivery\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * @var array
     */
    protected $middleware = [
        \Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode::class,
        \AlcoholDelivery\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \AlcoholDelivery\Http\Middleware\VerifyCsrfToken::class,
    ];

    /**
     * The application's route middleware.
     *
     * @var array
     */
    protected $routeMiddleware = [
        'auth' => \AlcoholDelivery\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'guest' => \AlcoholDelivery\Http\Middleware\RedirectIfAuthenticated::class,
        //ADDED LINE FOR MULTI AUTH
        'admin'       => \AlcoholDelivery\Http\Middleware\AdminAuthenticate::class,
        'admin.guest' => \AlcoholDelivery\Http\Middleware\AdminGuest::class
    ];
}
