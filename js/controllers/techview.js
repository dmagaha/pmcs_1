taskBoardControllers.controller('TechViewCtrl',
['$scope', 'RepairOrderService', 
function ($scope, RepairOrderService) {

    $scope.tvOrders = [];

    $scope.loadingTVOrders = true;

    $scope.updateTVOrders = function(data) {
        if (undefined === data || null === data) {
            return;
        }

	$scope.tvOrders = data;
	$scope.loadingTVOrders = false;
    };

    $scope.updateTVOrders();

    $scope.finishedTask = function(ro) {
	alert("In finised task");
	noty({
            text: 'Are you sure you are done?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Yes',
                    onClick: function($noty) {
                        $noty.close();
/*
                        $scope.isDeleting[userId] = true;

                        UserService.removeUser(userId)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            $scope.updateUsers(data.data);
                            $scope.updateBoardsList(data.boards);
                        });
*/
                    }
                },
                {
                    addClass: 'btn btn-info',
                    text: 'Cancel',
                    onClick: function($noty) {
                        $noty.close();
                    }
                }
            ]
	});

    };

}]);
