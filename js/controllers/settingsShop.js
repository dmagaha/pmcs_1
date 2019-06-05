taskBoardControllers.controller('ShopSettingsCtrl',
['$scope', '$interval', 'SettingsService',
function ($scope, $interval, SettingsService) {
    var pendingResponse = false,
        retryCount = 3,
        loadShopSettings = function() {
            if (pendingResponse) {
                return;
            }

            pendingResponse = true;
            SettingsService.getSettings()
            .success(function(data) {
                $scope.updateShopSettings(data.data);
                pendingResponse = false;
                retryCount = 3;
            })
            .error(function() {
                if (retryCount--) {
                    pendingResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingShopSettings = false;
            });
        };

    loadShopSettings();
    $scope.interval = $interval(loadShopSettings, 5000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

}]);
