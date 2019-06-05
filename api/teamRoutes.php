<?php
use RedBeanPHP\R;

// Get all teams
$app->get('/teams', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getTeams());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Create a new team
$app->post('/teams', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $nameTaken = R::findOne('team', ' name = ?', array($data->name));

        if (null != $nameTaken) {
            $jsonResponse->addAlert('error', 'Team name already in use.');
        } else {
            $team = R::dispense('team');
            $team->name = $data->name;
            $team->currentCapacity = $data->currentCapacity;
            $team->maxCapacity = $data->maxCapacity;

            R::store($team);

            $actor = getUser();
            logAction($actor->username . ' added team ' . $team->name, null,  $team->export());
            $jsonResponse->addAlert('success', 'New team ' . $team->name . ' created.');
        }
        $jsonResponse->addBeans(getTeams());
        $jsonResponse->boards = R::exportAll(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});
