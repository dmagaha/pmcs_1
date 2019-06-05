taskBoardServices.factory('TeamService',
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

        getTeams: function() {
            return $http.get('api/teams');
        },

        addTeam: function(formData) {
            return $http.post('api/teams', {
                name: formData.name,
                currentCapacity: formData.currentCapacity,
                maxCapacity: formData.maxCapacity
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
