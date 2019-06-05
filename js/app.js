var taskBoardServices = angular.module('TaskBoardServices', []);
var taskBoardControllers = angular.module('TaskBoardControllers', []);
var taskBoardDirectives = angular.module('TaskBoardDirectives', []);

// var taskBoard = angular.module('PMCS',
                               // ['ngRoute', 'ngSanitize',
                                // 'ng-context-menu',
                                // 'TaskBoardServices',
                                // 'TaskBoardControllers',
                                // 'TaskBoardDirectives']);

var taskBoard = angular.module('TaskBoard',
                               ['ngRoute', 'ngSanitize',
                                'ng-context-menu',
                                'TaskBoardServices',
                                'TaskBoardControllers',
                                'TaskBoardDirectives']);

taskBoard.config(['$routeProvider', '$httpProvider',
function($routeProvider, $httpProvider) {
    $routeProvider.when('/', {
        controller: 'LoginCtrl',
        templateUrl: 'partials/login.html'
    }).when('/boards', {
        controller: 'BoardCtrl',
        templateUrl: 'partials/boardSelect.html',
        authRequired: true
    }).when('/boards/:boardId', {
        controller: 'BoardCtrl',
        templateUrl: 'partials/board.html',
        authRequired: true,
        resolve: {
            validation: ['$q', '$route', function($q, $route) {
                var deferred = $q.defer(),
                    id = parseInt($route.current.params.boardId);
                if (isNaN(id)) {
                    deferred.reject('INVALID BOARD ID');
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            }]
        }
    }).when('/OffsiteView', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/offsite.html',
        authRequired: true
    }).when('/ProductionManager', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/shopManager.html',
        authRequired: true
    }).when('/DetailCleanup', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/detailCleanupView.html',
        authRequired: true
    }).when('/ShopManager', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/shopManager.html',
        authRequired: true
    }).when('/ReportView', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/reportView.html',
        authRequired: true
    }).when('/WriterView', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/writerView.html',
        authRequired: true
    }).when('/TechView', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/techView.html',
        authRequired: true
    }).when('/PartsView', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/parts.html',
        authRequired: true
    }).when('/FrontDesk', {
        controller: 'FrontDeskCtrl',
        templateUrl: 'partials/frontDesk.html',
        authRequired: true
    }).when('/settings', {
        controller: 'SettingsCtrl',
        templateUrl: 'partials/settings.html',
        authRequired: true
    }).when('/files/:fileId', {
        controller: 'FilesCtrl',
        templateUrl: 'partials/files.html',
        authRequired: true
    }).otherwise({
        redirectTo: '/'
    });

    // Inject the auth token with each API call.
    $httpProvider.interceptors.push('TokenInterceptor');
}]);

// Custom handlers for route authentication and rejection of invalid board id
taskBoard.run(['$rootScope', '$location', '$window', 'AuthenticationService',
function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.version = 'v0.1.0';

    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        // Redirect to default path if authentication is required but not present.
        if (nextRoute !== null && nextRoute.authRequired !== null &&
            nextRoute.authRequired && !AuthenticationService.isAuthenticated &&
            !$window.localStorage.token) {
            $location.path('/');
        }
        if (nextRoute !== null && nextRoute.controller === 'LoginCtrl' && $window.localStorage.token) {
            $location.path('/boards');
        }
    });

    $rootScope.$on('$routeChangeSuccess', function(event, route, previousRoute) {
        if (route.controller === 'LoginCtrl' && previousRoute && previousRoute.originalPath !== '') {
            AuthenticationService.attemptedRoute = previousRoute;
        }
    });

    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
        // Custom rejection from /boards/:boardId route
        if (rejection === 'INVALID BOARD ID') {
            $location.path('/boards');
        }
    });
}]);
