<?php
 
namespace AlcoholDelivery\Http\Middleware;
 
use Closure;
 
class AdminGuest
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
        //prd(var_dump($request->ajax()));
        
        if (\Auth::check('admin')) {
            return response('Unauthorized.', 401);
        }
 
        return $next($request);
    }
}