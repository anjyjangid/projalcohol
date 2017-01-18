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
        // echo "<pre>"; print_r($request->input()); echo "</pre>"; exit;
        $this->_logToFile("recvorder.log",$request->input());
        // die("Log Done");

        $response = array();
        $response["success"] = "1"; // 1 successful，2 fail
        $response["errorCode"] = "0";
        $response["firmwareMarking"] = $request->input("firmwareMarking");
        $response["firmwareVersion"] = $request->input("firmwareVersion");
        $response["isModifyConfig"] = "1"; // Whether revise configuration or not(1：not revise、2：revise)
        $response["commIP"] = "52.220.94.36"; // communication server IP address
        $response["commPort"] = "8000"; // communication server port number
        $response["commURL"] = "http://52.220.94.36:8000/TermAPI/RecvOrder"; // URL explain
        $response["orderURL"] = "/TermAPI/RecvOrder"; // (localhost)，eg:http://localhost:8081/TermAPI/RecvOrder/ (OrderURL=/TermAPI/RecvOrder)
        $response["upgradeURL"] = "/TermAPI/Upgrade"; // (Localhost) eg:http://localhost:8081/TermAPI/Upgrade (OrderURL=/TermAPI/Upgrade)

        return response($response);
    }

    // For server firmware upgrade URL,authorization etc
    public function postUpgrade(Request $request){
        // echo "<pre>"; print_r($request->input()); echo "</pre>"; exit;
        $this->_logToFile("upgrade.log",$request->input());
        // die("Log Done");

        $response = array();
        $response["success"] = "1"; // 1 successful，2 fail
        $response["errorCode"] = "0";
        $response["firmwareMarking"] = $request->input("firmwareMarking"); // for exa: httpegt0
        $response["firmwareVersion"] = $request->input("firmwareVersion"); // for exa: 0204
        $response["downloadType"] = "2"; // HTTP＝1、TCP＝2、UDP＝3、TFTP＝4
        $response["downloadAddress"] = "113.59.226.27:10123"; // HTTP:URL;TCP:IP:Port
        $response["followFirmwareNum"] = "2"; // Number of firmware
        $response["firmwareNumber1"] = "1"; // firmware serial number 1
        $response["firmwareType1"] = "0"; // firmware type 1
        $response["firmwareSize1"] = "269012"; // Firmware size 1
        $response["downLicenseKey1"] = "9069c10b45b4486db9077bcaf5356547"; // download authorization code 1
        $response["hashCode1"] = "d2fc383a2e7321a6"; // Hash data 1

        return response($response);
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
