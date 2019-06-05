taskBoardControllers.controller('TeamSettingsCtrl',
['$scope', '$interval', 'TeamService',
function ($scope, $interval, TeamService) {
    var pendingResponse = false,
        retryCount = 3,
        loadTeams = function() {
            if (pendingResponse) {
                return;
            }

            pendingResponse = true;
            TeamService.getTeams()
            .success(function(data) {
                $scope.updateTeamsList(data.data);
                pendingResponse = false;
                retryCount = 3;
            })
            .error(function() {
                if (retryCount--) {
                    pendingResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingTeams = false;
            });
        };

    loadTeams();
    $scope.interval = $interval(loadTeams, 5000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

    $scope.teamFormData = {
	newName: '',
	nameError: false,
        isSaving: false,
        setAlert: function(message) {
            this.nameError = true;
            this.isSaving = false;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        },
        reset: function() {
            this.newName = '';
            this.newNameError = false;
            this.isSaving = false;
        }
    };

    $scope.usernameFormData = {
        newUsername: '',
        usernameError: false,
        isSaving: false,
        setAlert: function(message) {
            this.isSaving = false;
            this.usernameError = true;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        },
        reset: function() {
            this.newUsername = '';
            this.usernameError = false;
            this.isSaving = false;
        }
    };

    $scope.isDeleting = [];
    $scope.removeTeam = function(teamId) {
        noty({
            text: 'Deleting a team cannot be undone.<br>Continue?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                        $scope.isDeleting[teamId] = true;

                        TeamService.removeUser(teamId)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            $scope.updateTeams(data.data);
                            $scope.updateBoardsList(data.boards);
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
}]);
