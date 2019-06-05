taskBoardControllers.controller('RepairOrderFormFrontDeskCtrl',
['$scope', 'RepairOrderService', 'BoardService',
function ($scope, RepairOrderService, BoardService) {

    $scope.checkInFormData = {
        setFocus: false,
        isSaving: false,
        isAdd: true,
        checkInId: 0,
        name: '',
        repairOrderNumber: '',
        year: '',
        color: '',
        make: '',
        model: '',
        phoneNumber: '',
        cell: '',
        email: '',
	repairLane: 0,
	laneId: 0,
        team: null,
        bodyTech: null,
        serviceTech: null,
        refinishTech: null,
        rentalDate: null,
        insurance: '',
        insuranceEstimate: '',
        bodyHours: '',
        refinishHours: '',
        serviceHours: '',
        bodyDays: '',
        refinishDays: '',
        serviceDays: '',
        checkInDate: '',
        dropOffDate: '',
        checkOutDate: '',
	comeBack: '',
	partsOrdered: '',
	backOrdered: '',
	criticalBackOrdered: '',
        isDPRC: false,
        setCheckIn: function(checkIn) {
            this.reset();
            this.setFocus = true;
            this.isSaving = false;
            this.isAdd = true;

            this.checkInId = checkIn.checkInId;
            this.name = checkIn.name;
            this.repairOrderNumber = checkIn.repairOrderNumber;
            this.year = checkIn.year;
            this.color = checkIn.color;
            this.make = checkIn.make;
            this.model = checkIn.model;
            this.phoneNumber = checkIn.phoneNumber;
            this.cell = checkIn.cell;
            this.email = checkIn.email;
            this.laneId = checkIn.laneId;
            this.repairLane = checkIn.repairLane;
            this.team = checkIn.team;
            this.refinishTech = checkIn.refinishTech;
            this.serviceTech = checkIn.serviceTech;
            this.bodyTech = checkIn.bodyTech;
            this.rentalDate = checkIn.rentalDate;
            this.insurance = checkIn.insurance;
            this.insuranceEstimate = checkIn.insuranceEstimate;
            this.bodyDays = checkIn.bodyDays;
            this.refinishDays = checkIn.refinishDays;
            this.serviceDays = checkIn.serviceDays;
            this.bodyHours = checkIn.bodyHours;
            this.refinishHours = checkIn.refinishHours;
            this.serviceHours = checkIn.serviceHours;
            this.checkInDate = checkIn.checkInDate;
            this.dropOffDate = checkIn.dropOffDate;
            this.checkOutDate = checkIn.checkOutDate;
	    this.comeBack = checkIn.comeBack;
	    this.isDPRC = checkIn.isDPRC;
	    this.partsOrdered = checkIn.partsOrdered; 
	    this.backOrdered = checkIn.backOrdered; 
	    this.criticalBackOrdered = checkIn.criticalBackOrdered; 
        },
        reset: function() {
            $('.popover-dismiss').popover();
            this.setFocus = true;
            this.isSaving = false;
            this.isAdd = true;

            this.checkInId = 0
            this.name = '';
            this.repairOrderNumber = '';
            this.year = '';
            this.color = '';
            this.make = '';
            this.model = '';
            this.phoneNumber = '';
            this.cell = '';
            this.email = '';
            this.repairLane = 0;
            this.laneId = 0;
            this.team = null;
            this.refinishTech = null;
            this.serviceTech = null;
            this.bodyTech = null;
            this.rentalDate = null;
            this.insurance = '';
            this.insuranceEstimate = '';
            this.bodyDays = '';
            this.refinishDays = '';
            this.serviceDays = '';
            this.bodyHours = '';
            this.refinishHours = '';
            this.serviceHours = '';
            this.checkInDate = '';
            this.dropOffDate = '';
            this.checkOutDate = '';
            this.isSaving = false;
	    this.comeBack = '';
            this.isDPRC = false;
	    this.partsOrdered = ''; 
	    this.backOrdered = ''; 
	    this.criticalBackOrdered = ''; 
            var that = this;
            $('.dropOffModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        loadCheckIn: function(checkIn) {
            this.setFocus = true;
            this.isSaving = false;
            this.isAdd = false;
            this.checkInId = checkIn.checkInId;
            this.name = checkIn.name;
            this.repairOrderNumber = checkIn.repairOrderNumber;
            this.year = checkIn.year;
            this.color = checkIn.color;
            this.make = checkIn.make;
            this.model = checkIn.model;
            this.phoneNumber = checkIn.phoneNumber;
            this.cell = checkIn.cell;
            this.email = checkIn.email;
            this.repairLane = checkIn.repairLane;
            this.laneId = checkIn.laneId;
            this.team = checkIn.team;
            this.serviceTech = checkIn.serviceTech;
            this.bodyTech = checkIn.bodyTech;
            this.refinishTech = checkIn.refinishTech;
            this.rentalDate = checkIn.rentalDate;
            this.insurance = checkIn.insurance;
            this.insuranceEstimate = checkIn.insuranceEstimate;
            this.bodyHours = checkIn.bodyHours;
            this.refinishHours = checkIn.refinishHours;
            this.serviceHours = checkIn.serviceHours;
            this.bodyDays = checkIn.bodyDays;
            this.refinishDays = checkIn.refinishDays;
            this.serviceDays = checkIn.serviceDays;
            this.checkInDate = checkIn.checkInDate;
            this.dropOffDate = checkIn.dropOffDate;
            this.checkOutDate = checkIn.checkOutDate;
	    this.comeBack = checkIn.comeBack;
            this.isDPRC = checkIn.isDPRC;
	    this.partsOrdered = checkIn.partsOrdered; 
	    this.backOrdered = checkIn.backOrdered; 
	    this.criticalBackOrdered = checkIn.criticalBackOrdered; 
        },
        cancel: function() {
	    $('.partsOrderedModal').modal('hide');
	    $('.shopManagerAssignModal').modal('hide');
	    $('.writerEstimateModal').modal('hide');
            $('.frontDeskRepairOrderModal').modal('hide');
            var that = this;
            $('.partsOrderedModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
            $('.frontDeskRepairOrderModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
            $('.writerEstimateModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
            $('.shopManagerAssignModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        setForSaving: function() {
            this.isSaving = true;
            this.nameError = false;
        },
        setAlert: function(repairOrder, message) {
            this.isSaving = false;
            //this.nameError = repairOrder;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        },
        // Uses jQuery to set the datepicker.
        datePicker: function() {
            $('#datepicker').datepicker();
        }
    };
    $scope.$parent.checkInFormData = $scope.checkInFormData;

    $scope.addPartsOrdered = function(checkInFormData) {

        checkInFormData.setForSaving();

        checkInFormData.isSaving = true;
        RepairOrderService.addPartsOrdered(checkInFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateRepairOrder(data.data);
                    checkInFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.partsOrderedModal').modal('hide');
                    }
        });
    };
 
    $scope.addAssignment = function(checkInFormData) {

        checkInFormData.setForSaving();

        checkInFormData.isSaving = true;
        RepairOrderService.addAssignment(checkInFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateRepairOrder(data.data);
                    checkInFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.shopManagerAssignModal').modal('hide');
                    }
        });
    };

    $scope.addWriterEstimate = function(checkInFormData) {
        checkInFormData.setForSaving();

        checkInFormData.isSaving = true;
        RepairOrderService.addWriterEstimate(checkInFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateRepairOrder(data.data);
                    checkInFormData.reset();
                    
                    if (data.alerts[0].type == 'success') {
                        $('.writerEstimateModal').modal('hide');
                    }
        });
    };

    $scope.addCheckIn = function(checkInFormData) {
        checkInFormData.setForSaving();

        checkInFormData.isSaving = true;

        RepairOrderService.addRepairOrder(checkInFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateRepairOrder(data.data);
                    checkInFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.frontDeskRepairOrderModal').modal('hide');
                    }
        });
/*
        BoardService.addRepairOrder(checkInFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateRepairOrder(data.data);
                    checkInFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.frontDeskRepairOrderModal').modal('hide');
                    }
        });
*/
    };
}]);
