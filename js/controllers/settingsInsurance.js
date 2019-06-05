taskBoardControllers.controller('InsuranceSettingsCtrl',
['$scope', '$interval', 'InsuranceService',
function ($scope, $interval, InsuranceService) {
    var pendingResponse = false,
        retryCount = 3,
        loadInsurance = function() {
            if (pendingResponse) {
                return;
            }

            pendingResponse = true;
            InsuranceService.getInsurance()
            .success(function(data) {
                $scope.updateInsurance(data.data);
                pendingResponse = false;
                retryCount = 3;
            })
            .error(function() {
                if (retryCount--) {
                    pendingResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingInsurance = false;
            });
        };

    loadInsurance();
    $scope.interval = $interval(loadInsurance, 5000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

    $scope.insuranceNameFormData = {
        newInsuranceName: '',
        insuranceNameError: false,
        isSaving: false,
        setAlert: function(message) {
            this.isSaving = false;
            this.insuranceNameError = true;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        },
        reset: function() {
            this.newInsuranceName = '';
            this.insuranceNameError = false;
            this.isSaving = false;
        }
    };
    $scope.changeInsuranceName = function(newInsuranceNameFormData) {
        $scope.insuranceNameFormData.isSaving = true;

        if (newInsuranceNameFormData.newTeamName === '') {
            newInsuranceNameFormData.setAlert('Insurance Name cannot be blank.');
            newInsuranceNameFormData.isSaving = false;
        } else {
            InsuranceService.changeInsuranceName(newInsuranceNameFormData.newInsuranceName)
            .success(function(data) {
                $scope.alerts.showAlerts(data.alerts);
                $scope.updateInsurance(data.data);
                $scope.loadCurrentUser();

                newInsuranceNameFormData.isSaving = false;
                newInsuranceNameFormData.newInsuranceName = '';
            });
        }
    };

    $scope.isDeleting = [];
    $scope.removeInsurance = function(insuranceId) {
        noty({
            text: 'Deleting a insurance cannot be undone.<br>Continue?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                        $scope.isDeleting[insuranceId] = true;

                        InsuranceService.removeInsurance(insuranceId)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            $scope.updateInsurance(data.data);
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
