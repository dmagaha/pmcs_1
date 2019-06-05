<?php
use RedBeanPHP\R;

// Get all teams
$app->get('/settings', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getSettings());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Create a new team
$app->post('/settings', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $settings = R::dispense('settings');

        $settings->tearDownDays = $data->tearDownDays;
        $settings->refinishDays = $data->refinishDays;
        $settings->bodyDays = $data->bodyDays;
        $settings->serviceDays = $data->serviceDays;
        $settings->trimOutDays = $data->trimOutDays;
        $settings->hoursInDay = $data->hoursInDay;

        R::store($settings);

        $actor = getUser();
        logAction($actor->username . ' added settings ', null,  $settings->export());
        $jsonResponse->addAlert('success', 'New settings created.');
        
        $jsonResponse->addBeans(getSettings());
    }
    $app->response->setBody($jsonResponse->asJson());
});
