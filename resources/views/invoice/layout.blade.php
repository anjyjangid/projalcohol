<!DOCTYPE html>
<html dir="ltr" lang="en">
  <head>
    <meta charset="UTF-8"/>
    <title>Invoice</title>
    <link href="{{asset('css/printbootstrap.css')}}" rel="stylesheet" media="screen,print"/>
    <link type="text/css" href="{{asset('css/print.css')}}" rel="stylesheet" media="screen,print"/>
    <!-- <link href="css/printbootstrap.css" rel="stylesheet" media="screen"/>
    <link type="text/css" href="css/print.css" rel="stylesheet" media="screen"/> -->
  </head>
  <body>  
    @yield('content')
  </body>
</html>  