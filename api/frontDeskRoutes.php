<?php
use RedBeanPHP\R;

$app->get('/techRepairOrders', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getTechRepairOrders());
    }
    $app->response->setBody($jsonResponse->asJson());
});

$app->get('/completedRepairOrders', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getCompletedRepairOrders());
    }
    $app->response->setBody($jsonResponse->asJson());
});

$app->get('/frontDesk', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getRepairOrders());
    }
    $app->response->setBody($jsonResponse->asJson());
});

$app->get('/reportRepairOrders', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getAllRepairOrders());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// add parts ordered
$app->post('/addPartsOrdered', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

        $repairOrder->orderDate = time();
        $repairOrder->backOrdered = $data->backOrdered;
        $repairOrder->criticalBackOrder = $data->criticalBackOrder;

        $repairOrder->status = 'Parts Ordered';

        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// move to supplement
$app->post('/addSupplement', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

        $repairOrder->repairLane = 2;
        $repairOrder->alreadyStarted = 0;

        $repairOrder->position = getNextItemPosition(3);
        $repairOrder->laneId = 3;
        
        $board = R::load('board', 1);
        $board->xownLane[3]->ownItems[] = $repairOrder;
        R::store($board);

        $repairOrder->status = 'Awaiting Supp.';

	// TODO add the supplement to the supplements of the repair order
	//$repairOrder->ownSupplements[] = $suppItem;

        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// update with shop assignment
$app->post('/shopAssignment', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

	if ($data->repairLane == 0) {
		$repairOrder->repairLane = 1;

        	$repairOrder->position = getNextItemPosition(2);
        	$repairOrder->laneId = 2;
		
        	$board = R::load('board', 1);
		$board->xownLane[2]->ownItems[] = $repairOrder;
        	R::store($board);

	}
        $repairOrder->assignmentDate = time();

	$refinishTech = R::load('user', $data->refinishTech);
	$refinishTech->currentWorkload = $refinishTech->currentWorkload + $repairOrder->refinishHours;
	R::store($refinishTech);

	$bodyTech = R::load('user', $data->bodyTech);
	$bodyTech->currentWorkload = $bodyTech->currentWorkload + $repairOrder->bodyHours;
	R::store($bodyTech);

	$serviceTech = R::load('user', $data->serviceTech);
	$serviceTech->currentWorkload = $serviceTech->currentWorkload + $repairOrder->serviceHours;
	R::store($serviceTech);

        $repairOrder->refinishTech = $data->refinishTech;
        $repairOrder->serviceTech = $data->serviceTech;
        $repairOrder->bodyTech = $data->bodyTech;
	$repairOrder->status = '';

        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// update with writer estimate
$app->post('/writerEstimate', function() use($app, $jsonResponse) {

    date_default_timezone_set('America/New_York');
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

        $repairOrder->estimateDate = time();
        $repairOrder->isDPRC = $data->isDPRC;
        $repairOrder->rentalDate = $data->rentalDate;
        $repairOrder->insurance = $data->insurance;
        $repairOrder->insuranceEstimate = $data->insuranceEstimate;
        $repairOrder->bodyHours = $data->bodyHours;
        $repairOrder->refinishHours = $data->refinishHours;
        $repairOrder->serviceHours = $data->serviceHours;
	$repairOrder->status = 'Awaiting Assign';

	$settings = R::load('settings', 2);
	if ($settings->hoursInDay == 0) {
		$settings->hoursInDay = 1;
	}
	$insuranceEstimateDays = ceil($data->insuranceEstimate / $settings->hoursInDay);
        $repairOrder->refinishDays = ceil($data->refinishHours / $settings->hoursInDay);
        $repairOrder->bodyDays = ceil($data->bodyHours / $settings->hoursInDay);
        $repairOrder->serviceDays = ceil($data->serviceHours / $settings->hoursInDay);

	$days = getHolidays();
	$dt = new DateTime();
	$sdate = $dt->format('m/d/Y');
	$repairOrder->testDate = $sdate;
	$repairOrder->insDays = $insuranceEstimateDays;
	$repairOrder->todays = $sdate;
	$repairOrder->dueDate = add_business_days($sdate, $insuranceEstimateDays, $days);
	//$repairOrder->dueDate = '06/12/2019';

        R::store($repairOrder);
        R::store($settings);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// update with total loss
$app->post('/totalLoss', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

        $repairOrder->totalLoss = 1;
        $repairOrder->status = "Awaiting Loss Conf";
        $repairOrder->alreadyStarted = 0;

        $repairOrder->repairLane = 2;
        $repairOrder->position = getNextItemPosition(3);
        $repairOrder->laneId = 3;
        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// update with check out
$app->post('/checkOut', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

	$repairOrder->checkOutDate = time();
	$repairOrder->isCheckedOut = 1;
        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Create new checkin item
$app->post('/frontDesk', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $board = R::load('board', 1);

	$repairOrder = R::dispense('item');

        $repairOrder->alreadyStarted = 0;
	$repairOrder->isCheckedOut = 0;
	$repairOrder->name = $data->name; 
	$repairOrder->email = $data->email; 
	$repairOrder->phoneNumber = $data->phoneNumber; 
	$repairOrder->cell = $data->cell; 
	$repairOrder->year = $data->year; 
	$repairOrder->make = $data->make; 
	$repairOrder->model = $data->model; 
	$repairOrder->color = $data->color; 
	$repairOrder->team = $data->team; 
	$repairOrder->status = 'Awaiting Estimate';
	$repairOrder->repairOrderNumber = $data->repairOrderNumber; 
	$repairOrder->totalLoss = 0; 
	$repairOrder->comeBack = $data->comeBack; 
	$repairOrder->repairLane = 0;
	$repairOrder->lane = 0;
        $repairOrder->position = getNextItemPosition(1);

	$repairOrder->dropOffDate = time();

	if (empty($repairOrder->repairOrderNumber) == FALSE) {
		$repairOrder->checkInDate = $repairOrder->dropOffDate;
	}

        if (null == $repairOrder->ownSupplements) {
            $repairOrder->ownSupplements = array();
        }

	$board->xownLane[1]->ownItems[] = $repairOrder;

        R::store($board);

        R::store($repairOrder);

        if ($repairOrder->id) {
             $actor = getUser();
             logAction($actor->username . ' added repair order ' . $repairOrder->repairOrderNumber . ' to board ' . $board->name,
                          null, $repairOrder->export(), $repairOrder->id);
             $jsonResponse->addAlert('success', 'New board repair order created.');
             $jsonResponse->addBeans(getBoards());
        } else {
             $jsonResponse->addAlert('error', 'Failed to create board repair order.');
        }
    }
    $app->response->setBody($jsonResponse->asJson());
});

// confirmed total loss
$app->post('/confirmedTotalLoss', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

        $repairOrder->totalLoss = 1;
        $repairOrder->isDone = 1;

        $repairOrder->totalLossConfirmDate = time();
        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// total loss
$app->post('/totalLoss', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

        $repairOrder->totalLoss = 1;

        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// not total loss
$app->post('/notTotalLoss', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);

        $repairOrder->totalLoss = 0;

        if ($data->moveToTeardown) {
                $repairOrder->repairLane = 1;
                $repairOrder->position = getNextItemPosition(2);
                $board->xownLane[2]->ownItems[] = $repairOrder;
        }
        else if ($data->moveToAwaitingParts) {
                $repairOrder->repairLane = 3;
                $repairOrder->position = getNextItemPosition(4);
                $board->xownLane[4]->ownItems[] = $repairOrder;
        }
        else if ($data->moveToBody) {
                $repairOrder->repairLane = 4;
                $repairOrder->position = getNextItemPosition(5);
                $board->xownLane[5]->ownItems[] = $repairOrder;
        }
        else if ($data->moveToSupplement) {
                $repairOrder->repairLane = 2;
                $repairOrder->position = getNextItemPosition(3);
                $board->xownLane[3]->ownItems[] = $repairOrder;
        }

        $repairOrder->notTotalLossDate = time();
        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});


// start the repair process
$app->post('/startProcess', function() use($app, $jsonResponse) {

    date_default_timezone_set('America/New_York');
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $repairOrder = R::load('item', $data->id);
	$settings = R::load('settings', 1);
	$dt = new DateTime();
	$sdate = $dt->format('m/d/Y');
	$days = getHolidays();

        $repairOrder->alreadyStarted = 1;

        if ($data->repairLane == 1) {
                $repairOrder->tearDownStartDate = time(); //$sdate;
                $repairOrder->tearDownDueDate = add_business_days($sdate, $settings->tearDownDays, $days);
        }
        // don't do anything here should never occur
        // if ($data->repairLane == 2) {
                // $repairOrder->supplementEndDate = time();
        // }
        // don't do anything here should never occur
        // if ($data->repairLane == 3) { // awaiting parts done
                // $repairOrder->awaitingPartsStartDate = time();
        // }
        if ($data->repairLane == 4) {
                $repairOrder->bodyStartDate = time();
                $repairOrder->bodyDueDate = add_business_days($sdate, $settings->bodyDays, $days);
        }
        if ($data->repairLane == 5) {
                $repairOrder->refinishStartDate = time();
                $repairOrder->refinishDueDate = add_business_days($sdate, $settings->refinishDays, $days);
        }
        if ($data->repairLane == 6) {
                $repairOrder->trimOutStartDate = time();
                $repairOrder->trimOutDueDate = add_business_days($sdate, $settings->trimOutDays, $days);
        }
        if ($data->repairLane == 7) {
                $repairOrder->serviceStartDate = time();
                $repairOrder->serviceDueDate = add_business_days($sdate, $settings->serviceDays, $days);
        }
        if ($data->repairLane == 8) {
                $repairOrder->cleanupStartDate = time();
                $repairOrder->cleanupDueDate = add_business_days($sdate, 1, $days);
        }

        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// end the repair process
$app->post('/endProcess', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {

        $board = R::load('board', 1);
        $repairOrder = R::load('item', $data->id);

        $repairOrder->alreadyStarted = 0;

        if ($data->repairLane == 1) {  // tear down to body
                $repairOrder->tearDownEndDate = time();
                $repairOrder->repairLane = 4;
                $repairOrder->status = "Awaiting Tech";
                $repairOrder->position = getNextItemPosition(5);
                $board->xownLane[5]->ownItems[] = $repairOrder;
        }
        // don't do anything here should never occur
        // if ($data->repairLane == 2) {
                // $repairOrder->supplementEndDate = time();
                // $repairOrder->repairLane = 3;
                // $repairOrder->position = getNextItemPosition(4);
                // $board->xownLane[4]->ownItems[] = $repairOrder;
        // }
        // don't do anything here should never occur
        // if ($data->repairLane == 3) { // awaiting parts done
                // $repairOrder->awaitingPartsEndDate = time();
                // $repairOrder->repairLane = 4;
                // $repairOrder->position = getNextItemPosition(5);
                // $board->xownLane[5]->ownItems[] = $repairOrder;
        // }
        if ($data->repairLane == 4) {
                $repairOrder->bodyEndDate = time();
                $repairOrder->repairLane = 5;
                $repairOrder->status = "Awaiting Tech";
                $repairOrder->position = getNextItemPosition(6);
                $board->xownLane[6]->ownItems[] = $repairOrder;
        }
        if ($data->repairLane == 5) {
                $repairOrder->refinishEndDate = time();
                $repairOrder->repairLane = 6;
                $repairOrder->status = "Awaiting Tech";
                $repairOrder->position = getNextItemPosition(7);
                $board->xownLane[7]->ownItems[] = $repairOrder;
        }
        if ($data->repairLane == 6) {
                $repairOrder->trimOutEndDate = time();
                $repairOrder->repairLane = 7;
                $repairOrder->status = "Awaiting Tech";
                $repairOrder->position = getNextItemPosition(8);
                $board->xownLane[8]->ownItems[] = $repairOrder;
        }
        if ($data->repairLane == 7) {
                $repairOrder->serviceEndDate = time();
                $repairOrder->repairLane = 8;
                $repairOrder->status = "Awaiting Cleanup";
                $repairOrder->position = getNextItemPosition(9);
                $board->xownLane[9]->ownItems[] = $repairOrder;
        }
        if ($data->repairLane == 8) {
                $repairOrder->cleanupEndDate = time();
                $repairOrder->status = "Needs QC";
        }

        R::store($board);
        R::store($repairOrder);
    }
    $app->response->setBody($jsonResponse->asJson());
});

