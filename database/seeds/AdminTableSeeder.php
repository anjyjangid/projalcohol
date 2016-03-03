<?php

use Illuminate\Database\Seeder;

class AdminTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        AlcoholDelivery\Admin::create([
            'name' => 'AlcoholDelivery Admin',
            'email' => 'admin@cgt.co.in',
            'password' => \Hash::make('12345678'),
        ]);
    }
}
