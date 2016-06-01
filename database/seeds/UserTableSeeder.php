<?php

use Illuminate\Database\Seeder;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        AlcoholDelivery\User::create([
            'name' => 'test',
            'email' => 'test@cgt.co.in',
            'password' => \Hash::make('12345678'),
        ]);
    }
}
