taskBoardControllers.controller('InsuranceFormSettingsCtrl',
['$scope', 'InsuranceService',
function ($scope, InsuranceService) {

    $scope.insuranceFormData = {
        setFocus: false,
        insuranceId: 0,
        isAdd: true,
        name: '',
        cycleTime: '',
        nameError: false,
        isSaving: false,
        setInsurance: function(insurance) {
            this.reset();

            this.isAdd = false;
            this.insuranceId = insurance.id;
            this.name = insurance.name;
        },
        reset: function() {
            $('.popover-dismiss').popover();
            this.setFocus = true;
            this.insuranceId = 0;
            this.isAdd = true;
	    this.cycleTime = '';
            this.name = '';
            this.nameError = false;
            this.isSaving = false;
            var that = this;
            $('.insuranceModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
	loadInsurance: function(insurance) {
	    this.isAdd = false;
	    this.insuranceId = insurance.id;
	    this.cycleTime = insurance.cycleTime;
	    this.name = insurance.name;
	},
        cancel: function() {
            $('.insuranceModal').modal('hide');
            var that = this;
            $('.insuranceModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        setForSaving: function() {
            this.isSaving = true;
            this.nameError = false;
        },
        setAlert: function(insurance, cycleTime, message) {
            this.isSaving = false;
            this.nameError = insurance;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        }
    };
    $scope.$parent.insuranceFormData = $scope.insuranceFormData;

    $scope.editInsurance = function(insuranceFormData) {
        insuranceFormData.setForSaving();

        if (insuranceFormData.name === '') {
            insuranceFormData.setAlert(true, false, 'Insurance name cannot be blank.');
        } else {
            insuranceFormData.isSaving = true;

            InsuranceService.editInsurance(insuranceFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateInsurance(data.data);

                    if (data.alerts[0].type == 'success') {
                        $('.insuranceModal').modal('hide');
                    }
                });
        }
    };

    $scope.addInsurance = function(insuranceFormData) {
        insuranceFormData.setForSaving();

        if (insuranceFormData.name === '') {
            insuranceFormData.setAlert(true, false, 'Insurance name cannot be blank.');
        } else {
            insuranceFormData.isSaving = true;

            InsuranceService.addInsurance(insuranceFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateInsurance(data.data);
                    insuranceFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.insuranceModal').modal('hide');
                    }
                });
        }
    };
}]);
