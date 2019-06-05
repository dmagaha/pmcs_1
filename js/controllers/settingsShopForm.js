taskBoardControllers.controller('ShopFormSettingsCtrl',
['$scope', 'SettingsService',
function ($scope, SettingsService) {
    $scope.shopSettingsFormData = {
        setFocus: false,
        settingsId: 0,
        isAdd: true,
        tearDownDays: 0,
        refinishDays: 0,
        bodyDays: 0,
        trimOutDays: 0,
        serviceDays: 0,
        hoursInDay: 0,
        isSaving: false,
        setShopSettings: function(settings) {
            this.reset();

            this.isAdd = false;
            this.tearDownDays = settings.tearDownDays;
            this.refinishDays = settings.refinishDays;
            this.bodyDays = settings.bodyDays;
            this.trimOutDays = settings.trimOutDays;
            this.serviceDays = settings.serviceDays;
            this.hoursInDay = settings.hoursInDay;
        },
        reset: function() {
            $('.popover-dismiss').popover();
            this.setFocus = true;
            this.settingsId = 0;
            this.isAdd = true;
            this.tearDownDays = 0;
            this.refinishDays = 0;
            this.bodyDays = 0;
            this.trimOutDays = 0;
            this.serviceDays = 0;
            this.hoursInDay = 0;
            this.isSaving = false;
        },
        cancel: function() {
            $('.shopSettingsModal').modal('hide');
            var that = this;
            $('.shopSettingsModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        setForSaving: function() {
            this.isSaving = true;
        },
        setAlert: function(user, pass, message) {
            this.isSaving = false;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        }
    };
    $scope.$parent.shopSettingsFormData = $scope.shopSettingsFormData;

    $scope.addShopSettings = function(shopSettingsFormData) {
        shopSettingsFormData.setForSaving();

        SettingsService.addSettings(shopSettingsFormData)
                .success(function(data) {
                    //$scope.alerts.showAlerts(data.alerts);
                    $scope.updateShopSettings(data.data);
                    shopSettingsFormData.reset();

                    //if (data.alerts[0].type == 'success') {
                        $('.shopSettingsModal').modal('hide');
                    //}
        });
    };
}]);
