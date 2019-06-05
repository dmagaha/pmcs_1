taskBoardControllers.controller('RepairOrderTechsCtrl',
['$scope', '$interval', 'RepairOrderService', 'TeamService', 'UserService',
function ($scope, $interval, RepairOrderService, TeamService, UserService) {
    $scope.viewRepairOrder = {};
    $scope.comment = {};
    $scope.fileReset = false;

    $scope.comments = {
        options: [
            {id: 0, text: 'Oldest First'},
            {id: 1, text: 'Newest First'}
        ],
        sorting: 0
    };

    $scope.markedComment = function(text) {
        if (text) {
            return $window.marked(text);
        } else {
            return "<p>No text</p>";
        }
    };

    $scope.totalLoss = function(ro) {
        $msg = "Are you sure that " + ro.repair_order_number + " is a total loss?"
        noty({
            text: $msg,
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Yes',
                    onClick: function($noty) {
                        $noty.close();

                        RepairOrderService.totalLoss(ro)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                        });

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

    $scope.finishedTask = function(ro) {
	$msg = "Are you sure that you are done with the " + $scope.repairLaneNames[ro.repair_lane] + " process?"
        noty({
            text: $msg,
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {   
                    addClass: 'btn btn-default',
                    text: 'Yes',
                    onClick: function($noty) {
                        $noty.close();

                        RepairOrderService.endProcess(ro)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                        });

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

    $scope.openAddStart = function(ro) {
	$msg = "Are you sure you want to start the " + $scope.repairLaneNames[ro.repair_lane] + " process?"
	
        noty({
            text: $msg, 
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Yes',
                    onClick: function($noty) {
                        $noty.close();

                        RepairOrderService.startProcess(ro)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                        });
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

    $scope.openAddSupplement = function(ro) {
        noty({
            text: 'Are you sure you want to add a supplement?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Yes',
                    onClick: function($noty) {
 
                        $noty.close();
                        RepairOrderService.makeSupplement(ro)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                        });
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

    var pendingROResponse = false,
        retryROCount = 3,
	pendingTeamResponse = false,
	retryTeamCount = 3,
	pendingTechResponse = false,
	retryTechCount = 3,
	loadTechs = function() {
            if (pendingTechResponse) {
                return;
            }

            pendingTechResponse = true;
            UserService.getTechs()
            .success(function(data) {
                $scope.updateTechList(data.data);
                pendingTechResponse = false;
                retryTechCount = 3;
            })
            .error(function() {
                if (retryTechCount--) {
                    pendingTechResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingTechs = false;
            });
        },
        loadRepairOrders = function() {
            if (pendingROResponse) {
                return;
            }

            pendingROResponse = true;
            //RepairOrderService.getRepairOrders()
            RepairOrderService.getTechRepairOrders()
            .success(function(data) {
                $scope.updateRepairOrders(data.data);
                pendingROResponse = false;
                retryROCount = 3;
            })
            .error(function() {
                if (retryROCount--) {
                    pendingROResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingRepairOrders = false;
            });
        },
        loadTeams = function() {
            if (pendingTeamResponse) {
                return;
            }

            pendingTeamResponse = true;
            TeamService.getTeams()
            .success(function(data) {
                $scope.updateTeamsList(data.data);
                pendingTeamResponse = false;
                retryTeamCount = 3;
            })
            .error(function() {
                if (retryTeamCount--) {
                    pendingTeamResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingTeams = false;
            });
        };

    loadTeams();
    loadTechs();
    loadRepairOrders();
    $scope.interval = $interval(loadRepairOrders, 5000);
    $scope.interval = $interval(loadTeams, 5000);
    $scope.interval = $interval(loadTechs, 5000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

    // Takes an array of timestamps and converts them to display dates.
    var convertDates = function(timestampArray) {
            if (undefined === timestampArray) {
                return;
            }

            var date = new Date();
            timestampArray.forEach(function(item) {
                date.setTime(item.timestamp * 1000);
                item.date = date.toLocaleString();
            });
        },
        updateRO = function(ro) {
            $scope.viewRepairOrder.repairOrderNumber = ro.repair_order_number;
            $scope.viewRepairOrder.team = ro.team;
            $scope.viewRepairOrder.name = ro.name;
            $scope.viewRepairOrder.year = ro.year;
            $scope.viewRepairOrder.make = ro.make;
            $scope.viewRepairOrder.model = ro.model;
            $scope.viewRepairOrder.color = ro.color;
            $scope.viewRepairOrder.checkInId = ro.id;
            $scope.viewRepairOrder.bodyDays = ro.body_days;
            $scope.viewRepairOrder.serviceDays = ro.service_days;
            $scope.viewRepairOrder.refinishDays = ro.refinish_days;
            $scope.viewRepairOrder.bodyHours = ro.body_hours;
            $scope.viewRepairOrder.serviceHours = ro.service_hours;
            $scope.viewRepairOrder.refinishHours = ro.refinish_hours;
            $scope.viewRepairOrder.repairLane = ro.repair_lane;
            $scope.viewRepairOrder.ownComment = ro.own_comment;
            $scope.viewRepairOrder.ownAttachment = ro.own_attachment;
            $scope.viewRepairOrder.ownActivity = ro.own_activity;
            $scope.viewRepairOrder.totalLoss = ro.total_loss;
            $scope.viewRepairOrder.laneId = ro.lane_id;
            convertDates($scope.viewRepairOrder.ownComment);
            convertDates($scope.viewRepairOrder.ownAttachment);
            convertDates($scope.viewRepairOrder.ownActivity);
        };

    $scope.openRO = function(ro, openModal) {
        if (undefined === openModal) {
            openModal = true;
        }
        updateRO(ro);
        $scope.viewRepairOrder.disabled = false;

        if (undefined === $scope.viewRepairOrder.ownComment) {
            $scope.viewRepairOrder.ownComment = [];
        }
        if (undefined === $scope.viewRepairOrder.ownAttachment) {
            $scope.viewRepairOrder.ownAttachment = [];
        }

        $scope.fileReset = true;

        if (openModal) {
	    $scope.checkInFormData.loadCheckIn($scope.viewRepairOrder);
        }
    };
    $scope.$parent.openRO = $scope.openRO;

}]);
