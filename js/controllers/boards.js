taskBoardControllers.controller('BoardCtrl',
['$scope', '$routeParams', '$location', '$interval', '$window',
 'UserService', 'TeamService', 'BoardService', 'AlertService', 'AuthenticationService',
function ($scope, $routeParams, $location, $interval, $window,
          UserService, TeamService, BoardService, AlertService, AuthenticationService) {
    // This is here because the BoardCtrl is the default redirect from login.
    // If the user was trying to go somewhere else first, they are redirected now.
    if (AuthenticationService.attemptedRoute) {
        var tmp = AuthenticationService.attemptedRoute,
            path = tmp.originalPath;

        tmp.keys.forEach(function(key) {
            path = path.replace(':' + key.name, tmp.params[key.name]);
        });
        AuthenticationService.attemptedRoute = null;
        $location.path(path);
    }

    $scope.quickAdd = {
        title: []
    };

    $scope.alerts = AlertService;
    $scope.marked = function(text) {
        if (text) {
            return $window.marked(hyperlink(text, $scope.trackers));
        } else {
            return '';
        }
    };

    $scope.boardId = $routeParams.boardId;
    $scope.filter = {
        user: null,
        category: null,
        hide: false
    };

    $scope.filterChanged = function() {
        $scope.currentBoard.ownLane.forEach(function (lane) {
            if (lane.ownItem) {
                lane.ownItem.forEach(function (item) {
                    item.filtered = false;
                    if ($scope.filter.user !== null) {
                        if ($scope.filter.user != item.assignee) {
                            item.filtered = true;
                        }
                    }
                    if ($scope.filter.category !== null) {
                        if ($scope.filter.category != item.category) {
                            item.filtered = true;
                        }
                    }
                });
            }
        });
    };

    $scope.selectBoard = function() {
        $location.path('boards/' + $scope.boardNames.current);
    };

    $scope.openEditItem = function() {
        $scope.itemFormData.loadItem($scope.contextItem);
        $('.itemModal textarea').css('height', 'auto');
        $('.itemModal').modal('show');
    };

    $scope.openAddItem = function() {
        $scope.itemFormData.reset($scope.contextLaneId);
        $('.itemModal textarea').css('height', 'auto');
        $('.itemModal').modal('show');
    };

    $scope.removeItem = function() {
        $scope.openItem($scope.contextItem, false);
        $scope.deleteItem();
    };

    $scope.changeItemLane = function() {
        $scope.itemFormData.loadItem($scope.contextItem);
        $scope.itemFormData.isAdd = false;

        $scope.submitItem($scope.itemFormData);
    };

    $scope.contextItem = {}; // Needs to exist prior to onContextMenu call.
    $scope.onContextMenu = function(laneId, item) {
        $scope.contextItem = item;
        $scope.contextLaneId = laneId;
    };

    // This is called every 250ms until the boards are loaded.
    // Once loaded, the repetitive calling is canceled.
    // If a default is found the user is redirected to that board.
    var checkDefaultBoard = function() {
        if ($scope.boardId) {
            $interval.cancel($scope.interval);
        }
        if ($scope.boardsLoaded && !$scope.boardId && $scope.currentUser && parseInt($scope.currentUser.defaultBoard)) {
            $interval.cancel($scope.interval);
            $location.path('boards/' + $scope.currentUser.defaultBoard);
        }
    };
    $scope.interval = $interval(checkDefaultBoard, 250);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

    $scope.boards = [];
    $scope.boardsLoaded = false;
    $scope.boardNames = [];
    $scope.userNames = [];
    $scope.techNames = [];
    $scope.laneNames = [];
    $scope.categories = [];
    $scope.trackers = [];

    $scope.loadingTechs = true;
    $scope.loadingTeams = true;

    $scope.currentBoard = {
        loading: true,
        name: 'PMCS'
    };

    var pendingTeamResponse = false,
        retryTeamCount = 3,
        pendingTechResponse = false,
        retryTechCount = 3;
    $scope.loadTechs = function() {
            if (pendingTechResponse) {
                return;
            }

            pendingTechResponse = true;
            UserService.getTechs()
            .success(function(data) {
                $scope.updateTechList(data.data);
                pendingTechResponse = false;
                retryTechCount = 3;
            })
            .error(function() {
                if (retryTechCount--) {
                    pendingTechResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingTechs = false;
            });
        };

    $scope.loadTeams = function() {
            if (pendingTeamResponse) {
                return;
            }

            pendingTeamResponse = true;
            TeamService.getTeams()
            .success(function(data) {
                $scope.updateTeamsList(data.data);
                pendingTeamResponse = false;
                retryTeamCount = 3;
            })
            .error(function() {
                if (retryTeamCount--) {
                    pendingTeamResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingTeams = false;
            });
        };

    var pendingResponse = false,
        updateCounter = 0;

    $scope.isActiveFilter = function(element) {
        var retVal = false;
        $scope.boards.forEach(function(board) {
            if (board.id === element.id) {
                retVal = (board.active === '1');
            }
        }, this);

        return retVal;
    };

    $scope.loadBoards = function() {
            // Don't update the boards if an update is pending.
            if (pendingResponse || updateCounter) {
                return;
            }

            pendingResponse = true;
            BoardService.getBoards()
            .success(function(data) {
                pendingResponse = false;
                $scope.updateBoards(data);
            });
        };
    $scope.loadBoards();
    $scope.loadTeams();
    $scope.loadTechs();
    $scope.teamInterval = $interval($scope.loadTeams, 5000);
    $scope.techInterval = $interval($scope.loadTechs, 5000);
    $scope.boardInterval = $interval($scope.loadBoards, 10000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.boardInterval); });

    $scope.updateTechList = function(data) {
        if (undefined === data) {
            return;
        }

        $scope.loadingTechs = false;
        if (null === data) {
            $scope.techs = [];
            return;
        }
        $scope.techs = data;

        var techNames = [];
        data.forEach(function(tech) {
            techNames.push({ 'id': tech.id, 'name':tech.name });
        });
        $scope.techNames = techNames;

        for (var i = 0, len = techNames.length; i < len; i++) {
            $scope.techLookup[techNames[i].id] = techNames[i].name;
        }
    };

    $scope.updateTeamsList = function(data) {
        if (undefined === data) {
            return;
        }

        $scope.loadingTeams = false;
        if (null === data) {
            $scope.teams = [];
            return;
        }
        $scope.teams = data;

        var teamNames = [];
        data.forEach(function(team) {
            teamNames.push({ 'id': team.id, 'name':team.name });
        });
        $scope.teamNames = teamNames;

        for (var i = 0, len = teamNames.length; i < len; i++) {
            $scope.teamLookup[teamNames[i].id] = teamNames[i].name;
        }
    };

    $scope.updateBoards = function(data) {
        // Don't update the boards if a position update is pending.
        if (0 !== updateCounter) {
            return;
        }
        $scope.boards = data.data;
        $scope.boardsLoaded = true;

        var boardFound = false;
        if ($scope.boards) {
            $scope.boardNames = [];
            $scope.boards.forEach(function(board) {
                if (parseInt(board.active) === 1) {
                    // Add each board's name to the list.
                    $scope.boardNames.push({id: board.id, name: board.name});
                }

                // If the board is the current board, process and assign it.
                if (board.id == $scope.boardId) {
                    board.sharedUser.unshift({ id: 0, username: 'Unassigned' });
                    board.sharedUser.forEach(function(user) {
                        $scope.userNames[user.id] = user.username;
                    });

                    board.ownLane.forEach(function(lane) {
                        $scope.laneNames[lane.id] = lane.name;
                        if (lane.ownItem) {
                            lane.ownItem.forEach(function(item) {
				if (item.repair_lane == 1) {
                		    if (item.tear_down_start_date != null) {
					var tdate = new Date(item.tear_down_start_date * 1000);
                        		// item.tear_down_start_date = tdate.toLocaleString();
					var m = tdate.getMonth() + 1;
					var mm = "";
					if (m < 10) {
					   mm = "0" + m;
					}
					else {
					   mm = m;
					}
					var d = tdate.getDate();
					var y = tdate.getFullYear();
                        		item.tear_down_start_date = mm + "/" + d + "/" + y;
                		    }

                                    var date = new Date(item.due_date),
                                        diff = date - Date.now();
                                    if (diff < 0) {
                                        item.datePast = true;
                                    } else if (diff < (1000 * 60 * 60 * 24 * 3)) { // Three days
                                        item.dateNear = true;
                                    }
				}
                                if (item.repair_lane == 7) {
                                    var date = new Date(item.service_due_date),
                                        diff = date - Date.now();
                                    if (diff < 0) {
                                        item.datePast = true;
                                    } else if (diff < (1000 * 60 * 60 * 24 * 3)) { // Three days
                                        item.dateNear = true;
                                    }
                                }
                                if (item.repair_lane == 4) {
                                    var date = new Date(item.body_due_date),
                                        diff = date - Date.now();
                                    if (diff < 0) {
                                        item.datePast = true;
                                    } else if (diff < (1000 * 60 * 60 * 24 * 3)) { // Three days
                                        item.dateNear = true;
                                    }
                                }
                                if (item.repair_lane == 5) {
                                    var date = new Date(item.refinish_due_date),
                                        diff = date - Date.now();
                                    if (diff < 0) {
                                        item.datePast = true;
                                    } else if (diff < (1000 * 60 * 60 * 24 * 3)) { // Three days
                                        item.dateNear = true;
                                    }
                                }
                                if (item.repair_lane == 6) {
                                    var date = new Date(item.trim_out_due_date),
                                        diff = date - Date.now();
                                    if (diff < 0) {
                                        item.datePast = true;
                                    } else if (diff < (1000 * 60 * 60 * 24 * 3)) { // Three days
                                        item.dateNear = true;
                                    }
                                }


                                item.position = parseInt(item.position);
                            });
                        }
                    });

                    if (board.ownCategory) {
                        board.ownCategory.unshift({ id: 0, name: 'Uncategorized', color: '#ffffe0' });
                        board.ownCategory.forEach(function(category) {
                            $scope.categories[category.id] = category.name;
                        });
                    }

                    if (board.ownTracker) {
                        board.ownTracker.forEach(function(tracker) {
                            $scope.trackers[tracker.id] = [tracker.name, tracker.bugexpr];
                        });
                    }

                    $scope.currentBoard = board;
                    $scope.boardNames.current = board.id;
                    boardFound = true;
                }
            });
        }

        if (boardFound) {
            $scope.filterChanged(); // Make sure any filters are still applied.
            $scope.currentBoard.loading = false;
            if ($scope.currentBoard.active === '0') {
                $scope.currentBoard = {
                    loading: true,
                    name: 'PMCS',
                    error: true
                };
            }
        } else {
            $scope.currentBoard.error = true;
        }
    };

    $scope.toggleLane = function(lane) {
        lane.collapsed = !lane.collapsed;
        updateCounter++;

        BoardService.toggleLane(lane.id)
        .success(function(data) {
            updateCounter--;
            $scope.updateBoards(data);
        });
    };

    // This is not the Angular way.
    $scope.updateSortables = function() {
        var that = this.$parent;
        $('.itemContainer').sortable({
            connectWith: '.itemContainer',
            placeholder: 'draggable-placeholder',
            items: 'div:not(.addItem, .itemHeader, .description)',
            change: function(event, ui) {
                var parent = $(ui).parent(),
                    addItem = parent.find('.addItem');

                addItem.detach();
                parent.append(addItem);
            },
            stop: function(event, ui) {
                var lanes = $.find('.boardColumn'),
                    positionArray = [];

                $(lanes).each(function() {
                    var laneId = $(this).attr('data-lane-id');
                    $(this).find('.boardItem').each(function(index) {
                        var itemId = $(this).attr('data-item-id');
                        positionArray.push({
                            item: itemId,
                            lane: laneId,
                            position: index
                        });
                    });
                });
                that.updatePositions(positionArray);
            }
        });
    };

    $scope.updatePositions = function(positionArray) {
        updateCounter++;
        BoardService.updateItemPositions(positionArray)
        .success(function(data) {
            updateCounter--;
            $scope.updateBoards(data);
        });
    };

    $scope.currentUser = {};
    $scope.userLoaded = false;
    $scope.updateCurrentUser = function() {
        UserService.currentUser()
        .success(function(data) {
            $scope.userLoaded = true;
            $scope.currentUser = data.data;
        });
    };
    $scope.updateCurrentUser();
}]);
