taskBoardControllers.controller('TVRepairOrderCheckInCtrl',
['$scope', 'RepairOrderService',
function ($scope, RepairOrderService) {
    var pendingResponse = false,
        retryCount = 3,
        loadTVOrder = function() {
            if (pendingResponse) {
                return;
            }

            pendingResponse = true;
            RepairOrderService.getRepairOrder()
            .success(function(data) {
                $scope.updateTVOrders(data.data);
                pendingResponse = false;
                retryCount = 3;
            })
            .error(function() {
                if (retryCount--) {
                    pendingResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingTVOrders = false;
            });
        };

    loadTVOrder();
    $scope.interval = $interval(loadTVOrder, 5000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

}]);
