taskBoardControllers.controller('UserFormSettingsCtrl',
['$scope', 'UserService',
function ($scope, UserService) {
    $scope.userFormData = {
        setFocus: false,
        userId: 0,
        isAdd: true,
        name: '',
        username: '',
        password: '',
        email: '',
        verifyPass: '',
        defaultBoard: null,
        team: null,
        isAdmin: false,
        isManager: false,
        isTech: false,
        isWriter: false,
        isSuperUser: false,
        currentWorkload: 0,
        maxWorkload: 0,
        passError: false,
        usernameError: false,
        emailError: false,
        isSaving: false,
        setUser: function(user) {
            this.reset();

            this.isAdd = false;
            this.userId = user.id;
            this.name = user.name;
            this.username = user.username;
            this.email = user.email;
            this.defaultBoard = user.default_board;
            this.team = user.team;
            this.isAdmin = user.is_admin == '1';
            this.isManager = user.is_manager == '1';
            this.isTech = user.is_tech == '1';
            this.isWriter = user.is_writer == '1';
            this.isSuperUser = user.is_super_user == '1';
            this.currentWorkload = user.current_workload;
            this.maxWorkload = user.max_workload;
        },
        reset: function() {
            $('.popover-dismiss').popover();
            this.setFocus = true;
            this.userId = 0;
            this.isAdd = true;
            this.username = '';
            this.name = '';
            this.password = '';
            this.email = '';
            this.verifyPass = '';
            this.defaultBoard = null;
            this.team = null;
            this.isAdmin = false;
            this.isManager = false;
            this.isTech = false;
            this.isWriter = false;
            this.isSuperUser = false;
            this.passError = false;
            this.usernameError = false;
            this.isSaving = false;
            this.currentWorkload = 0;
            this.maxWorkload = 0;
        },
        cancel: function() {
            $('.userModal').modal('hide');
            var that = this;
            $('.userModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        setForSaving: function() {
            this.isSaving = true;
            this.usernameError = false;
            this.passError = false;
        },
        setAlert: function(user, pass, message) {
            this.isSaving = false;
            this.usernameError = user;
            this.passError = pass;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        }
    };
    $scope.$parent.userFormData = $scope.userFormData;

    $scope.editUser = function(userFormData) {
        userFormData.setForSaving();

        if (userFormData.username === '') {
            userFormData.setAlert(true, false, 'Username cannot be blank.');
        } else {
            userFormData.isSaving = true;

            if(userFormData.password == userFormData.verifyPass) {
                UserService.editUser(userFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateUsers(data.data);
                    $scope.updateBoardsList(data.boards);

                    if (data.alerts[0].type == 'success') {
                        $('.userModal').modal('hide');
                        userFormData.password = '';
                        userFormData.verifyPass = '';
                    }
                });
            } else {
                userFormData.setAlert(false, true, 'Passwords do not match.');
            }
        }
    };

    $scope.addUser = function(userFormData) {
        userFormData.setForSaving();

        if (userFormData.username === '') {
            userFormData.setAlert(true, false, 'Username cannot be blank.');
        } else if (userFormData.password === '' || userFormData.verifyPass === '') {
            userFormData.setAlert(false, true, 'Password cannot be blank.');
        } else {
            userFormData.isSaving = true;

            if(userFormData.password == userFormData.verifyPass) {
                UserService.addUser(userFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateUsers(data.data);
                    $scope.updateBoardsList(data.boards);
                    userFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.userModal').modal('hide');
                    }
                });
            } else {
                userFormData.setAlert(false, true, 'Passwords do not match.');
            }
        }
    };
}]);
