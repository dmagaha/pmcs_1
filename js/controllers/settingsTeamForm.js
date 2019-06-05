taskBoardControllers.controller('TeamFormSettingsCtrl',
['$scope', 'TeamService',
function ($scope, TeamService) {
    $scope.teamFormData = {
        setFocus: false,
        teamId: 0,
        isAdd: true,
        name: '',
	currentCapacity: 0,
	maxCapacity: 0,
        nameError: false,
        isSaving: false,
        setTeam: function(team) {
            this.reset();

            this.isAdd = false;
            this.teamId = team.id;
            this.name = team.name;
        },
        reset: function() {
            $('.popover-dismiss').popover();
            this.setFocus = true;
            this.teamId = 0;
            this.isAdd = true;
	    this.currentCapacity = 0;
	    this.maxCapacity = 0;
            this.name = '';
            this.nameError = false;
            this.isSaving = false;
            var that = this;
            $('.teamModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
	loadTeam: function(team) {
	    this.isAdd = false;
	    this.teamId = team.id;
	    this.currentCapacity = team.currentCapacity;
	    this.maxCapacity = team.maxCapacity;
	    this.name = team.name;
	},
        cancel: function() {
            $('.teamModal').modal('hide');
            var that = this;
            $('.teamModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        setForSaving: function() {
            this.isSaving = true;
            this.nameError = false;
        },
        setAlert: function(team, message) {
            this.isSaving = false;
            this.nameError = team;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        }
    };
    $scope.$parent.teamFormData = $scope.teamFormData;

    $scope.editTeam = function(teamFormData) {
        teamFormData.setForSaving();

        if (teamFormData.name === '') {
            teamFormData.setAlert(true, false, 'Team name cannot be blank.');
        } else {
            teamFormData.isSaving = true;

            TeamService.editTeam(teamFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateTeam(data.data);

                    if (data.alerts[0].type == 'success') {
                        $('.teamModal').modal('hide');
                    }
                });
        }
    };

    $scope.addTeam = function(teamFormData) {
        teamFormData.setForSaving();

        if (teamFormData.name === '') {
            teamFormData.setAlert(true, false, 'Team name cannot be blank.');
        } else {
            teamFormData.isSaving = true;

            TeamService.addTeam(teamFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateInsurance(data.data);
                    teamFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.teamModal').modal('hide');
                    }
                });
        }
    };
}]);
