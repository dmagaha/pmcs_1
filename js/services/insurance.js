taskBoardServices.factory('InsuranceService',
['$http',
function($http) {
    return {
        currentUser: function() {
            return $http.get('api/user/current');
        },

        changeTeamName: function(newTeamName) {
            return $http.post('api/updateteamname', {
                newTeamName: newTeamName
            });
        },

        changeWorkLoad: function(newWorkLoad) {
            return $http.post('api/updateteamworkload', {
                newWorkLoad: newWorkLoad
            });
        },

        getInsurance: function() {
            return $http.get('api/insurance');
        },

        addInsurance: function(formData) {
            return $http.post('api/insurance', {
                name: formData.name,
                cycleTime: formData.cycleTime
            });
        },

        editInsurance: function(formData) {
            return $http.post('api/insurance/update', {
                name: formData.name,
                cycleTime: formData.cycleTime
            });
        },

        removeInsurance: function(insuranceId) {
            return $http.post('api/insurance/remove', {
                insuranceId: insuranceId
            });
        }
    };
}]);
