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
        App\User::create([
            'name' => 'Abhay Sharma',
            'email' => 'abhay@cgt.co.in',
            'password' => \Hash::make('12345678'),
        ]);
    }
}
