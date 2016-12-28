<?php

namespace AlcoholDelivery\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \AlcoholDelivery\Console\Commands\Inspire::class,
        \AlcoholDelivery\Console\Commands\DatabaseBackup::class,
        \AlcoholDelivery\Console\Commands\Notification::class,
        \AlcoholDelivery\Console\Commands\PrintJob::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        //AUTOMATED PRINT INVOICE        
        //$schedule->command('inspire')->hourly();
        //NOTIFY USER FOR SALE
        $schedule->command('sale:notify')->everyMinute();

        //AUTOMATED PRINT INVOICE
        $schedule->command('printjob:print')->everyMinute();

    }
}
