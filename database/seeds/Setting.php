<?php

use Illuminate\Database\Seeder;

class Setting extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        AlcoholDelivery\Setting::create([
            '_id' => 'pricing',            
            'settings' => [
                'regular_express_delivery' => [
                	'label' => 'Regular express delivery',
                    'value' => 0.5,
                	'type' => 1,
                    'category' => 'pricing'
                ],
                'advance_order' => [
                	'label' => 'Advance order',
                    'value' => 0.25,
                	'type' => 1,
                    'category' => 'pricing'
                ],
                'express_delivery_bulk' => [
                    'label' => 'Bulk purchase (Advance order)',                	
                    'bulk' => [
                        [
                            'from_qty' => 2,
                            'to_qty' => 5,    
                            'value' => 0.15,
                            'type' => 1
                        ],                    
                        [
                            'from_qty' => 6,
                            'to_qty' => 10,    
                            'value' => 0.12,
                            'type' => 1
                        ],                    
                        [
                            'from_qty' => 11,
                            'to_qty' => 20,    
                            'value' => 0.12,
                            'type' => 1
                        ],
                        [
                            'from_qty' => 11,
                            'to_qty' => 99999,    
                            'value' => 0.10,
                            'type' => 1
                        ]
                    ],                    
                    'category' => 'bulk_pricing',                    
                ],
                'advance_order_bulk' => [
                	'label' => 'Bulk purchase (Regular express delivery)',
                    'bulk' => [
                        [
                            'from_qty' => 2,
                            'to_qty' => 5,    
                            'value' => 0.15,
                            'type' => 1
                        ],                    
                        [
                            'from_qty' => 6,
                            'to_qty' => 10,    
                            'value' => 0.12,
                            'type' => 1
                        ],                    
                        [
                            'from_qty' => 11,
                            'to_qty' => 20,    
                            'value' => 0.12,
                            'type' => 1
                        ],
                        [
                            'from_qty' => 11,
                            'to_qty' => 99999,    
                            'value' => 0.10,
                            'type' => 1
                        ]
                    ],
                    'category' => 'bulk_pricing'
                ],
                'express_delivery' => [
                    'label' => 'Express delivery (Order within 30mins)',
                	'value' => 50,
                	'type' => 0,
                    'category' => 'service'
                ],
                'cigratte_services' => [
                    'label' => 'Cigratte service',
                	'value' => 5,
                	'type' => 1,
                    'category' => 'service'
                ],
                'non_chilled_delivery' => [
                    'label' => 'Non-chilled delivery',
                    'value' => 1,
                    'type' => 0,
                    'category' => 'discount'
                ]                
            ]
        ]);
    }
}
