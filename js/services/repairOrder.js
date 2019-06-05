taskBoardServices.factory('RepairOrderService',
['$http',
function($http) {
    return {
        currentUser: function() {
            return $http.get('api/user/current');
        },

	addPartsOrdered: function(formData) {
	    return $http.post('api/addPartsOrdered', {
                id: formData.checkInId,
                partsOrdered: formData.partsOrdered,
                backOrdered: formData.backOrdered,
                criticalBackOrder: formData.criticalBackOrder
	    });
	},

        getCompletedRepairOrders: function() {
            return $http.get('api/completedRepairOrders');
        },

        getRepairOrders: function() {
            return $http.get('api/frontDesk');
        },

	getReportRepairOrders: function() {
            return $http.get('api/reportRepairOrders');
        },

        getTechRepairOrders: function() {
            return $http.get('api/techRepairOrders');
        },

        addAssignment: function(formData) {
            return $http.post('api/shopAssignment', {
                id: formData.checkInId,
                refinishTech: formData.refinishTech,
                serviceTech: formData.serviceTech,
                bodyTech: formData.bodyTech
            });
        },

	startProcess: function(formData) {
            return $http.post('api/startProcess', {
                id: formData.id,
		repairLane: formData.repair_lane
            });
	},

        endProcess: function(formData) {
            return $http.post('api/endProcess', {
                id: formData.id,
                repairLane: formData.repair_lane
            });
        },

        checkOut: function(formData) {
            return $http.post('api/checkOut', {
                id: formData.id
            });
        },

        totalLoss: function(formData) {
            return $http.post('api/totalLoss', {
                id: formData.id
            });
        },

	makeSupplement: function(formData) {
            return $http.post('api/addSupplement', {
                id: formData.id
            });
	},

	addWriterEstimate: function(formData) {
            return $http.post('api/writerEstimate', {
                id: formData.checkInId,
                rentalDate: formData.rentalDate,
                insurance: formData.insurance,
                insuranceEstimate: formData.insuranceEstimate,
                bodyHours: formData.bodyHours,
                refinishHours: formData.refinishHours,
                serviceHours: formData.serviceHours,
                isDPRC: formData.isDPRC
            });
        },

        addRepairOrder: function(formData) {
            return $http.post('api/frontDesk', {
                name: formData.name,
        	repairOrderNumber: formData.repairOrderNumber,
        	year: formData.year,
        	color: formData.color,
        	make: formData.make,
        	model: formData.model,
        	phoneNumber: formData.phoneNumber,
        	email: formData.email,
        	cell: formData.cell,
        	comeBack: formData.comeBack,
        	team: formData.team
            });
        }

    };
}]);
