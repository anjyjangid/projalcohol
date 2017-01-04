<?php
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
 */

/*TO VIEW MAIL TEMPLATE*/



Route::get('/printjob/{reference}', 'OrderController@getOrderdetail');

Route::get('/morphing', function(){
	return view('invoice.morph');
});

Route::group(['prefix' => 'adminapi'], function () {

	Route::controller('auth', 'Auth\AdminAuthController');

	Route::controller('password', 'Auth\AdminPasswordController');

});


Route::group(['prefix' => 'adminapi','middleware' => 'admin'], function () {
	
	Route::put('order/confirmorder/{cartKey}','Admin\OrderController@confirmorder');
	
	Route::get('order/confirmorder','Admin\OrderController@confirmorder');	

	Route::resource('order', 'Admin\OrderController',['except'=>'show']);
	Route::controller('order', 'Admin\OrderController');

	//Route::put('deploycart/{cartKey}','CartController@deploycart');
	
	Route::resource('product', 'Admin\ProductController',['only'=>['update','store']]);
	Route::controller('product', 'Admin\ProductController');

	Route::controller('admin', 'Admin\AdminController');
	Route::controller('usergroup', 'Admin\UserGroupController');
	
	Route::resource('customer', 'Admin\CustomerController');
	Route::controller('customer', 'Admin\CustomerController');

	Route::resource('business', 'Admin\BusinessController');
	Route::controller('business', 'Admin\BusinessController');	
	
	Route::group(['prefix' => 'global'], function () {		
		Route::get('status/{id}/{table}/{status}','Admin\GlobalController@setstatus');
		Route::get('getcountries','Admin\GlobalController@getcountries');		
		Route::get('browsegraphics','Admin\GlobalController@browsegraphics');
		Route::post('uploadgraphics','Admin\GlobalController@uploadgraphics');
	});

	Route::resource('dealer', 'Admin\DealerController',['only'=>['store','update']]);
	Route::controller('dealer', 'Admin\DealerController');

	Route::resource('category', 'Admin\CategoryController',['only'=>['store','update']]);
	Route::controller('category', 'Admin\CategoryController');

	Route::resource('setting', 'Admin\SettingController',['only'=>'update']);
	Route::controller('setting', 'Admin\SettingController');

	Route::controller('package', 'Admin\PackageController');

	Route::resource('emailtemplate', 'Admin\EmailTemplateController',['only'=>'update']);
	Route::controller('emailtemplate', 'Admin\EmailTemplateController');

	Route::resource('cms', 'Admin\CmsController',['only'=>'update']);
	Route::controller('cms', 'Admin\CmsController');

	Route::resource('testimonial', 'Admin\TestimonialController',['only'=>['update','store','show','destroy']]);
	Route::controller('testimonial', 'Admin\TestimonialController');

	Route::resource('brand', 'Admin\BrandController',['only'=>['update','store','show','destroy']]);
	Route::controller('brand', 'Admin\BrandController');

	Route::resource('promotion', 'Admin\PromotionController',['only'=>['update','store','show','destroy']]);
	Route::controller('promotion', 'Admin\PromotionController');

	Route::resource('coupon', 'Admin\CouponController',['only'=>['update','store','show','destroy']]);
	Route::controller('coupon', 'Admin\CouponController');

	Route::resource('holiday', 'Admin\HolidayController',['only'=>['update','store','destroy']]);
	Route::controller('holiday', 'Admin\HolidayController');

	Route::resource('gift', 'Admin\GiftController',['only'=>['store','show','index']]);
	Route::controller('gift', 'Admin\GiftController');

	Route::resource('dontmiss', 'Admin\DontMissController');
	
	Route::resource('giftcategory', 'Admin\GiftCategoryController',['only'=>['store','edit','index']]);
	Route::controller('giftcategory','Admin\GiftCategoryController');

	Route::resource('sale', 'Admin\SaleController',['only'=>['store','show','update','destroy']]);
	Route::controller('sale', 'Admin\SaleController');

	Route::resource('stores', 'Admin\StoreController',['only'=>['store','edit','update']]);
	Route::controller('stores', 'Admin\StoreController');

	Route::resource('stocks', 'Admin\StocksController',['only'=>['store']]);
	Route::controller('stocks', 'Admin\StocksController');

	Route::resource('company', 'Admin\CompanyController',['only'=>['show']]);
	Route::controller('company', 'Admin\CompanyController');

	Route::resource('purchaseorder', 'Admin\PurchaseOrderController');
	Route::controller('purchaseorder', 'Admin\PurchaseOrderController');

	Route::post('address/{id}','AddressController@store');
	// Route::controller('address', 'AddressController');

	Route::post('checkCoupon/{id}','CouponController@checkCoupon');
	
	Route::post('payment/addcard/{id}','PaymentController@postAddcard');

});

Route::group(['prefix' => 'admin'], function () {
	Route::any('{catchall}', function ( $page ) {
	    return view('backend');    
	} )->where('catchall', '(.*)');

	Route::get('/', function () {
	    return view('backend');
	});	
});

Route::get('/', function () {	    
    return view('frontend');
});

/**/

Route::group(['prefix' => 'api'], function () {

	Route::controller('/auth', 'Auth\AuthController');

	Route::controller('/super', 'SuperController');

	Route::controller('/category', 'CategoryController');

	Route::get('/getproduct', 'ProductController@getproduct');

	Route::get('/fetchProducts', 'ProductController@fetchProducts');

	Route::get('/search', 'ProductController@getproduct');

	Route::get('/getproductdetail', 'ProductController@getproductdetail');

	Route::get('/product/alsobought/{cartKey}/{productSlug}', 'ProductController@getAlsobought');

	Route::controller('/password', 'Auth\PasswordController');

	Route::get('reset/{key}', 'Auth\PasswordController@reset');

	Route::put('deploycart/{cartKey}','CartController@deploycart');

	Route::get('freezcart/{cartKey}','CartController@freezcart');

	Route::group(['middleware' => 'auth'], function () {

		Route::controller('loyalty', 'LoyaltyController');
		Route::resource('loyalty', 'LoyaltyController');

		Route::controller('credits', 'CreditsController');
		
		Route::resource('credits', 'CreditsController');

		Route::resource('address', 'AddressController');

		Route::controller('coupon', 'CouponController');
		
		Route::put('confirmorder/{cartKey}','CartController@confirmorder');
		
		Route::post('checkCoupon','CouponController@checkCoupon');

	});

	Route::put('test/confirmorder/{cartKey}','CartController@confirmordertest');

	Route::group(['prefix' => 'cart'], function () {

		Route::get('deliverykey','CartController@getDeliverykey');

		Route::get('services','CartController@getServices');	
		
		/**/
		Route::get('timeslots/{date}','CartController@getTimeslots');

		Route::post('repeatlast','CartController@postRepeatlast');

		Route::put('bulk','CartController@putBulk');
		
		Route::put('bulk/{cartkey}','CartController@putBulk');

		Route::put('loyalty/{cartKey}','CartController@putLoyalty');

		Route::put('loyalty/credit/{cartKey}','CartController@putCreditCertificate');
		
		Route::delete('loyalty/{cartKey}/{key}/{type}','CartController@deleteLoyaltyProduct');

		Route::delete('loyaltycard/{cartKey}/{key}','CartController@deleteLoyaltyCard');
		
		Route::put('chilled/loyalty/{cartkey}','CartController@updateLoyaltyChilledStatus');
		
		/*Route::group(['middleware' => 'auth'], function () {



		});*/

		Route::get('availability/{cartkey}','CartController@availability');

		Route::put('merge/{cartKey}','CartController@mergecarts');

		Route::put('chilledstatus/{cartkey}','CartController@updateProductChilledStatus');

		Route::put('promoChilledStatus/{cartkey}','CartController@updatePromoChilledStatus');
		
		Route::post('package/{cartKey}','CartController@postPackage');

		Route::put('package/{uid}/{cartKey}','CartController@putPackage');

		Route::delete('package/{key}/{cartKey}','CartController@deletePackage');
		
		Route::put('promotion/{cartkey}','CartController@putPromotion');

		Route::delete('product/{cartKey}/{key}/{type}','CartController@deleteProduct');

		Route::delete('promotion/{cartKey}/{key}','CartController@deletePromotion');

		Route::delete('card/{cartKey}/{key}','CartController@deleteCard');

		Route::delete('sale/{cartKey}/{saleId}','CartController@deleteSale');

		Route::put('sale/chilled/{cartKey}','CartController@putSaleChilledStatus');

		Route::delete('gift/{key}/{cartKey}','CartController@deleteGift');

		Route::put('gift/{cartKey}','CartController@putGift');
		
		Route::post('giftcard/{cartKey}','CartController@postGiftcard');

		Route::put('giftcard/{uid}','CartController@putGiftcard');

		Route::put('gift/product/chilledtoggle/{giftUid}','CartController@putGiftProductChilledStatus');

	});

	Route::get("mailOrderPlaced/{orderRef}","OrderController@getMailOrderPlaced");

	Route::controller('suggestion', 'SuggestionController');
	Route::resource('cart', 'CartController');
	Route::resource('wishlist', 'WishlistController');
	Route::get('/order/summary/{id}','OrderController@getSummary');
	Route::get('/order/orders','OrderController@getOrders');
	Route::get('/order/to-repeat','OrderController@getToRepeat');
	Route::get('/order/{order}','OrderController@show');
	Route::post('/order/{id}','OrderController@update');
	Route::resource('package', 'PackageController',['only'=>['*']]);
	Route::controller('package', 'PackageController');
	Route::resource('site', 'SiteController',['only'=>['*']]);
	Route::controller('site', 'SiteController');
	Route::resource('loyaltystore', 'LoyaltyStoreController',['only'=>['index']]);
	Route::controller('loyaltystore', 'LoyaltyStoreController');
	Route::get('/check', 'UserController@check');
	Route::post('/auth', 'UserController@checkAuth');
	Route::get('/loggedUser', 'UserController@loggedUser');
	Route::put('/profile', 'UserController@update');
	Route::put('/password', 'UserController@updatepassword');
	Route::controller('user', 'UserController');
	Route::controller('giftcategory', 'GiftCategoryController');
	Route::resource('giftcategory', 'GiftCategoryController',['only'=>['index','show']]);
	Route::resource('gift', 'GiftController',['only'=>['show']]);
	Route::controller('payment', 'PaymentController');

});

/*PRODUCT IMAGE ROUTUING*/
Route::get('products/i/{folder}/{filename}', function ($folder,$filename){

	if(!file_exists(storage_path('products/') .$folder. '/' . $filename)){
		
		return Image::make(public_path('images').'/product-default.jpg')->response();
		//$filename = "product-default.jpg";
	}
    
    return Image::make(storage_path('products/') .$folder. '/' . $filename)->response();

});

//ASSET IMAGE ROUTES
Route::get('asset/i/{filename}', function ($filename){
    return Image::make(public_path('img') . '/' . $filename)->response();
});

//COMMON IMAGE ROUTES 
Route::get('{storageFolder}/i/{filename}', function ($storageFolder,$filename){
	/*
	* $storageFolder possible values
	* 
	* products
	* packages
	* sale	
	* gifts
	* giftcategory
	* company
	*
	*/	
	if(!file_exists(storage_path($storageFolder) . '/' . $filename)){
		return Image::make(public_path('images').'/product-default.jpg')->response();		
	}
	
    return Image::make(storage_path($storageFolder) . '/' . $filename)->response();
});


//EXTERNAL URL LIST
Route::get('confirmorder','CartController@confirmorder');
Route::get('confirmordermanual/{key}','CartController@confirmordermanual');
Route::get('saleNotification','CartController@saleNotification');//for AP testing

Route::get('verifyemail/{key}', 'Auth\AuthController@verifyemail');


$fixPagesLinks = [
	//'events' => 'pages/event-planner',
	//'menu' => 'beer',
	//'how_to_order' => 'pages/how-to-order',
	"snacks"=>"snacks-entertainment-miscellaneous/snacks",
	"champagne"=>"champagne-sparkling-wine",
	"gordons_london_dry_gin"=>"product/gordons-london-dry-gin-75cl",
	"mixers"=>"mixers-beverages",
	"belvedere_pure_vodka"=>"product/belvedere-pure-vodka-70cl",
	"hakushu_12yrs"=>"product/hakushu-12-years-70cl",
	"Ohshukubai_Umeshu"=>"product/ohshukubai-umeshu-72cl",
	"champagne_saber"=>"champagne-sparkling-wine",
	"red_wine"=>"red-wine",
	"Ginrei_Gassan_Junmai_Daiginjyo"=>"product/ginrei-gassan-junmai-daiginjo-300ml",
	"menu"=>"beer-cider",
	"Monkey_47"=>"product/monkey-47-50cl",
	"Louis_Jadot_Pouilly_Fuisse"=>"product/louis-jadot-pouilly-fuisse-75cl-2014",
	"hoegaarden_white_beer"=>"product/hoegaarden-white-beer-330ml",
	"bacardi"=>"search/bacardi",
	"pokka_green_tea"=>"product/pokka-green-tea-15litres",
	"veuve_clicquot_yellow_label"=>"product/veuve-clicquot-yellow-label-75cl",
	"Red_Wine_Japan"=>"red-wine/japan",
	"Hibiki_Suntory_12_Years"=>"product/hibiki-suntory-12-years-70cl",
	"Archers_Peach_Schnapps"=>"product/archers-peach-schnapps-70cl",
	"cider"=>"beer-cider/cider",
	"martell_cordon_bleu_70"=>"product/martell-cordon-bleu-70cl",
	"tanqueray_gin"=>"product/tanqueray-gin-70cl",
	"hennessy_with_cradle"=>"product/hennessy-vsop-3litres-with-cradle",
	"san_pellegrino_sparkling_mineral_water"=>"product/san-pellegrino-sparkling-mineral-water-75cl",
	"chivas_regal_royal_salute_21yrs_emerald"=>"product/chivas-regal-royal-salute-21yrs-emerald-70cl",
	"twisties_bbq_curry"=>"product/twisties-bbq-curry-70g",
	"single_malt_whisky"=>"whisky/single-malt-whisky",
	"sake"=>"sake-shochu-umeshu-soju/sake",
	"events"=>"pages/events-or-bulk-purchase",
	"Cachaca_51"=>"product/cachaca-51-75cl",
	"chivas_regal_12yrs"=>"product/chivas-regal-12yrs-75cl",
	"Southern_Comfort"=>"product/southern-comfort-75cl",
	"5Litre_Beer_Keg"=>"beer-cider/5l20l30l-kegs",
	"Bombay_Sapphire"=>"product/bombay-sapphire-75cl",
	"royal_dragon_vodka"=>"vodka",
	"promotion"=>"pages/events-or-bulk-purchase",
	"whiskies_scotch"=>"whisky/blended-scotch-whisky",
	"kahlua_coffee"=>"product/kahlua-coffee-75cl",
	"Alcohol_Miniature"=>"alcohol-miniatures",
	"johnnie_walker_red_label"=>"product/johnnie-walker-red-label-70cl",
	"Lagavulin_16_Years"=>"product/lagavulin-16-years-70cl",
	"Iichiko_Hitajyoryusho_Kogane_No_Imo_Shochu"=>"product/iichiko-hitajyoryusho-kogane-no-imo-shochu-70cl",
	"jim_beam_white_label"=>"product/jim-beam-white-label-75cl",
	"Chamisul_Soju"=>"product/chamisul-soju-360ml",
	"makers_mark"=>"product/makers-mark-75cl",
	"Monkey_47_Sloe_Gin"=>"product/monkey-47-sloe-gin-50cl",
	"hennessy_vsop_with_Cradle"=>"product/hennessy-vsop-3litres-with-cradle",
	"courvoisier_vsop_exclusif"=>"product/courvoisier-vsop-exclusif-70cl",
	"Campari"=>"product/campari-70cl",
	"martell_vsop_with_cradle"=>"product/martell-vsop-3litres-with-cradle",
	"kronenbourg_1664_blanc"=>"product/kronenbourg-1664-blanc-330ml",
	"remy_martin_louis_xiii"=>"product/remy-martin-louis-xiii-70cl",
	"red_bull_silver"=>"search/red%20bull",
	"ice_pack"=>"product/ice-pack-25kg",
	"grey_goose_original"=>"product/grey-goose-original-75cl",
	"asahi_black"=>"product/asahi-dry-black-334ml",
	"myers_dark_rum"=>"product/myers-dark-rum-75cl",
	"Ciroc_Vodka"=>"product/ciroc-vodka-75cl",
	"moet_and_chandon_rose"=>"product/moet-chandon-rose-75cl",
	"macallan_18yrs_sherry_oak"=>"product/macallan-18yrs-sherry-oak-70cl",
	"Reserve_de_la_Comtesse_2008"=>"product/reserve-de-la-comtesse-2009-75c",
	"Monkey_Shoulder"=>"product/monkey-shoulder-70cl",
	"martell_cordon_bleu_with_cradle"=>"product/martell-cordon-bleu-3litres-with-cradle",
	"corona_extra"=>"product/corona-extra-355ml",
	"somersby_apple_cider"=>"product/somersby-apple-cider-330ml",
	"johnnie_walker_gold_label_reserve"=>"product/johnnie-walker-gold-label-reserve-75cl",
	"bacardi_breezer_peach"=>"premix-alcopops",
	"perrier_jouet_grand_brut_blanc_champagne"=>"product/perrier-jouet-grand-brut-blanc-champagne-75cl",
	"johnnie_walker_black_label"=>"product/johnnie-walker-black-label-70cl",
	"yamazaki_12yrs"=>"product/yamazaki-12yrs-70cl",
	"captain_morgan_spiced_gold"=>"product/captain-morgan-spiced-gold-75cl",
	"skyy_vodka"=>"product/skyy-vodka-75cl",
	"stella_artois"=>"product/stella-artois-330ml",
	"Godo_Tan_Taka_Tan_Umeshu"=>"product/godo-tan-taka-tan-umeshu-50cl",
	"jagermeister"=>"product/jagermeister-70cl",
	"jack_daniels"=>"product/jack-daniels-75cl",
	"medinet_red_rouge_1litre"=>"product/medinet-red-rouge-1litre",
	"erdinger_weissbier"=>"product/erdinger-weissbier-500ml",
	"Ozeki_Hana_Fu_Ga_Sparkling_Sake"=>"product/ozeki-hana-fu-ga-sparkling-sake-peach-250ml",
	"how_to_order"=>"pages/how-to-order",
	"vodka/skyy_vodka"=>"product/skyy-vodka-75cl",
	"craft_beer/Yona_Yona_Ale"=>"product/yona-yona-ale-350ml",
	"snacks/calbee_prawn_crackers"=>"product/calbee-prawn-crackers-70g",
	"craft_beer/Hitachino_Nest_White_Ale"=>"product/hitachino-nest-white-ale-330ml",
	"craft_beer/Warsteiner_Premium_Verum"=>"product/warsteiner-premium-verum-330ml",
	"beer/tiger_beer"=>"product/tiger-beer-323ml",
	"beer/kronenbourg_1664"=>"product/kronenbourg-1664-330ml",
	"vodka/absolut_vodka_ruby_red"=>"product/absolut-vodka-ruby-red-75cl",
	"vodka/belvedere_pure_vodka"=>"product/belvedere-pure-vodka-70cl",
	"miscellaneous_items/disposable_wine_glass"=>"product/disposable-wine-glass-220ml",
	"Japanese_Whisky/Hibiki_Suntory_12_Years"=>"product/hibiki-suntory-12-years-70cl",
	"craft_beer/Brewerkz_Golden_Ale"=>"product/brewerkz-golden-ale-500ml",
	"snacks/doritos_taco"=>"product/doritos-taco-1984g",
	"craft_beer/Kwak_Belgium"=>"product/kwak-belgium-330ml",
	"liqueur/kahlua_coffee"=>"product/kahlua-coffee-75cl",
	"mixers/7Up_325ml"=>"product/sprite-330ml",
	"liqueur/Cointreau_Orange_Liqueur"=>"product/cointreau-orange-liqueur-70cl",
	"vodka/42_below_pure_vodka"=>"product/42-below-pure-vodka-70cl",
	"mixers/just_juice_pineapple"=>"product/ripe-juice-pineapple-1litre",
	"single_malt_whisky/Balvenie_14yrs_Caribbean_Cask"=>"product/balvenie-14yrs-caribbean-cask-75cl",
	"snacks/twisties_chicken"=>"product/twisties-chicken-70g",
	"whiskies_scotch/famous_grouse_scotch"=>"product/famous-grouse-scotch-70cl",
	"vodka/Absolut_Vodka_Blue"=>"product/absolut-vodka-blue-75cl",
	"beer/Hoegaarden_Rose"=>"product/hoegaarden-rose-250ml",
	"Red_Wine_France/medinet_red_rouge_1litre"=>"product/medinet-red-rouge-1litre",
	"craft_beer/Abita_Wrought_Iron_IPA"=>"product/abita-wrought-iron-ipa-355ml",
	"mixers/coca_cola"=>"product/coca-cola-15litres",
	"mixers/schweppes_ginger_ale"=>"product/schweppes-ginger-ale-330ml",
	"beer/sapporo_beer"=>"product/sapporo-premium-beer-330ml",
	"beer/Kilkenny_Irish_Beer"=>"product/kilkenny-irish-ale-440ml",
	"5Litre_Beer_Keg/Tiger_Beer_Keg_30Litre"=>"product/tiger-beer-keg-30-litre-dispenser-co2-gas-36kg-ice",
	"gin_rum/Cachaca_51"=>"product/cachaca-51-75cl",
	"Bol's_Liqueur"=>"search/bol's",
	"champagne/perrier_jouet_grand_brut_blanc_champagne_75cl"=>"product/perrier-jouet-grand-brut-blanc-champagne-75cl",
	"vodka/grey_goose_original"=>"product/grey-goose-original-75cl",
	"liqueur/jagermeister"=>"product/grey-goose-original-75cl",
	"White_Wine_Germany/Diel_de_Diel_2012"=>"product/diel-de-diel-2012-75cl",
	"whiskies_scotch/Johnnie_Walker_Swing"=>"product/johnnie-walker-swing-70cl",
	"snacks/camel_mixed_snacks"=>"product/camel-mixed-snacks-150g",
	"snacks/pringles_smoky_bbq"=>"product/pringles-smoky-bbq-150g",
	"sparkling_wine/cafe_de_paris_blac_de_blancs_brut_sparkling_75cl_(France)"=>"product/cafe-de-paris-blac-de-blancs-brut-sparkling-75cl",
	"vodka/absolut_vodka_kurant"=>"product/absolut-vodka-kurant-75cl",
	"liqueur/baileys_original"=>"product/baileys-original-75cl",
	"mixers/ripe_juice_orange"=>"product/ripe-juice-orange-1litre",
	"vodka/absolute_vodka_apeach"=>"product/absolut-vodka-apeach-75cl",
	"Red_Wine_Spain/Torres_Sangre_de_Toro"=>"product/torres-sangre-de-toro-2014-75cl",
	"Hendrick's_Gin"=>"product/hendricks-gin-70cl",
	"snacks/calbee_hot_and_spicy"=>"product/calbee-hot-spicy-80g",
	"Red_Wine_Chile/Miguel_Torres_Hemisferio_Cabernet_Sauvignon"=>"product/miguel-torres-hemisferio-cabernet-sauvignon-2015-75cl",
	"whiskies_scotch/Monkey_Shoulder"=>"product/monkey-shoulder-70cl",
	"single_malt_whisky/Lagavulin_16_Years"=>"product/lagavulin-16-years-70cl",
	"red_wine/Casa_Bella_Lambrusco_Dolce"=>"product/casa-bella-lambrusco-dolce-vino-frizzante-75cl",
	"champagne_saber/champagne_saber"=>"champagne-sparkling-wine",
	"whiskies_scotch/johnnie_walker_gold_label_reserve"=>"product/johnnie-walker-gold-label-reserve-75cl",
	"white_wine_italy/Ruffino_Libaio_Chardonnay"=>"product/ruffino-libaio-chardonnay-igt-2014-75cl",
	"mixers/red_bull_silver"=>"product/red-bull-silver-250ml",
	"whiskies_scotch/chivas_regal_12yrs"=>"product/chivas-regal-12yrs-75cl",
	"Red_Wine_Australia/Whip_Hand_Cabernet_Sauvignon"=>"product/whip-hand-cabernet-sauvignon-2006-75cl",
	"vodka/smirnoff_orange_twist"=>"product/smirnoff-orange-twist-75cl",
	"snacks/Nacho_Salsa_Dip"=>"product/el-sabor-nacho-salsa-dip-175g",
	"champagne/veuve_cliquot_rose_nv"=>"product/veuve-cliquot-rose-nv-75cl",
	"cider/Somersby_Pear_Cider"=>"product/somersby-pear-cider-330ml",
	"mixers/schweppes_tonic_water"=>"product/schweppes-tonic-water-330ml",
	"bourbon/Jim_Beam_Honey"=>"product/jim-beam-honey-70cl",
	"Alcohol_Miniature/Absolut_Vodka_Mango"=>"product/absolut-vodka-mango-75cl",
	"White_Wine_France/medinet_white_blanc"=>"product/medinet-blanc-1litre",
	"craft_beer/Little_Creatures_Pale_Ale"=>"product/little-creatures-pale-ale-330ml",
	"craft_beer/Duvel_Belgium"=>"product/duvel-belgium-330ml",
	"single_malt_whisky/Macallan_15yrs_Fine_Oak"=>"product/macallan-15yrs-fine-oak-70cl",
	"whiskies_scotch/johnnie_walker_red_label"=>"product/johnnie-walker-red-label-70cl",
	"5Litre_Beer_Keg/Heineken_Beer_Keg_30Litre_[Dispenser_+_CO2_Gas_+_18KG_Ice]"=>"product/heineken-beer-keg-30-litre-dispenser-co2-gas-36kg-ice",
	"craft_beer/HITE_Beer"=>"product/hite-beer-330ml",
	"liqueur/Fireball_Cinnamon_Whisky"=>"product/fireball-cinnamon-whisky-70cl",
	"premixed_alcopops/bacardi_breezer_orange"=>"premix-alcopops",
	"liqueur/Sambucca_Vacarri"=>"product/sambucca-vacarri-70cl",
	"craft_beer/Chimay_Blue"=>"product/chimay-blue-330ml",
	"beer/carlsberg"=>"product/carlsberg-323ml",
	"aperitifs/Martini_Rosso"=>"product/martini-rosso-100cl",
	"gin_rum/captain_morgan_spiced_gold"=>"product/captain-morgan-spiced-gold-75cl",
	"Red_Wine_France/Reserve_de_la_Comtesse_2009_75cl"=>"product/reserve-de-la-comtesse-2009-75c",
	"liqueur/Bol’s_Blue_Curacao"=>"product/bols-blue-curacao-70cl",
	"whiskies_scotch/chivas_regal_25yrs"=>"product/chivas-regal-25yrs-75cl",
	"Red_Wine_Argentina/Aruma_Malbec_2011_Lafite"=>"product/aruma-malbec-2011-lafite-2014-75cl",
	"vodka/42_below_vodka_feijoa"=>"product/42-below-vodka-feijoa-75cl",
	"gin_rum/bacardi_Big_apple"=>"product/bacardi-big-apple-75cl",
	"Red_Wine_France/Louis_Jadot_Gevrey_Chambertin"=>"product/louis-jadot-gevrey-chambertin-2011-75cl",
	"single_malt_whisky/Kavalan_Single_Malt"=>"product/kavalan-single-malt-70cl",
	"brandy_cognac/martell_xo_70"=>"product/martell-xo-70cl",
	"brandy_cognac/martell_cordon_bleu_70"=>"product/martell-cordon-bleu-70cl",
	"brandy_cognac/martell_vsop_with_cradle"=>"product/martell-vsop-3litres-with-cradle",
	"vodka/Russian_Standard"=>"product/russian-standard-75cl",
	"brandy_cognac/remy_martin_louis_xiii"=>"product/remy-martin-louis-xiii-70cl",
	"premixed_alcopops/jack_daniels_cola"=>"premix-alcopops",
	"miscellaneous_items/ice_bucket"=>"product/ice-bucket-2l-without-ice",
	"bourbon/jim_beam_white_label"=>"product/jim-beam-white-label-75cl",
	"gin_rum/bacardi"=>"search/bacardi",
	"whiskies_scotch/Canadian_Club"=>"product/canadian-club-75cl",
	"aperitifs/Campari"=>"product/campari-70cl",
	"tequila/sauza_extra_gold"=>"product/sauza-extra-gold-75cl",
	"champagne/dom_perignon_2004_vintage"=>"product/dom-perignon-2003-vintage-with-gift-box-75cl",
	"tequila/don_julio_reposado"=>"product/don-julio-reposado-75cl",
	"mixers/schweppes_soda_water"=>"product/schweppes-soda-water-330ml",
	"gin_rum/malibu_coconut_rum"=>"product/malibu-coconut-rum-75cl",
	"vodka/vox_vodka"=>"product/vox-vodka-70cl",
	"miscellaneous_items/plastic_cup"=>"product/disposable-cup-400ml",
	"premixed_alcopops/singapore_sling_ready_to_drink_original_250ml"=>"product/singapore-sling-ready-to-drink-original-250ml",
	"single_malt_whisky/Balvenie_17yrs_Doublewood"=>"product/balvenie-17yrs-doublewood-75cl",
	"mixers/ripe_juice_cranberry"=>"product/ripe-juice-cranberry-1litre",
	"whiskies_scotch/chivas_regal_royal_salute_21yrs_sapphire."=>"product/chivas-regal-royal-salute-21yrs-sapphire-70cl",
	"brandy_cognac/hennessy_vsop_70"=>"product/hennessy-vsop-70cl",
	"premixed_alcopops/Bacardi_Breezer_Strawberry"=>"premix-alcopops",
	"beer"=>"beer-cider",
	"asahi_super_dry"=>"product/asahi-super-dry-334ml",
	"white_wine"=>"white-wine",
	"brandy_cognac"=>"brandy-cognac",
	"rosé_wine"=>"champagne-sparkling-wine",
	"Minuit_Rose_Vendanges_Nocturnes"=>"champagne-sparkling-wine",
	"sparkling_wine"=>"champagne-sparkling-wine",
	"sparkling_wine/Bottega_Prosecco_Gold_Plated"=>"product/bottega-prosecco-brut-gold-plated-75cl",
	"sparkling_wine/Bottega_Prosecco_Brut_Gold_Plated"=>"product/bottega-prosecco-brut-gold-plated-75cl",
	"premixed_alcopops/bacardi_breezer_peach"=>"premix-alcopops",
	"liqueur/baileys_original"=>"product/baileys-original-75cl",
	"bourbon"=>"whisky/bourbon-rye",
	"jim_beam_black_label"=>"product/jim-beam-black-label-75cl",
	"kentucky_gentleman"=>"whisky/bourbon-rye",
	"bulleit_bourbon"=>"product/bulleit-bourbon-whiskey-70cl",
	"aperitifs"=>"aperitifs-digestifs-vermouth",
	"aperitifs/Campari"=>"product/campari-70cl",
	"aperitifs/Ricard"=>"product/ricard-75cl",
	"whiskies_scotch/Laphroaig_10_Years"=>"product/laphroaig-10-years-75cl",
	"whiskies_scotch/Laphroaig_Quarter_Cask"=>"product/laphroaig-quarter-cask-70cl",
	"whiskies_scotch/Highland_Park_12_Years"=>"product/highland-park-12-years-70cl",
	"whiskies_scotch/Monkey_Shoulder"=>"product/monkey-shoulder-70cl",
	"whiskies_scotch/Lagavulin_16_Years"=>"product/lagavulin-16-years-70cl",
	"whiskies_scotch/Hibiki_Suntory_12_Years"=>"product/hibiki-suntory-12-years-70cl",
	"whiskies_scotch/yamazaki_12yrs"=>"product/yamazaki-12yrs-70cl",
	"whiskies_scotch/hakushu_12yrs"=>"product/hakushu-12-years-70cl",
	"brandy_cognac/Martell_Chanteloup_Perspective"=>"brandy-cognac",
	"vodka/royal_dragon_vodka"=>"vodka",
	"tequila/Sierra_Tequila_Gold"=>"tequila",
	"gin_rum/Bacardi_Razz"=>"product/bacardi-razz-75cl",
	"gin_rum/Beefeater_Gin"=>"product/beefeater-75cl",
	"gin_rum/Captain_Morgan_Dark_Rum"=>"product/captain-morgan-dark-rum-70cl",
	"liqueur/Absinthe_Jacques_Senaux_Black"=>"product/absinthe-jacques-senaux-black-70cl",
	"liqueur/Absinthe_Jacques_Senaux_Blue"=>"product/absinthe-jacques-senaux-blue-70cl",
	"liqueur/Archers_Peach_Schnapps"=>"product/archers-peach-schnapps-70cl",
	"liqueur/Midori_Melon"=>"product/midori-melon-70cl",
	"liqueur/Jim_Beam_Sourz_Apple"=>"product/sourz-apple-70cl",
	"liqueur/De_Kuyper_Butterscotch"=>"product/bols-butterscotch-70cl",
	"liqueur/Cointreau_Orange_Liqueur"=>"product/cointreau-orange-liqueur-70cl",
	"liqueur/Sambucca_Vacarri"=>"product/sambucca-vacarri-70cl",
	"liqueur/Galliano"=>"product/galliano-lautentico-70cl",
	"liqueur/Southern_Comfort"=>"product/southern-comfort-75cl",
	"liqueur/Southern_Comfort_Lime"=>"product/southern-comfort-lime-75cl",
	"liqueur/Grand_Marnier_Cordon_Rouge"=>"product/grand-marnier-cordon-rouge-70cl",
	"liqueur/Pernod_Liqueur"=>"search/pernod",
	"single_malt_whisky"=>"whisky/single-malt-whisky",
	"Oban_14yrs"=>"product/oban-14yrs-75cl",
	"glenfiddich_12yrs"=>"product/glenfiddich-12yrs-75cl",
	"Glenlivet_15yrs"=>"product/glenlivet-15yrs-75cl",
	"Japanese_Whisky"=>"whisky/japanese-whisky",
	"Hibiki_Suntory_17yrs"=>"product/hibiki-suntory-17-years-70cl",
	"Bol’s_Liqueur"=>"search/bol's",
	"bol's_ameretto"=>"product/bols-ameretto-70cl",
	"Red_Wine_Argentina"=>"red-wine/argentina",
	"Amancaya_Malbec_Cabernet_Sauvignon_2011"=>"product/amancaya-cabernet-blend-2013-75cl",
	"Aruma_Malbec_2011_Lafite"=>"product/aruma-malbec-2011-lafite-2014-75cl",
	"Caro_2010_Malbec_Cabernet_Sauvignon"=>"product/caro-2013-malbec-cabernet-sauvignon-75cl",
	"Red_Wine_Australia"=>"red-wine/australia",
	"brokenwood_rayner_vineyard_shiraz_2003"=>"red-wine/australia",
	"grant_burge_meshach_shiraz_2002"=>"red-wine/australia",
	"jacobs_creek_cabernet_sauvignon_2013"=>"product/jacobs-creek-cabernet-sauvignon-2015-75cl",
	"jacobs_creek_merlot_2014"=>"product/jacobs-creek-merlot-2016-75cl",
	"jacobs_creek_shiraz_cabernet_2012"=>"product/jacobs-creek-shiraz-cabernet-2014-75cl",
	"shaw_vineyard_estate_cabernet_sauvignon"=>"product/shaw-vineyard-estate-cabernet-sauvignon-2012-75cl",
	"shaw_vineyard_estate_shiraz_2009"=>"product/shaw-vineyard-estate-shiraz-2013-75cl",
	"Torbreck_Cuvee_Juveniles"=>"product/torbreck-cuvee-juveniles-2014-75cl",
	"Torbreck_The_Struie"=>"product/torbreck-the-struie-2013-75cl",
	"Red_Wine_Chile"=>"red-wine/chile",
	"Red_Wine_France"=>"red-wine/france",
	"red_wine"=>"red-wine",
	"Red_Wine_New_Zealand"=>"white-wine/new-zealand",
	"Red_Wine_Spain"=>"red-wine/spain",
	"Red_Wine_Spain/Torres_Altos_Ibericos_Rioja_Crianza"=>"product/torres-altos-ibericos-rioja-crianza-2013-75cl",
	"Red_Wine_Spain/Torres_Celeste_Crianza"=>"product/torres-celeste-crianza-2013-75cl",
	"White_Wine_Australia"=>"white-wine/australia",
	"White_Wine_Chile"=>"white-wine/chile",
	"White_Wine_Chile/Miguel_Torres_Hemisferio_Sauvignon_Blanc_Reserve"=>"product/miguel-torres-hemisferio-sauvignon-blanc-reserve-2015-75cl",
	"White_Wine_Chile/Miguel_Torres_Santa_Digna_Chardonnay_Reserve"=>"product/miguel-torres-santa-digna-chardonnay-reserve-2015-75cl",
	"White_Wine_France"=>"white-wine/france",
	"White_Wine_France/Louis_Jadot_Chablis"=>"product/louis-jadot-chablis-75cl-2015",
	"White_Wine_Germany"=>"white-wine/germany",
	"white_wine_italy"=>"white-wine/italy",
	"white_wine_italy/Frescobaldi_Toscana_Remole_Bianco"=>"white-wine/italy",
	"white_wine_italy/Ruffino_Libaio_Chardonnay"=>"product/ruffino-libaio-chardonnay-igt-2014-75cl",
	"white_wine_italy/Ruffino_Lumina_Pinot_Grigio"=>"product/ruffino-lumina-pinot-grigio-2014-75cl",
	"White_Wine_new_zealand"=>"white-wine/new-zealand",
	"White_Wine_Spain"=>"white-wine/spain",
	"Icewine"=>"dessert-wine",
	"Icewine/Inniskillin_Gold_Vidal_Oak_Aged_Icewine"=>"product/inniskillin-gold-vidal-oak-aged-icewine-vqa-375cl",
	"whiskies_scotch/Canadian_Club"=>"product/canadian-club-75cl",
	"whiskies_scotch/Johnnie_Walker_Double_Black"=>"product/johnnie-walker-double-black-70cl",
	"whiskies_scotch/Johnnie_Walker_Swing"=>"product/johnnie-walker-swing-70cl",
];

//FIX LINKS ROUTE
foreach ($fixPagesLinks as $route => $url) {
	
	$version1 = $route;
	$version2 = $version1.'/';
	$version3 = strtolower($route);
	$version4 = $version3.'/';
	$version5 = strtoupper($route);
	$version6 = $version5.'/';

	Route::get($version1,function() use($url){		
		return redirect('/'.$url,301);
	});Route::get($version2,function() use($url){		
		return redirect('/'.$url,301);
	});Route::get($version3,function() use($url){		
		return redirect('/'.$url,301);
	});Route::get($version4,function() use($url){		
		return redirect('/'.$url,301);
	});Route::get($version5,function() use($url){		
		return redirect('/'.$url,301);
	});Route::get($version6,function() use($url){		
		return redirect('/'.$url,301);
	});
	
}

//ROUTE IF CATEGORY OR PRODUCT NAME IS FOUND LIKE red_wine will be redirected to red-wine
Route::get('{categoryslug}', function ( $categoryslug, $productslug = '') {

	$s = str_replace('_', '-', $categoryslug);
    $s = preg_replace('/[^A-Za-z0-9\-]/', '', $s);
    $s = trim(preg_replace('/-+/', '-', $s));
	$s = strtolower($s);
	return redirect('/'.$s,301);

})->where(['categoryslug'=>'^[\w]+_[\w]+$']);

Route::get('{categoryslug}/{productslug}', function ( $categoryslug, $productslug) {

	$s = str_replace('_', '-', $productslug);
    $s = preg_replace('/[^A-Za-z0-9\-]/', '', $s);
    $s = trim(preg_replace('/-+/', '-', $s));
	$s = strtolower($s);
	return redirect('/product/'.$s,301);

})->where(['productslug'=>'^[\w]+_[\w]+$']);

Route::get('sitemap.xml', function(){

    // create new sitemap object
    $sitemap = App::make("sitemap");
    // add items to the sitemap (url, date, priority, freq)
    //$sitemap->add(URL::to(), '2012-08-25T20:10:00+02:00', '1.0', 'daily');
    //$sitemap->add(URL::to('page'), '2012-08-26T12:30:00+02:00', '0.9', 'monthly');

    // get all posts from db
    $categories = DB::collection('categories')->orderBy('created_at', 'desc')->get();
    
    // add every post to the sitemap
    if($categories){
    	foreach ($categories as $category){
    		if($category['cat_status'] == 0) continue;

	        $sitemap->add(url().'/'.$category['slug']);
	    }
	}

	$pages = DB::collection('pages')->orderBy('created_at', 'desc')->get();
    
    // add every post to the sitemap
    if($pages){
    	foreach ($pages as $page){
	        $sitemap->add(url('pages').'/'.$page['slug']);
	    }
	}
    
    // get all posts from db
    $posts = DB::collection('products')->orderBy('created_at', 'desc')->get();
    
    // add every post to the sitemap
    if($posts){
    	foreach ($posts as $post){
	        $sitemap->add(url('/product').'/'.$post['slug']);
	    }
	}	

    // generate your sitemap (format, filename)
    //$sitemap->store('xml','sitemap');
    return $sitemap->render('xml');
    // this will generate file mysitemap.xml to your public folder

});

//FINAL ROUTE FOR FRONTEND
Route::any('{catchall}', function ( $page ) {
    return view('frontend');
} )->where('catchall', '(.*)');