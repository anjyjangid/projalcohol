MetronicApp.factory('productModel', ['$http', '$cookies', function($http, $cookies) {

    return {
        getCategories: function(){
            // return $http.get();
            return {
                success:function(cb){
                    cb([
                        {
                            "_id" : "56dd26ed227412331af170d9",
                            "cat_title" : "beer",
                            "cat_thumb" : "",
                            "cat_lthumb" : "",
                            "created_at" : "2016-02-27T05:54:16.469Z",
                            "updated_at" : "2016-03-02T09:54:49.736Z"
                        },
                        {
                            "_id" : "56dd4694227412331af170da",
                            "ancestors" : [
                                {
                                    "_id" : "56dd26ed227412331af170d9"
                                }
                            ],
                            "cat_lthumb" : "",
                            "cat_thumb" : "",
                            "cat_title" : "craft beer",
                            "created_at" : "2016-02-27T05:54:16.469Z",
                            "updated_at" : "2016-03-02T09:54:49.736Z"
                        },
                        {
                            "_id" : "56dd4e1e574d7f926243d4ff",
                            "cat_title" : "pilsner beer",
                            "cat_thumb" : "",
                            "created_at" : "2016-02-27T05:54:16.469Z",
                            "updated_at" : "2016-03-02T09:54:49.736Z",
                            "ancestors" : [
                                {
                                    "_id" : "56dd26ed227412331af170d9"
                                }
                            ]
                        },
                        {
                            "_id" : "56dd4e41574d7f926243d500",
                            "cat_title" : "fruit beer",
                            "cat_thumb" : "",
                            "created_at" : "2016-02-27T05:54:16.469Z",
                            "updated_at" : "2016-03-02T09:54:49.736Z",
                            "ancestors" : [
                                {
                                    "_id" : "56dd26ed227412331af170d9"
                                }
                            ]
                        },
                        {
                            "_id" : "56e01f8111f6a119178b4567",
                            "cat_title" : "asdads",
                            "cat_thumb" : "aogwnng46h9iv2kergow-1-1-1457528705.jpg",
                            "cat_lthumb" : "Winter-Tiger-Wild-Cat-Images-1457528705.jpg",
                            "updated_at" : "2016-03-09T13:05:05.508Z",
                            "created_at" : "2016-03-09T13:05:05.508Z"
                        },
                        {
                            "_id" : "56e027b311f6a119178b4568",
                            "cat_title" : "dummy",
                            "cat_thumb" : "Winter-Tiger-Wild-Cat-Images-1457530803.jpg",
                            "cat_lthumb" : "aogwnng46h9iv2kergow-1-1-1457530803.jpg",
                            "updated_at" : "2016-03-09T13:40:03.797Z",
                            "created_at" : "2016-03-09T13:40:03.797Z"
                        },
                        {
                            "_id" : "56e027db11f6a119178b4569",
                            "cat_title" : "dummy",
                            "cat_thumb" : "Winter-Tiger-Wild-Cat-Images-1457530843.jpg",
                            "cat_lthumb" : "aogwnng46h9iv2kergow-1-1-1457530843.jpg",
                            "updated_at" : "2016-03-09T13:40:43.221Z",
                            "created_at" : "2016-03-09T13:40:43.221Z"
                        },
                        {
                            "_id" : "56e027e711f6a119178b456a",
                            "cat_title" : "dummy",
                            "cat_thumb" : "Winter-Tiger-Wild-Cat-Images-1457530855.jpg",
                            "cat_lthumb" : "aogwnng46h9iv2kergow-1-1-1457530855.jpg",
                            "updated_at" : "2016-03-09T13:40:55.221Z",
                            "created_at" : "2016-03-09T13:40:55.221Z"
                        },
                        {
                            "_id" : "56e0283e11f6a119178b456b",
                            "cat_title" : "dummy",
                            "cat_thumb" : "Winter-Tiger-Wild-Cat-Images-1457530942.jpg",
                            "cat_lthumb" : "aogwnng46h9iv2kergow-1-1-1457530942.jpg",
                            "updated_at" : "2016-03-09T13:42:22.560Z",
                            "created_at" : "2016-03-09T13:42:22.560Z"
                        },
                        {
                            "_id" : "56e028a711f6a119178b456c",
                            "cat_title" : "test beer",
                            "cat_thumb" : "aogwnng46h9iv2kergow-1-1-1457531047.jpg",
                            "cat_lthumb" : "Winter-Tiger-Wild-Cat-Images-1457531047.jpg",
                            "updated_at" : "2016-03-09T13:44:07.135Z",
                            "created_at" : "2016-03-09T13:44:07.135Z"
                        },
                        {
                            "_id" : "56e106ef11f6a11e148b4567",
                            "cat_title" : "test",
                            "cat_thumb" : "aogwnng46h9iv2kergow-1-1-1457587951.jpg",
                            "cat_lthumb" : "Winter-Tiger-Wild-Cat-Images-1457587951.jpg",
                            "updated_at" : "2016-03-10T05:32:31.698Z",
                            "created_at" : "2016-03-10T05:32:31.698Z"
                        },
                        {
                            "_id" : "56e10b7011f6a11e148b4568",
                            "cat_title" : "test",
                            "cat_thumb" : "aogwnng46h9iv2kergow-1-1-1457589104.jpg",
                            "cat_lthumb" : "aogwnng46h9iv2kergow-1-1-1457589104.jpg",
                            "updated_at" : "2016-03-10T05:51:44.460Z",
                            "created_at" : "2016-03-10T05:51:44.460Z"
                        },
                        {
                            "_id" : "56e10c3711f6a11e148b4569",
                            "cat_title" : "test",
                            "cat_thumb" : "aogwnng46h9iv2kergow-1-1-1457589303.jpg",
                            "cat_lthumb" : "Winter-Tiger-Wild-Cat-Images-1457589303.jpg",
                            "updated_at" : "2016-03-10T05:55:03.362Z",
                            "created_at" : "2016-03-10T05:55:03.362Z"
                        },
                        {
                            "_id" : "56e14b7d11f6a1fe248b4567",
                            "cat_title" : "sub beer",
                            "cat_thumb" : "aogwnng46h9iv2kergow-1-1-1457605495.jpg",
                            "cat_lthumb" : "Winter-Tiger-Wild-Cat-Images-1457605500.jpg",
                            "updated_at" : "2016-03-10T10:25:01.144Z",
                            "created_at" : "2016-03-10T10:25:01.144Z"
                        },
                        {
                            "_id" : "56e1656547f832d3208b4567",
                            "cat_title" : "CAREDOVE",
                            "cat_thumb" : "images-1457612133.jpeg",
                            "cat_lthumb" : "images-1457612133.jpeg",
                            "updated_at" : "2016-03-10T12:15:33.735Z",
                            "created_at" : "2016-03-10T12:15:33.735Z"
                        },
                        {
                            "_id" : "56e271bd6801acabfa1a9698",
                            "ancestors" : [
                                {
                                    "_id" : "56dd4694227412331af170da"
                                },
                                {
                                    "_id" : "56dd26ed227412331af170d9"
                                }
                            ],
                            "cat_thumb" : "",
                            "cat_title" : "craft beer child",
                            "created_at" : "2016-02-27T05:54:16.469Z",
                            "updated_at" : "2016-03-02T09:54:49.736Z"
                        },
                        {
                            "_id" : "56e271bf6801acabfa1a9699",
                            "ancestors" : [
                                {
                                    "_id" : "56dd4694227412331af170da"
                                },
                                {
                                    "_id" : "56dd26ed227412331af170d9"
                                }
                            ],
                            "cat_thumb" : "",
                            "cat_title" : "craft beer child",
                            "created_at" : "2016-02-27T05:54:16.469Z",
                            "updated_at" : "2016-03-02T09:54:49.736Z"
                        }
                    ]);
                }
            };
        }
    };
}])
