<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">    
    <style type="text/css">
        table td {
            border-collapse: collapse !important;
        }
        @media only screen and (max-width: 599px) {
            table[class="flexible"] {
                width: 100% !important;
            }
            td[class="logo"] {
                text-align: center;
            }
            td[class="logo"] img {
                height: 60px !important;
            }            
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ebeef0;">    
    @extends('emails.maillayout')
    @section('content')
    <?php echo htmlspecialchars_decode($content); ?>
    @endsection
</body>
</html>