<?php

class UsHolidays {
	private $year;
	private $list;
	
	const ONE_DAY = 86400; //Number of seconds in one day
	
	
	function __construct($year = null, $timezone = "America/Denver") {
		try {
			$original_time_zone = date_default_timezone_get();
			if(!date_default_timezone_set($timezone)) {
				throw new Exception("$timezone is not a valid timezone.");
			}
			$this->year = (is_null($year)) ? (int) date("Y") : (int) $year;
			if(!is_int($this->year) || $this->year < 1997) {
				throw new Exception("$year is not a valid year. Valid values are integers greater than 1996.");
			}
		
			$this->setList();
		} finally {
			date_default_timezone_set($original_time_zone);
		}
	}
	
	
	private function adjustFixedHoliday($timestamp) {
		$weekday = date("w", $timestamp);
		if($weekday == 0) {
			return $timestamp + self::ONE_DAY; //NOTE: Potential daylight savings issue for holidays that coincide with/are adjacent to daylight savings "transition" dates?
		}
		if($weekday == 6) {
			return $timestamp - self::ONE_DAY; //NOTE: Potential daylight savings issue for holidays that coincide with/are adjacent to daylight savings "transition" dates?
		}
		
		return $timestamp;
	}
	
	
	private function setList() {
		$this->list = array();
		$this->list[$this->adjustFixedHoliday(mktime(0, 0, 0, 1, 1, $this->year))]   = "New Year's Day";              //January 1st (if not Saturday/Sunday)
		$this->list[strtotime("Third Monday of January $this->year")]                = "Martin Luther King, Jr. Day"; //3rd Monday of January
		$this->list[strtotime("Third Monday of February $this->year")]               = "Presidents' Day";             //3rd Monday of February
		$this->list[strtotime("Last Monday of May $this->year")]                     = "Memorial Day";                //Last Monday of May
		$this->list[$this->adjustFixedHoliday(mktime(0, 0, 0, 7, 4, $this->year))]   = "Independence Day";            //July 4 (if not Saturday/Sunday)
		$this->list[strtotime("First Monday of September $this->year")]              = "Labor Day";                   //1st Monday of September
		$this->list[strtotime("Second Monday of October $this->year")]               = "Columbus Day";                //2nd Monday of October
		$this->list[$this->adjustFixedHoliday(mktime(0, 0, 0, 11, 11, $this->year))] = "Veterans Day";                //November 11 (if not Saturday/Sunday)
		$this->list[strtotime("Fourth Thursday of November $this->year")]            = "Thanksgiving Day";            //4th Thursday of November
		$this->list[$this->adjustFixedHoliday(mktime(0, 0, 0, 12, 25, $this->year))] = "Christmas Day";               //December 25 every year (if not Saturday/Sunday)
	}
	
	
	public function getList() {
		return $this->list;
	}
	
	
	public function getListByName() {
		return array_flip($this->list);
	}
	
	
	public function isHoliday($timestamp) {
		return array_key_exists($timestamp, $this->list);
	}
}
