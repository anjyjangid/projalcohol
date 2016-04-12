MetronicApp.factory('settingsModel', ['$http', '$cookies','$location', function($http,$cookies,$location) {

    var settingsModel = {};

    /**
     * Check if the credentials are correct from server
     * and return the promise back to the controller
     * 
     * @param  {array} loginData
     * @return {promise}
     */
    settingsModel.getSettings = function(settingKey){
            return $http.get("/admin/setting/settings/"+settingKey);
        },

    settingsModel.updateSetting = function(settingKey,postedData) {

        return $http.put("/admin/setting/"+settingKey, postedData, {
                
            }).error(function(data, status, headers) {            
                Metronic.alert({
                    type: 'danger',
                    icon: 'warning',
                    message: 'Please enter all required fields.',
                    container: '.portlet-body',
                    place: 'prepend',
                    closeInSeconds: 3
                });
            })
            .success(function(response) {               
                
                Metronic.alert({
                    type: 'success',
                    icon: 'check',
                    message: response.message,
                    container: '#info-message',
                    place: 'prepend',
                    closeInSeconds: 3
                });
            })

    };

    return settingsModel;
}])
