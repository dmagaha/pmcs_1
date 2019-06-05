taskBoardControllers.controller('SettingsCtrl',
['$scope', 'UserService', 'AlertService',
function ($scope, UserService, AlertService) {
    $scope.alerts = AlertService;

    $scope.teams = [];
    $scope.insurances = [];
    $scope.users = [];
    $scope.boards = [];
    $scope.boardNames = [];
    $scope.teamNames = [];
    $scope.shopSettings = [];

    $scope.teamLookup = {};
    $scope.boardLookup = {};
    $scope.currentUser = {};
    $scope.slide = {
        open: false
    };

    $scope.loadingCurrentUser = true;
    $scope.loadingBoards = true;
    $scope.loadingUsers = true;
    $scope.loadingInsurance = true;
    $scope.loadingTeams = true;
    $scope.loadingShopSettings = true;

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

    $scope.saveOptions = function() {
        UserService.saveOptions($scope.currentUser.options.tasksOrder,
            $scope.currentUser.options.showAnimations,
            $scope.currentUser.options.showAssignee)
        .success(function(data) {
            loadOptionsData({options: data.data});
        });
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

    $scope.updateBoardsList = function(data) {
        if (undefined === data) {
            return;
        }

        $scope.loadingBoards = false;
        if (null === data) {
            $scope.boards = [];
            return;
        }
        $scope.boards = data;

        var teamNames = [];
        data.forEach(function(team) {
            teamNames.push({ 'id': team.id, 'name':team.name });
        });
        $scope.teamNames = teamNames;

        for (var i = 0, len = teamNames.length; i < len; i++) {
            $scope.teamLookup[teamNames[i].id] = teamNames[i].name;
        }

        $scope.boardNames = boardNames;
        var boardNames = [];
        data.forEach(function(board) {
            boardNames.push({ 'id': board.id, 'name':board.name, 'active':board.active });
        });
        $scope.boardNames = boardNames;

        for (var i = 0, len = boardNames.length; i < len; i++) {
            $scope.boardLookup[boardNames[i].id] = boardNames[i].name;
        }
        $scope.updateActions();
    };

    $scope.updateTeams = function(data) {
        if (undefined === data || null === data) {
            return;
        }

	$scope.teams = data;
	$scope.loadingTeams = false;
    };

    $scope.updateShopSettings = function(data) {
        if (undefined === data || null === data) {
            return;
        }

        $scope.shopSettings = data;
        $scope.loadingShopSettings = false;
    };


    $scope.updateUsers = function(data) {
        if (undefined === data || null === data) {
            return;
        }

        $scope.users = data;
        $scope.loadingUsers = false;
        $scope.updateActions();
    };

    $scope.updateInsurance = function(data) {
        if (undefined === data || null === data) {
            return;
        }

        $scope.insurances = data;
        $scope.loadingInsurance = false;
        //$scope.updateActions();
    };

    $scope.actions = [];
    $scope.actionsLoading = true;
    $scope.updateActions = function() {
        if ('1' !== $scope.currentUser.isAdmin) {
            return;
        }
        UserService.actions()
        .success(function(data) {
            $scope.actions = data.data;
            if ($scope.actions) {
                var date = new Date();
                $scope.actions.forEach(function(action) {
                    date.setTime(action.timestamp * 1000);
                    action.date = date.toLocaleString();
                });
            }
            $scope.actionsLoading = false;
        });
    };
    $scope.updateActions();
}]);
