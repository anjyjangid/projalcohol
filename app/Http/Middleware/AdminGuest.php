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
        if (\Auth::check('admin')) {
            return redirect('/admin/home');
        }
 
        return $next($request);
    }
}