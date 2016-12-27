<?php

namespace AlcoholDelivery;

use Moloquent;
use DB;
use Mail;
use Swift_Mailer;
use Swift_Message;
use Swift_SmtpTransport as SmtpTransport;

use AlcoholDelivery\EmailTemplate as EmailTemplate;

use GuzzleHttp\Client;

class Email extends Moloquent
{

	protected $primaryKey = "_id";
	protected $collection = 'emailtemplates';
	private $type = "";
	private $template = "";
	private $recipient_info;

	/**
	 * Create a new email modal instance.     
	 */
	public function __construct($type)
	{
		if(!$type){
			 return  response(array("error"=>true , "success"=>false , "message"=>" Please Define Type of Email"),400);
		}
		$this->type = $type;

		$mailSubject = '';
		$mailContent = '<div style="font-size: 14px; padding: 10px 15px; background-image: initial; background-attachment: initial;background-color: #1CAF9A; background-size: initial; background-origin: initial; background-clip: initial; background-position: initial; background-repeat: initial;">
		<div style="width:63%;display:inline-block;font-size: 19px;color: #FFF;">Dear {user_name}</div>
		</div>

		<div style="font-size: 14px; padding: 15px 10px; line-height: 20px; color: rgb(66, 65, 67); background-image: initial; background-attachment: initial; background-color: rgb(255, 255, 255); background-size: initial; background-origin: initial; background-clip: initial; background-position: initial; background-repeat: initial;">
		<p>{message}</p>
		<p>&nbsp;</p>
		</div>';
		
		if($type != 'customtemplate'){
			$this->template = EmailTemplate::find($type);

			$mailSubject = $this->template->subject;
			$mailContent = $this->template->content;
		}
		

		$settings = DB::collection('settings')->whereIn('_id',['general','social','email'])->get();
		$config = array();

		foreach($settings as $setting){
			$config[$setting['_id']] = $setting['settings'];
		}

		$siteUrl = url();

		$this->recipient_info = array(

			"sender" => array(
				"name" =>$config['general']['site_title']['value'],
				"email" =>$config['email']['default']['email']
			),
			"receiver" => array(
				"name" =>"",
				"email" =>""
			),
			"subject" => $mailSubject,
			"replace" => array(
				"{website_link}" => $siteUrl,				
				"{site_title}" => $config['general']['site_title']['value'],
				"{link_login}" => $siteUrl."/login",
				"{link_privacy}" => $siteUrl."/privacy-policy",				
				"{link_contact}" => $siteUrl."/contact-us",
				"{social_facebook}" => $config['social']['facebook']['value'],
				"{social_twitter}" => $config['social']['twitter']['value'],
				"{copyright_year}" => date("Y")
			),
			"message" => $mailContent
		);

	}
	
	/* 	Send Mail function 
	 *	@
	 *  Author CGT
	 */
	 public function sendEmail($data = false){
			
		switch($this->type){
			
			case 'welcome':/* begin : Registration Email { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];
				$this->recipient_info["receiver"]['name'] = $data['email'];

				$this->recipient_info["replace"]["{verification_link}"] =url()."/verifyemail/".$data['email_key'];
				$this->recipient_info["replace"]["{user_name}"] = $data['email'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;/* }  end : Registration Email */
			
			case 'welcomeEmailVerified':/* begin : Email verification welcome  { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];
				$this->recipient_info["receiver"]['name'] = $data['email'];
				$this->recipient_info["replace"]["{user_name}"] = $data['email'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;/* }  end : Email verification welcome  */

			case 'login':/* begin : Registration Email from admin { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];
				$this->recipient_info["receiver"]['name'] = $data['email'];

				$this->recipient_info["replace"]["{login_link}"] =url()."/login";
				$this->recipient_info["replace"]["{user_name}"] = $data['email'];
				$this->recipient_info["replace"]["{password}"] = $data['password'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;/* }  end : Registration Email from admin */								

									
			case 'forgot' :  /* begin  : Reset Password Email { */

				$this->recipient_info["receiver"]['email'] = $data['email'];
				$this->recipient_info["receiver"]['name'] = $data['email'];

				if(isset($data['isAdmin'])){
					$this->recipient_info["replace"]["{reset_link}"] =url()."/admin#/resetpassword/".$data['email_key'];
				}else{
					$this->recipient_info["replace"]["{reset_link}"] =url()."/api/reset/".$data['email_key'];	
				}

				$this->recipient_info["replace"]["{user_name}"] = $data['email'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break; /* } end : Reset Password Email */
			
			case 'email_verification': /* begin :  Email Verification { */
				
			break ;/* }  end : Email Verification*/
											
			case 'admin_copy_for_contact_us' : /* admin contact us email copy { */
				
				/* Mail To Admin  */		
				$template = $this->modelSuper->Super_Get(TABLE_EMAIL_TEMPLATES,'emailtemp_key = "contact_us_admin"');	
				
				$admin = $this->modelSuper->Super_Get("users","user_id = 1");
				
				$recipient_info["receiver"]['name'] = getFullName($admin);
				$recipient_info["receiver"]['email'] = $admin['user_email'];			
				$recipient_info["sender"]['name'] = $data['guest_name'];
				$recipient_info["sender"]['email'] = $data['guest_email'];
 
				$recipient_info["replace"]["{user_name}"] = getFullName($admin);
				$recipient_info["replace"]["{guest_name}"] = $data['guest_name'];
				$recipient_info["replace"]["{guest_email}"] = $data['guest_email'];
				$recipient_info["replace"]["{guest_phone}"] = $data['guest_phone'];
				$recipient_info["replace"]["{guest_message}"] = $data['guest_message'];
				
				$recipient_info["subject"] = $template['emailtemp_subject'] ;
				$recipient_info["message"]= str_ireplace(array_keys($recipient_info["replace"]),array_values($recipient_info["replace"]),$template['emailtemp_content']);
			
			break ;/* } end admin contact us email copy  */
			
			case 'user_copy_for_contact_us' : /* user contact us email copy { */
				$template = $this->modelSuper->Super_Get(TABLE_EMAIL_TEMPLATES,'emailtemp_key = "contact_us_user"');
				$recipient_info["receiver"]['name'] = $data['guest_name'];
				$recipient_info["receiver"]['email'] = $data['guest_email'];
				$recipient_info["replace"]["{user_name}"] = $data['guest_name'];
				$recipient_info["subject"] = $template['emailtemp_subject'] ;
				$recipient_info["message"]= str_ireplace(array_keys($recipient_info["replace"]),array_values($recipient_info["replace"]),$template['emailtemp_content']);
			break ;/* } end user contact us email copy  */
			
			case 'contact_us': /* Begin Contact Us Email Section { */
				
				$is_send_to_user = self::sendEmail("user_copy_for_contact_us",$data);
				
				if($is_send_to_user->success){
					$is_send_to_user = self::sendEmail("admin_copy_for_contact_us",$data);
				}
				return $is_send_to_user;
				 
			break; /* } End Contact Us Email Section  */						
			

			case 'notifyuseronproductadd':/* begin : Notification Email { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];
				$this->recipient_info["receiver"]['name'] = $data['username'];

				$this->recipient_info["replace"]["{product_link}"] = url()."/product/".$data['p_id'];
				$this->recipient_info["replace"]["{user_name}"] = $data['username'];
				$this->recipient_info["replace"]["{product_name}"] = $data['product_name'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;

			case 'invite':/* begin : Invitation Email { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];			

				$this->recipient_info["replace"]["{invitation_link}"] = url()."/acceptinvitation/".$data['id'];
				$this->recipient_info["replace"]["{sender_name}"] = $data['sender_name'];				
				$this->recipient_info["replace"]["{user_name}"] = $data['email'];				

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;

			case 'giftcard':/* begin : Gift card send Email { */
								
				$this->recipient_info["receiver"]['email'] = $data['beneficiary']['email'];

				$this->recipient_info["replace"]["{giftcard_link}"] = url()."/getgift/".$data['key'];
				$this->recipient_info["replace"]["{sender_name}"] = $data['sender']['name'];
				$this->recipient_info["replace"]["{sender_message}"] = $data['beneficiary']['message'];
				$this->recipient_info["replace"]["{beneficiary_title}"] = $data['beneficiary']['name'];
				
				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;


			case 'deliverynotification':/* begin : Invitation Email { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];			

				$this->recipient_info["replace"]["{user_name}"] = isset($data['name'])?$data['name']:$data['email'];

				$this->recipient_info["replace"]["{order_number}"] = $data['order_number'];

				$this->recipient_info["replace"]["{time_of_delivery}"] = $data['time_of_delivery'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;

			case 'salenotification':/* begin : Invitation Email { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];			
				$this->recipient_info["receiver"]['name'] = $data['user_name'];

				$this->recipient_info["replace"]["{user_name}"] = $data['user_name'];

				$this->recipient_info["replace"]["{sale_detail}"] = $data['sale_detail'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;

			case 'orderconfirm':/* begin : Order confirm Email { */
								
				$this->recipient_info["receiver"]['email'] = $data['email'];			
				$this->recipient_info["receiver"]['name'] = $data['name'];

				$this->recipient_info["replace"]["{user_name}"] = $data['name'];

				$this->recipient_info["replace"]["{order_number}"] = $data['order_number'];
				$this->recipient_info["replace"]["{order_link}"] = url()."/orderplaced/".$data['order_id'];
				

				$this->recipient_info["replace"]["{order_detail}"] = $data['order_detail'];

				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				
			break ;

			case 'customtemplate':
								
				$this->recipient_info["receiver"]['email'] = $data['email'];
				$this->recipient_info["replace"]["{user_name}"] = isset($data['name'])?$data['name']:$data['email'];
				$this->recipient_info["replace"]["{message}"] = $data['message'];
				$this->recipient_info["message"] = str_ireplace(array_keys($this->recipient_info["replace"]),array_values($this->recipient_info["replace"]),$this->recipient_info["message"]);
				$this->recipient_info["subject"] = $data['subject'];
			break ;

			
			default:return  (object)array("error"=>true , "success"=>false , "message"=>" Please Define Proper Type for  Email");
									
		}

		try {			
				
				/*LAYOUT BASED MAIL*/

				$data = ['content' => $this->recipient_info['message'],'replace'=>$this->recipient_info['replace']];
				//$this->recipient_info["receiver"]['email'] = 'anuragcgt@gmail.com';

				Mail::send('emails.mail', $data, function ($message) {
					$message->setTo(array($this->recipient_info["receiver"]['email']=>$this->recipient_info["receiver"]['name']));
					$message->setSubject($this->recipient_info['subject']);
				});
				
				// Backup your default mailer
				/*$backup = Mail::getSwiftMailer();

				// Setup your gmail mailer
				$transport = SmtpTransport::newInstance('aspmx.l.google.com', 25, 'tls');
				$transport->setUsername('alcoholdeliveryis@gmail.com');
				$transport->setPassword('@lcohol1234#*12');

				$message = Swift_Message::newInstance();;
				$message->setTo(array($this->recipient_info["receiver"]['email']=>$this->recipient_info["receiver"]['name']));

				$message->setFrom($this->recipient_info["sender"]['email'],$this->recipient_info["sender"]['name']);				
				
				$message->setSubject($this->recipient_info['subject']);
				$message->setBody($this->recipient_info['message'],'text/html');
								

				$mailer = Swift_Mailer::newInstance($transport);
				$mailer->send($message);		       

				// Restore your original mailer
				Mail::setSwiftMailer($backup);*/
			
		} catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()),422);
				
		}										

		return true;//response(array("error"=>false , "success"=>true , "message"=>" Mail Successfully Sent"));	

	 }	 

	 public static function sendSms($to,$message,$live = false){ 	
	 	$data = [];
	 	$data['app_id'] = 'P58Pj7OmUdXCVLAr';
	 	$data['access_token'] = 'raAgFSlPDk656ECe';
	 	if($live){
			$data['app_id'] = '5NzoHw54tcPCjWBa';
	 		$data['access_token'] = 'xIpKlcaqSBjIUfVL';	 		
	 	}
        $data['dest'] = $to;
	 	$data['msg'] = $message;     

	 	$client = new Client();
        $res = $client->request('POST', 'https://secure.hoiio.com/open/sms/send', [
            'form_params'=>$data
        ]);                
        $result = $res->getBody();
        $result = json_decode($result);         
        return (isset($result->{'status'}) && $result->{'status'}=='success_ok');
	 }	 
					
}