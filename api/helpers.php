<?php
use RedBeanPHP\R;
// Patch for when using nginx instead of apache, source: http://php.net/manual/en/function.getallheaders.php#84262
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = '';

        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(
                    str_replace('_', ' ', substr($name, 5))
                )))] = $value;
            }
        }

        return $headers;
    }
}

function getHolidays() {

        date_default_timezone_set('America/New_York');
        $yr = date("Y");
        $usholidays = new UsHolidays($yr);
        $hlist = $usholidays->getListByName();
        $days = array();
        foreach ($hlist as $v) {
                $dt = new DateTime("@$v");
                array_push ($days, $dt->format('m/d/Y'));
        }

        $yr = date("Y") + 1;
        $usholidays = new UsHolidays($yr);
        $hlist = $usholidays->getListByName();
        foreach ($hlist as $v) {
                $dt = new DateTime("@$v");
                array_push ($days, $dt->format('m/d/Y'));
        }

	return $days;
}

function add_business_days($start_date, $business_days, $holidays = array()) {
    $current_date = strtotime($start_date);
    $business_days = intval($business_days); // Decrement does not work on strings
    while ($business_days > 0) {
        if (date('N', $current_date) < 6 && !in_array(date('m/d/Y', $current_date), $holidays)) {
            $business_days--;
        }
        if ($business_days > 0) {
            $current_date = strtotime('+1 day', $current_date);
        }
    }
    return date('m/d/Y', $current_date);
}

// Log an action. If $itemId is set, it is an item action.
function logAction($comment, $oldValue, $newValue, $itemId=null) {
    $activity = R::dispense('activity');
    $activity->comment = $comment;
    $activity->oldValue = json_encode($oldValue);
    $activity->newValue = json_encode($newValue);
    $activity->timestamp = time();
    $activity->itemId = $itemId;

    R::store($activity);
}

// Sets the JWT for the current user and stores in DB for lookup.
function setUserToken($user, $expires) {
    $token = JWT::encode(array(
        'exp' => time() + $expires,
        'uid' => $user->id
    ), getJwtKey());

    $dbToken = R::dispense('token');
    $dbToken->token = $token;

    if (null == $user->ownToken) {
        $user->ownToken = array();
    }
    $user->ownToken[] = $dbToken;

    R::store($user);
}

// Get all repair orders
function getTechRepairOrders() {
    $tech = getUser();

    $ro = R::find('item', '(refinish_tech = ' . $tech->id . ' or service_tech = ' . $tech->id . ' or body_tech = ' . $tech->id . ') AND (repair_lane = 1 or repair_lane = 4 or repair_lane = 5 or repair_lane = 6 or repair_lane = 7) AND (is_checked_out = 0)');
    // $ro = R::findAll('item', '(refinish_tech = ' . $tech->id . ' or service_tech = ' . $tech->id . ' or body_tech = ' . $tech->id . ') AND (repair_lane = 1 or repair_lane = 4 or repair_lane = 5 or repair_lane = 6 or repair_lane = 7)');
    //$ro = R::exec('select * from item where (refinish_tech = ' . $tech->id . ' or service_tech = ' . $tech->id . ' or body_tech = ' . $tech->id . ') AND (repair_lane = 1 or repair_lane = 4 or repair_lane = 5 or repair_lane = 6 or repair_lane = 7)');

    //$ro = R::find('item', 'refinish_tech = ' . $tech->id . ' or service_tech = ' . $tech->id . ' or body_tech = ' . $tech->id );
    return $ro;
}

// Get all repair orders
function getAllRepairOrders() {
    $ro = R::find('item');
    //$ro = R::findAll('item', ' is_checked_out = 1 ');

    $log = R::dispense('log');
    $log->query = $ro->repairOrderNumber;
    $log->query2 = "hello";
    $log->roID = $ro->id;
    //R::store($log);
    return $ro;
}

// Get all checked out repair orders
function getCompletedRepairOrders() {
    $ro = R::find('item', ' is_checked_out = 1 ');

    return $ro;
}

// Get all non-checked out repair orders
function getRepairOrders() {
    $ro = R::findAll('item', ' is_checked_out = 0 ');

    return $ro;
}

// Get all shop settings
function getSettings() {
    $settings = R::find('settings');

    return $settings;
}

// Get all teams
function getTeams() {
    $team = R::find('team');

    return $team;
}

// Get all insurance agencies.
function getInsurance() {
    $insurance = R::find('insurance');

    return $insurance;
}

// Get the user making the current request.
function getUser() {
    global $jsonResponse;
    $gah = getallheaders();
    if (isset($gah['Authorization'])) {
        $hash = $gah['Authorization'];
        try {
            $payload = JWT::decode($hash, getJwtKey());
            $user = R::load('user', $payload->uid);

            if ($user->id) {
                return $user;
            }
        } catch (Exception $e) {}
    }

    $jsonResponse->addAlert('error', 'Unable to load user. Please try again.');
    return null;
}

function getUserByID($id) {
    try {
        $user = R::load('user', $id);

        if ($user->id) {
            return $user;
        }
    } catch (Exception $e) {}

    return null;
}

function getLaneByID($id) {
    try {
        $lane = R::load('lane', $id);

        if ($lane->id) {
            return $lane;
        }
    } catch (Exception $e) {}

    return null;
}

// Get all users.
function getUsers($sanitize = true) {
    try {
        $gah = getallheaders();
        $hash = $gah['Authorization'];
        $payload = JWT::decode($hash, getJwtKey());

        $users = R::findAll('user');
        if ($sanitize) {
            foreach($users as &$user) {
                sanitize($user);
            }
        }

        return $users;
    } catch (Exception $e) {}

    $jsonResponse->addAlert('error', 'Unable to load users. Please try again.');
    return null;
}

// Get all techs
function getTechs($sanitize = true) {
    try {
        $gah = getallheaders();
        $hash = $gah['Authorization'];
        $payload = JWT::decode($hash, getJwtKey());

        $users = R::findAll('user', ' is_tech = 1 ');
        if ($sanitize) {
            foreach($users as &$user) {
                sanitize($user);
            }
        }

        return $users;
    } catch (Exception $e) {}

    $jsonResponse->addAlert('error', 'Unable to load techs. Please try again.');
    return null;
}


// Add a user to a board.
function addUserToBoard($boardId, $user) {
    if ($user->isAdmin) {
        $boards = R::findAll('board'); // DO NOT use getBoards here - it sanitizes the users which causes problems.
        foreach($boards as $board) {
            $board->sharedUser[] = $user;
            R::store($board);
        }
    } else {
        $board = R::load('board', $boardId);
        if ($board->id) {
            $board->sharedUser[] = $user;
            R::store($board);
        }
    }
}

// Get board with name.
function getBoard($name) {
    $user = getUser();
    $boards = R::find('board', ' name LIKE ? ', [ '$name' ] );

    // foreach($boards as $board) {
    //     foreach($board->sharedUser as $boardUser) {
    //         sanitize($boardUser);
    //     }
    // }

    $collapsedLanes = R::find('collapsed', ' user_id = ' . $user->id);
    foreach($boards as $board) {
        foreach($board->xownLane as $lane) {
            foreach($collapsedLanes as $collapsed) {
                if ($lane->id == $collapsed->lane_id) {
                    $lane->collapsed = true;
                }
            }
        }
    }

    //fwrite(STDOUT, $boards->id);
    return $boards;
}

// Get all boards.
function getBoards() {
    $user = getUser();
    $boards = R::find('board');

    foreach($boards as $board) {
        foreach($board->sharedUser as $boardUser) {
            sanitize($boardUser);
        }
    }

    $collapsedLanes = R::find('collapsed', ' user_id = ' . $user->id);
    foreach($boards as $board) {
        foreach($board->xownLane as $lane) {
            foreach($collapsedLanes as $collapsed) {
                if ($lane->id == $collapsed->lane_id) {
                    $lane->collapsed = true;
                }
            }
        }
    }

    if ($user->isAdmin) {
        return $boards;
    } else {
        $filteredBoards = array();
        foreach($boards as $board) {
            foreach($board->sharedUser as $boardUser) {
                if ($user->username == $boardUser->username) {
                    $filteredBoards[] = $board;
                }
            }
        }
        return $filteredBoards;
    }
}

// Finds the removed IDs for updating a board.
function getIdsToRemove($boardList, $dataList) {
    $retVal = array();
    foreach($boardList as $item) {
        $remove = true;
        foreach($dataList as $newItem) {
            if (intval($newItem->id) == $item->id) {
                $remove = false;
            }
        }
        if ($remove) {
            $retVal[] = $item->id;
        }
    }
    return $retVal;
}

// Load a board bean from provided data.
function loadBoardData($board, $data) {
    $board->name = $data->name;
    $board->active = true;

    $removeIds = getIdsToRemove($board->xownLane, $data->lanes);
    foreach($removeIds as $id) {
        unset($board->xownLane[$id]);
    }

    // R::load works like R::dispense if the id is not found.
    foreach($data->lanes as $item) {
        $lane = R::load('lane', $item->id);
        $lane->name = $item->name;
        $lane->position = intval($item->position);

        if (null == $lane->ownItems) {
            $lane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$lane->id) {
            $board->xownLane[] = $lane;
        }
        R::store($lane);
    }

    $removeIds = getIdsToRemove($board->xownCategory, $data->categories);
    foreach($removeIds as $id) {
        unset($board->xownCategory[$id]);
    }
    foreach($data->categories as $item) {
        $category = R::load('category', $item->id);
        $category->name = $item->name;
        $category->color = $item->color;

        // New category, add it to the board.
        if (!$category->id) {
            $board->xownCategory[] = $category;
        }
        R::store($category);
    }

    $removeIds = getIdsToRemove($board->xownTracker, $data->trackers);
    foreach($removeIds as $id) {
        unset($board->xownTracker[$id]);
    }
    foreach($data->trackers as $item) {
        $tracker = R::load('tracker', $item->id);
        $tracker->name = $item->name;
        $tracker->bugexpr = $item->bugexpr;

        // New issue tracker, add it to the board.
        if (!$tracker->id) {
            $board->xownTracker[] = $tracker;
        }
        R::store($tracker);
    }

    // Add or remove users as selected.
    for($i = 1; $i < count($data->users); $i++) {
        $user = R::load('user', $i);
        if ($data->users[$i] && $user->id && !in_array($user, $board->sharedUser)) {
            $board->sharedUser[] = $user;
        } else {
            unset($board->sharedUser[$i]);
        }
    }

    // Add all admin users.
    foreach(getUsers(false) as $user) {
        if ($user->isAdmin && !in_array($user, $board->sharedUser)) {
            $board->sharedUser[] = $user;
        }
    }

    R::store($board);
}

// Clean a user bean for return to front-end.
function sanitize($user) {
    $user['salt'] = null;
    $user->ownToken = array();
    $user['password'] = null;
}

// Change username if available.
function updateUsername($user, $data) {
    global $jsonResponse;
    $nameTaken = R::findOne('user', ' username = ?', array($data->newUsername));

    if (null != $user && null == $nameTaken) {
        $user->username = $data->newUsername;
        $jsonResponse->addAlert('success', 'Username updated.');
    } else {
        $jsonResponse->addAlert('error', 'Username already in use.');
    }

    return $user;
}

// Change email if available.
function updateEmail($user, $data) {
    global $jsonResponse;
    $emailTaken = R::findOne('user', ' username = ?', array($data->newEmail));

    if (null != $user && null == $emailTaken) {
        $user->email = $data->newEmail;
        $jsonResponse->addAlert('success', 'Email updated.');
    } else {
        $jsonResponse->addAlert('error', 'Email already in use.');
    }

    return $user;
}

// Validate a provided JWT.
function validateToken($requireAdmin = false) {
    global $jsonResponse, $app;
    $retVal = false;

    if (checkDbToken()) {
        $retVal = true;
    } else {
        clearDbToken();
        $jsonResponse->message = 'Invalid token.';
        $app->response->setStatus(401);
    }

    if ($retVal && $requireAdmin) {
        $user = getUser();
        if (!$user->isAdmin) {
            clearDbToken();
            $jsonResponse->message = 'Insufficient user privileges.';
            $app->response->setStatus(401);
        }
    }

    return $retVal;
}

// Retrieve user's token from DB and compare to header token.
function checkDbToken() {
    $user = getUser();
    $isValid = false;

    if (null != $user) {
        $gah = getallheaders();
        if (isset($gah['Authorization'])) {
            $hash = $gah['Authorization'];

            foreach ($user->ownToken as $token) {
                if ($hash == $token->token) {
                    $isValid = true;
                }
            }
        }
    }

    return $isValid;
}

// Clear a user's token from the DB.
function clearDbToken() {
    $payload = null;
    $gah = getallheaders();
    try {

        $payload = JWT::decode($gah['Authorization'], getJwtKey());
    } catch (Exception $e) {}

    if (null != $payload) {
        $user = R::load('user', $payload->uid);
        if (0 != $user->id) {
            $hash = $gah['Authorization'];

            foreach ($user->ownToken as $token) {
                if ($hash == $token->token) {
                    R::trash($token);
                }
            }

            R::store($user);
        }
    }
}

// Get the application's JWT key (created on first run).
function getJwtKey() {
    $key = R::load('jwt', 1);

    if (!$key->id) {
        $key->token = password_hash(strval(time()), PASSWORD_BCRYPT);
        R::store($key);
    }

    return $key->token;
}

function initializeApp() {
    createInitialUser();
    // If there are no boards, create the main repair board
    if (!R::count('board')) {
    	createRepairBoard('PMCS - Repair');
        //createSupplementBoard('PMCS - Supplement');
        //createPartsBoard('PMCS - Parts');
    }
}

function createRepairBoard($name) {
        $board = R::dispense('board');

        $board->name = $name;
        $board->active = 1;

	// create the lanes for the board
        $pendingLane = R::dispense('lane');
        $pendingLane->name = 'Pending';
        $pendingLane->position = 0;
        if (null == $pendingLane->ownItems) {
            $pendingLane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$pendingLane->id) {
            $board->xownLane[] = $pendingLane;
        }
        R::store($pendingLane);

        $tdlane = R::dispense('lane');
        $tdlane->name = 'Tear Down';
        $tdlane->position = 1;
        if (null == $tdlane->ownItems) {
            $tdlane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$tdlane->id) {
            $board->xownLane[] = $tdlane;
        }
        R::store($tdlane);

        $supplane = R::dispense('lane');
        $supplane->name = 'Supplement';
        $supplane->position = 2;
        if (null == $supplane->ownItems) {
            $supplane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$supplane->id) {
            $board->xownLane[] = $supplane;
        }
        R::store($supplane);

        $partslane = R::dispense('lane');
        $partslane->name = 'Awaiting Parts';
        $partslane->position = 3;
        if (null == $partslane->ownItems) {
            $partslane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$partslane->id) {
            $board->xownLane[] = $partslane;
        }
        R::store($partslane);

        $bodylane = R::dispense('lane');
        $bodylane->name = 'Body';
        $bodylane->position = 4;
        if (null == $bodylane->ownItems) {
            $bodylane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$bodylane->id) {
            $board->xownLane[] = $bodylane;
        }
        R::store($bodylane);

        $reflane = R::dispense('lane');
        $reflane->name = 'Refinish';
        $reflane->position = 5;
        if (null == $reflane->ownItems) {
            $reflane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$reflane->id) {
            $board->xownLane[] = $reflane;
        }
        R::store($reflane);

        $trimlane = R::dispense('lane');
        $trimlane->name = 'Trim Out';
        $trimlane->position = 6;
        if (null == $trimlane->ownItems) {
            $trimlane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$trimlane->id) {
            $board->xownLane[] = $trimlane;
        }
        R::store($trimlane);

        $servicelane = R::dispense('lane');
        $servicelane->name = 'Service';
        $servicelane->position = 7;
        if (null == $servicelane->ownItems) {
            $servicelane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$servicelane->id) {
            $board->xownLane[] = $servicelane;
        }
        R::store($servicelane);

        $dclane = R::dispense('lane');
        $dclane->name = 'Detail/Cleanup';
        $dclane->position = 8;
        if (null == $dclane->ownItems) {
            $dclane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$dclane->id) {
            $board->xownLane[] = $dclane;
        }
        R::store($dclane);

        R::store($board);

	return $board;
}

// If there are no users, create the admin user.
function createInitialUser() {
    if (!R::count('user')) {
        $admin = R::dispense('user');

        $admin->username = 'admin';
        $admin->isAdmin = true;
        $admin->isTech = true;
        $admin->isWriter = true;
        $admin->isManager = true;
        $admin->isAdmin = true;
        $admin->isSuperUser = true;
        $admin->logins = 0;
        $admin->lastLogin = time(); //date('Y-m-d H:i:s');
        $admin->defaultBoard = null;
        $admin->salt = password_hash($admin->username . time(), PASSWORD_BCRYPT);
        $admin->password = password_hash('admin', PASSWORD_BCRYPT, array('salt' => $admin->salt));
        $admin->email = '';

        $options = R::dispense('option');
        $options->tasksOrder = 0;
        $options->showAnimations = true;
        $options->showAssignee = true;

        $admin->xownOptionList[] = $options;

        R::store($admin);
    }
}

function createPartsBoard($name) {
        $board = R::dispense('board');

        $board->name = $name;
        $board->active = 1;

        // create the lanes for the board
        $pendingLane = R::dispense('lane');
        $pendingLane->name = 'Pending';
        $pendingLane->position = 0;
        if (null == $pendingLane->ownItems) {
            $pendingLane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$pendingLane->id) {
            $board->xownLane[] = $pendingLane;
        }
        R::store($pendingLane);

        $writtenLane = R::dispense('lane');
        $writtenLane->name = 'Written';
        $writtenLane->position = 1;
        if (null == $writtenLane->ownItems) {
            $writtenLane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$writtenLane->id) {
            $board->xownLane[] = $writtenLane;
        }
        R::store($writtenLane);

        $doneLane = R::dispense('lane');
        $doneLane->name = 'Done';
        $doneLane->position = 2;
        if (null == $doneLane->ownItems) {
            $doneLane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$doneLane->id) {
            $board->xownLane[] = $doneLane;
        }
        R::store($doneLane);

        R::store($board);

	return $board;
}

function createSupplementBoard($name) {
        $board = R::dispense('board');

        $board->name = $name;
        $board->active = 1;

        // create the lanes for the board
        $pendingLane = R::dispense('lane');
        $pendingLane->name = 'Pending';
        $pendingLane->position = 0;
        if (null == $pendingLane->ownItems) {
            $pendingLane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$pendingLane->id) {
            $board->xownLane[] = $pendingLane;
        }
        R::store($pendingLane);

        $writtenLane = R::dispense('lane');
        $writtenLane->name = 'Written';
        $writtenLane->position = 1;
        if (null == $writtenLane->ownItems) {
            $writtenLane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$writtenLane->id) {
            $board->xownLane[] = $writtenLane;
        }
        R::store($writtenLane);

        $doneLane = R::dispense('lane');
        $doneLane->name = 'Done';
        $doneLane->position = 2;
        if (null == $doneLane->ownItems) {
            $doneLane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$doneLane->id) {
            $board->xownLane[] = $doneLane;
        }
        R::store($doneLane);

        R::store($board);

        return $board;
}

function businessDaysFromToday($bDays) {
    $timestamp = strval(time());
    return businessDays($timestamp, $bDays);
}

function businessDays($timestamp = false, $bDays = 2) {
    if($timestamp === false) $timestamp = time();
    while ($bDays>0) {
        $timestamp += 86400;
        if (date('N', $timestamp)<6) $bDays--;
    }
    return $timestamp;
}

// Gets the position for a new item in a column.
function getNextItemPosition($columnId) {
    $retVal = 0;
    $column = R::load('lane', $columnId);

    if ($column->id) {
        $options = R::exportAll(getUser()->ownOption);

        if ($options[0]['tasks_order'] == 1) {
            // Tasks at top of column.
            renumberItems($columnId, 0, false);
        } else {
            try {
                $retVal = $column->countOwn('item');
            } catch (Exception $e) {
                // Ignore, just means there are no items.
            }
        }
    }

    return $retVal;
}

function renumberItems($columnId, $itemPosition, $isRemoved = true) {
    $items = R::find('item', 'lane_id = ' . $columnId);

    foreach ($items as $item) {
        if ($item->position >= $itemPosition) {
            $item->position += $isRemoved ? -1 : 1;
            R::store($item);
        }
    }
}

function runAutoActions(&$item) {
    $lane = R::load('lane', $item->laneId);
    $board = R::load('board', $lane->boardId);

    foreach($board->ownAutoaction as $action) {
        switch($action->triggerId) {
            case 0: // Item moves to lane
            if ($item->laneId == $action->secondaryId) {
                updateItemFromAction($item, $action);
            }
            break;
            case 1: // Item assigned to user
            if ($item->assignee == $action->secondaryId ||
                ($action->secondaryId == 0 && $item->assignee == null)) {
                updateItemFromAction($item, $action);
            }
            break;
            case 2: // Item assigned to category
            if ($item->category == $action->secondaryId ||
                ($action->secondaryId == 0 && $item->category == null)) {
                updateItemFromAction($item, $action);
            }
            break;
        }
    }
}

function updateItemFromAction(&$item, $action) {
    switch($action->actionId) {
        case 0: // Set item color
        $item->color = $action->color;
        break;
        case 1: // Set item category
        $item->category = $action->categoryId;
        break;
        case 2: // Set item assignee
        $item->assignee = $action->assigneeId;
        break;
        case 3: // Clear item due date
        $item->dueDate = null;
        break;
    }
    R::store($item);
}
