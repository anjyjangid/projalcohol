<!DOCTYPE html>
<html>
    <head>
        <title>Invalid order</title>

        

        <style>
            html, body {
                height: 100%;
            }

            body {
                margin: 0;
                padding: 0;
                width: 100%;
                color: #444;
                display: table;
                font-weight: 100;
                font-family: sans-serif;
            }

            .container {
                text-align: center;
                display: table-cell;
                vertical-align: middle;
            }

            .content {
                text-align: center;
                display: inline-block;
            }

            .title {
                font-size: 16px;
                margin-bottom: 40px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="title">
                    <?php if(isset($error)){?>
                    Error getting invoice <br/> {{ $error }}
                    <?php }else{?>
                    Invalid order <br>{{$id}}
                    <?php }?>
                </div>
            </div>
        </div>
    </body>
</html>