<?php

namespace AlcoholDelivery\Http\Middleware;

use Closure;

class ResetPasswordRequired
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $email = $request->input('email');
        return $next($request);
    }
}
