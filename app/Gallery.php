<?php

namespace AlcoholDelivery;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Gallery extends Eloquent
{
    //protected $collection = 'gallery';
    /**
     * Fields which can be mass assigned
     * @var array
     */
    protected $fillable = ['name', 'user_id'];

    public function getCreatedAtAttribute($value)
    {
        return Carbon::createFromFormat('Y-m-d H:i:s', $value)->diffForHumans();
    }

    public function user()
    {
        return $this->belongsTo('AlcoholDelivery\User');
    }

    public function getSingleGallery($id)
    {
        $gallery = Gallery::with('user')->where('_id', $id)->first();

        $gallery->images = $this->getGalleryImageUrls($id, $gallery->id);

        return $gallery;
    }

    private function getGalleryImageUrls($id, $galleryId)
    {
        $files = DB::table('gallery_images')
            ->where('gallery_id', $id)
            ->join('files', 'files._id', '=', 'gallery_images.file_id')
            ->get();
            //var_dump($files);

        $finalData = [];
        foreach ($files as $key => $file) {
            $file = json_decode (json_encode ($file), FALSE);

            $finalData[$key] = [
                'file_id' => $file->_id,
                /*'thumbUrl' => env('S3_URL') . "gallery_{$galleryId}/thumb/" . $file->file_name,
                'url' => env('S3_URL') . "gallery_{$galleryId}/medium/" . $file->file_name,
                'main' => env('S3_URL') . "gallery_{$galleryId}/main/" . $file->file_name,*/
                /*'thumbUrl' => "gallery_{$galleryId}/thumb/" . $file->file_name,
                'url' => "gallery_{$galleryId}/medium/" . $file->file_name,
                'main' => "gallery_{$galleryId}/main/" . $file->file_name,*/
            ];
        }

        return $finalData;
    }
}
