<?php
use RedBeanPHP\R;

// Get all insurance
$app->get('/insurance', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getInsurance());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Create a new insurance
$app->post('/insurance', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $nameTaken = R::findOne('insurance', ' name = ?', array($data->name));

        if (null != $nameTaken) {
            $jsonResponse->addAlert('error', 'Insurance name already in use.');
        } else {
            $insurance = R::dispense('insurance');
            $insurance->name = $data->name;
            $insurance->cycleTime = $data->cycleTime;

            R::store($insurance);

            $actor = getUser();
            logAction($actor->username . ' added insurance ' . $insurance->name, null,  $insurance->export());
            $jsonResponse->addAlert('success', 'New insurance ' . $insurance->name . ' created.');
        }
        $jsonResponse->addBeans(getInsurance());
        $jsonResponse->boards = R::exportAll(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Update a user
$app->post('/users/update', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $user = R::load('user', $data->userId);
        $actor = getUser();
        if ($user->id && $actor->isAdmin) {
            $before = $user->export();
            if ($data->newUsername != $user->username) {
                $user = updateUsername($user, $data);
            }
            if ($data->password != '' && $data->password != null) {
                $user->password = password_hash($data->password, PASSWORD_BCRYPT, array('salt' => $user->salt));
            }
            $user->isAdmin = $data->isAdmin;
            $user->email = $data->email;
            $user->defaultBoard = $data->defaultBoard;

            R::store($user);
            addUserToBoard($data->defaultBoard, $user);
            foreach($data->boardAccess as $board) {
                addUserToBoard($board, $user);
            }

            logAction($actor->username . ' updated user ' . $user->username, $before,  $user->export());
            $jsonResponse->addAlert('success', 'User updated.');
        }
        $jsonResponse->addBeans(getUsers());
        $jsonResponse->boards = R::exportAll(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Remove a user.
$app->post('/users/remove', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $user = R::load('user', $data->userId);
        $actor = getUser();
        if ($user->id == $data->userId && $actor->isAdmin) {
            $before = $user->export();
            R::trash($user);
            R::exec('DELETE from board_user WHERE user_id = ?', array($data->userId));

            logAction($actor->username . ' removed user ' . $before['username'], $before, null);
            $jsonResponse->addAlert('success', 'Removed user ' . $user->username . '.');
        }
        $jsonResponse->addBeans(getUsers());
        $jsonResponse->boards = R::exportAll(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});
