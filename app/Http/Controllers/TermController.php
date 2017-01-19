<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class TermController extends Controller
{
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        die("hello");
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    // Receive Order
    public function postRecvOrder(Request $request){
        
        $this->_logToFile("recvorder.log",$request->all());
                
        $response = [
            'errorCode'=>'0',
            'success'=>'1',
            'firmwareMarking'=>'httpegt0',
            'firmwareVersion'=>'0204',
            'isModifyConfig'=>'1',
            'commIP'=>'52.220.94.36',
            'commPort'=>'8000',
            'commURL'=>'52.220.94.36:8000',
            'orderURL'=>'/Term/RecvOrder',
            'upgradeURL'=>'/Term/Upgrade'
        ];
        
        return json_encode($response,JSON_UNESCAPED_SLASHES);
    }

    // For server firmware upgrade URL,authorization etc
    public function postUpgrade(Request $request){

        $this->_logToFile("upgrade.log",$request->all());
        
        $response = [
            'success' => '1',
            'errorCode' => '0',
            'firmwareMarking'=>'httpegt0',
            'firmwareVersion'=>'0204',
            'downloadType' => '2',
            'downloadAddress' => '113.59.226.27:10123',
            'followFirmwareNum' => '2',
            'firmwareNumber1' => '1',
            'firmwareType1' => '0',
            'firmwareSize1' => '269012',
            'downLicenseKey1' => '9069c10b45b4486db9077bcaf5356547',
            'hashCode1' => 'd2fc383a2e7321a6',
        ];

        return json_encode($response,JSON_UNESCAPED_SLASHES);        
    }

    // error code
    private function _errorcode($code){
        $errorMsg = array();
        $errorMsg[0] = "right";
        $errorMsg[10000] = "Parameter error";
        $errorMsg[10001] = "System Error";
        $errorMsg[10002] = "Account have not log in";
        $errorMsg[10003] = "Account registered";

        return $errorMsg[$code];
    }

    // create log file
    private function _logToFile($filename, $message){
        $viewLog = new Logger('Device API Logs');
        $viewLog->pushHandler(new StreamHandler(storage_path().'/devicelogs/'.$filename, Logger::INFO));
        if(is_array($message)){
            $message = json_encode($message);
        }
        $viewLog->addInfo($message);
    }
}
