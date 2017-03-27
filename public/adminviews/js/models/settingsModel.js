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
        return $http.get("/adminapi/setting/settings/"+settingKey);
    },

    settingsModel.updateSetting = function(settingKey,postedData) {
        return $http.put("/adminapi/setting/"+settingKey, postedData, {
                
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

    settingsModel.updateAnnouncement = function(settingKey,postedData) {

        var fd = objectToFormData(postedData);

        $http.post("/adminapi/setting/announcement", fd, {            
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
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
        });
    };

    settingsModel.updateHomeBanner = function(settingKey,postedData) {

        var fd = objectToFormData(postedData);

        return $http.post("/adminapi/setting/home-banner", fd, {            
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
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
        });
    };

    settingsModel.updatePrinter = function(postedData) {

        return $http.post("/adminapi/setting/update", postedData, {
                
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
                    message: 'Data has been updated successfully',
                    container: '#info-message',
                    place: 'prepend',
                    closeInSeconds: 3
                });
            })

    };
    return settingsModel;
}])
