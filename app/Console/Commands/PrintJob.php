<?php

namespace AlcoholDelivery\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Logging;
use DB;
use AlcoholDelivery\Libraries\GoogleCloudPrint\GoogleCloudPrint;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

use AlcoholDelivery\Orders;

class PrintJob extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'printjob:print';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $enableLog = true;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $printers = DB::collection('printers')->where('status',1)->first();

        if($printers){

            //$this->comment('PRINTER FOUND');

            $gcp = new GoogleCloudPrint();
            $urlconfig = GoogleCloudPrint::$urlconfig;            
            $refreshTokenConfig = GoogleCloudPrint::$refreshTokenConfig;

            $refreshTokenConfig['refresh_token'] = $printers['refresh_token'];

            $token = $gcp->getAccessTokenByRefreshToken($urlconfig['refreshtoken_url'],http_build_query($refreshTokenConfig));

            $gcp->setAuthToken($token);

            $printerlist = $printers['printers'];

            $printerid = $printerlist[0]['id'];

            //$printers = $gcp->getPrinters();
            //$resarray = $gcp->sendPrintToPrinter($printerid, "testprint", "http://52.77.231.254/printjob", "url");

            $deliveryOrders = DB::collection('orders')->where('doStatus',1)->get(['reference']);

            $successPrint = 0;
            $failPrint = 0;

            if($deliveryOrders){
                foreach ($deliveryOrders as $key => $value) {
                    $resarray = $gcp->sendPrintToPrinter($printerid, "Order#".$value['reference'], url()."/printjob/".$value['reference'], "url");

                    if($resarray['status']==true) {                                
                        $successPrint += 1;
                        $this->logtofile("Order#".$value['reference']." has been sent to printer and should print shortly.");
                        //UPDATE STATUS AS PRINTED
                        $value->doStatus = 2;
                        $value->save();
                    }else{
                        $failPrint += 1;
                        $this->logtofile("An error occured while printing order#".$value['reference']." the doc. Error code:".$resarray['errorcode']." Message:".$resarray['errormessage']);
                    }
                }
            }
            
            $this->logtofile("TOTAL PRINTS : ".($successPrint+$failPrint)." (Success : ".$successPrint." Failed : ".$failPrint.")");

            /*if($resarray['status']==true) {        
                echo "Document has been sent to printer and should print shortly.";
            }else{
                echo "An error occured while printing the doc. Error code:".$resarray['errorcode']." Message:".$resarray['errormessage'];
            }*/   

        }else{
            //$this->comment('PRINTER NOT FOUND');
            $this->logtofile('PRINTER NOT FOUND');
        }
    }

    function logtofile($message){
        if($this->enableLog){
            $view_log = new Logger('Printer Logs');
            $view_log->pushHandler(new StreamHandler(storage_path().'/logs/printer.log', Logger::INFO));
            $view_log->addInfo($message);
        }
    }
}
