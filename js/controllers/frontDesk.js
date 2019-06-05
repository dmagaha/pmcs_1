taskBoardControllers.controller('FrontDeskCtrl',
['$scope', 'UserService', 'AlertService',
function ($scope, UserService, AlertService) {
    $scope.alerts = AlertService;

    $scope.techs = [];
    $scope.teams = [];
    $scope.repairOrders = [];
    $scope.completedRepairOrders = [];
    $scope.completedROs = [];
    $scope.teamNames = [];
    $scope.techNames = [];
    $scope.repairLaneNames = ["Pending", "Tear Down", "Supplement", "Awaiting Parts", "Body", "Refinish", "Trim Out", "Service", "Detail/Cleanup"];

    $scope.techLookup = {};
    $scope.teamLookup = {};
    $scope.completedROsLookup = {};
    $scope.boardLookup = {};
    $scope.currentUser = {};

    $scope.loadingCurrentUser = true;
    $scope.loadingBoards = true;
    $scope.loadingUsers = true;
    $scope.loadingTechs = true;
    $scope.loadingRepairOrders = true;
    $scope.loadingCompletedRepairOrders = true;
    $scope.loadingTeams = true;

    $scope.loadCurrentUser = function() {
        UserService.currentUser()
        .success(function(data) {
            $scope.currentUser = data.data;
            loadOptionsData(data.data);
            $scope.loadingCurrentUser = false;
        });
    };
    $scope.loadCurrentUser();

    loadOptionsData = function (data) {
        $scope.currentUser.options.tasksOrder = parseInt(data.options.tasksOrder);
        $scope.currentUser.options.showAnimations = data.options.showAnimations;
        $scope.currentUser.options.showAssignee = data.options.showAssignee;
    };

    $scope.updateTechList = function(data) {
        if (undefined === data) {
            return;
        }

        $scope.loadingTechs = false;
        if (null === data) {
            $scope.techs = [];
            return;
        }
        $scope.techs = data;

        var techNames = [];
        data.forEach(function(tech) {
            techNames.push({ 'id': tech.id, 'name':tech.name });
        });
        $scope.techNames = techNames;

        for (var i = 0, len = techNames.length; i < len; i++) {
            $scope.techLookup[techNames[i].id] = techNames[i].name;
        }
    };

    $scope.updateTeamsList = function(data) {
        if (undefined === data) {
            return;
        }

        $scope.loadingTeams = false;
        if (null === data) {
            $scope.teams = [];
            return;
        }
        $scope.teams = data;

        var teamNames = [];
        data.forEach(function(team) {
            teamNames.push({ 'id': team.id, 'name':team.name });
        });
        $scope.teamNames = teamNames;

        for (var i = 0, len = teamNames.length; i < len; i++) {
            $scope.teamLookup[teamNames[i].id] = teamNames[i].name;
        }
    };

    $scope.updateCompletedRepairOrders = function(data) {
        if (undefined === data || null === data) {
            return;
        }

        $scope.completedRepairOrders = data;
        $scope.loadingCompletedRepairOrders = false;

        var compROs = [];
        data.forEach(function(ro) {
            compROs.push({ 'id': ro.id, 'name':ro.repair_order_number });
        });
        $scope.completedROs = compROs;

        for (var i = 0, len = compROs.length; i < len; i++) {
	    $scope.completedROsLookup[compROs[i].id] = compROs[i].name;
        }
    };

    $scope.updateRepairOrders = function(data) {
        if (undefined === data || null === data) {
            return;
        }

        $scope.repairOrders = data;

        if ($scope.repairOrders) {
            var date = new Date();
            $scope.repairOrders.forEach(function(repairOrder) {
                date.setTime(repairOrder.drop_off_date * 1000);
                repairOrder.drop_off_date = date.toLocaleString();

		if (repairOrder.refinish_start_date != null) {
                	date.setTime(repairOrder.refinish_start_date * 1000);
                	repairOrder.refinish_start_date = date.toLocaleString();
		}
                if (repairOrder.refinish_end_date != null) {
                        date.setTime(repairOrder.refinish_end_date * 1000);
                        repairOrder.refinish_end_date = date.toLocaleString();
                }
		if (repairOrder.trim_out_start_date != null) {
                	date.setTime(repairOrder.trim_out_start_date * 1000);
                	repairOrder.trim_out_start_date = date.toLocaleString();
		}
                if (repairOrder.trim_out_end_date != null) {
                        date.setTime(repairOrder.trim_out_end_date * 1000);
                        repairOrder.trim_out_end_date = date.toLocaleString();
                }
		if (repairOrder.service_start_date != null) {
                	date.setTime(repairOrder.service_start_date * 1000);
                	repairOrder.service_start_date = date.toLocaleString();
		}
                if (repairOrder.service_end_date != null) {
                        date.setTime(repairOrder.service_end_date * 1000);
                        repairOrder.service_end_date = date.toLocaleString();
                }
		if (repairOrder.tear_down_start_date != null) {
                	date.setTime(repairOrder.tear_down_start_date * 1000);
                	repairOrder.tear_down_start_date = date.toLocaleString();
		}
                if (repairOrder.tear_down_end_date != null) {
                        date.setTime(repairOrder.tear_down_end_date * 1000);
                        repairOrder.tear_down_end_date = date.toLocaleString();
                }
                if (repairOrder.body_start_date != null) {
                        date.setTime(repairOrder.body_start_date * 1000);
                        repairOrder.body_start_date = date.toLocaleString();
                }
                if (repairOrder.body_end_date != null) {
                        date.setTime(repairOrder.body_end_date * 1000);
                        repairOrder.body_end_date = date.toLocaleString();
                }
		if (repairOrder.check_in_date != null) {
                	date.setTime(repairOrder.check_in_date * 1000);
                	repairOrder.check_in_date = date.toLocaleString();
		}
		if (repairOrder.check_out_date != null) {
                	date.setTime(repairOrder.check_out_date * 1000);
                	repairOrder.check_out_date = date.toLocaleString();
		}
                if (repairOrder.assignment_date != null) {
                        date.setTime(repairOrder.assignment_date * 1000);
                        repairOrder.assignment_date = date.toLocaleString();
                }
                if (repairOrder.order_date != null) {
                        date.setTime(repairOrder.order_date * 1000);
                        repairOrder.order_date = date.toLocaleString();
                }
                if (repairOrder.received_date != null) {
                        date.setTime(repairOrder.received_date * 1000);
                        repairOrder.received_date = date.toLocaleString();
                }
                if (repairOrder.delivered_date != null) {
                        date.setTime(repairOrder.delivered_date * 1000);
                        repairOrder.delivered_date = date.toLocaleString();
                }
                if (repairOrder.estimate_date != null) {
                        date.setTime(repairOrder.estimate_date * 1000);
                        repairOrder.estimate_date = date.toLocaleString();
                }
            });
        }

        $scope.loadingRepairOrders = false;
    };

}]);
