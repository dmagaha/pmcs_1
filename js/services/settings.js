taskBoardServices.factory('SettingsService',
['$http',
function($http) {
    return {
        currentUser: function() {
            return $http.get('api/user/current');
        },

        getSettings: function() {
            return $http.get('api/settings');
        },

        addSettings: function(formData) {
            return $http.post('api/settings', {
                tearDownDays: formData.tearDownDays,
                serviceDays: formData.serviceDays,
                refinishDays: formData.refinishDays,
                trimOutDays: formData.trimOutDays,
                hoursInDay: formData.hoursInDay,
                bodyDays: formData.bodyDays
            });
        },

        editTeam: function(formData) {
            return $http.post('api/team/update', {
                name: formData.name,
                currentCapacity: formData.currentCapacity,
                maxCapacity: formData.maxCapacity
            });
        },

        removeTeam: function(teamId) {
            return $http.post('api/team/remove', {
                teamId: teamId
            });
        }
    };
}]);
