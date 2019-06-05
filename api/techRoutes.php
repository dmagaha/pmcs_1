<?php
use RedBeanPHP\R;

// Get all repair orders
$app->get('/techview', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getRepairOrders());
    }
    $app->response->setBody($jsonResponse->asJson());
});
