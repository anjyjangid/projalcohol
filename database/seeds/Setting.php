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
                    'value' => 1,
                	'type' => 1,
                    'category' => 'pricing'
                ],
                'advance_order' => [
                	'label' => 'Advance order',
                    'value' => 1,
                	'type' => 1,
                    'category' => 'pricing'
                ],
                'express_delivery_bulk' => [
                    'label' => 'Bulk purchase (Advance order)',
                	'value' => 1,
                	'type' => 1,
                    'category' => 'pricing'
                ],
                'advance_order_bulk' => [
                	'label' => 'Bulk purchase (Regular express delivery)',
                    'value' => 1,
                	'type' => 1,
                    'category' => 'pricing'
                ],
                'express_delivery' => [
                    'label' => 'Express delivery (Order within 30mins)',
                	'value' => 1,
                	'type' => 1,
                    'category' => 'service'
                ],
                'cigratte_services' => [
                    'label' => 'Cigratte service',
                	'value' => 1,
                	'type' => 1,
                    'category' => 'service'
                ],
                'non_chilled_delivery' => [
                    'label' => 'Non-chilled delivery',
                    'value' => 1,
                    'type' => 1,
                    'category' => 'discount'
                ]                
            ]
        ]);
    }
}
