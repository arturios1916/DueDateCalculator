import test from "ava";

import { Days } from "./enums/days.enum";
import { DueDateCalculatorConfig } from "./types/config";

import { DueDateCalculator } from "./index";


const submitDates: Array<any> = [
	"2023-10-10T12:02:23.025+02:00",
	1696932143025,
	new Date("2023-10-10T12:02:23.025+02:00"),
];
const incorrectSubmitDates: Array<any> = [
	"2222-22-33T12:66:93.000Z",
	{},
	new Error(),
	"someFannyString",
];
const nonWorkingDates: Array<any> = ["2023-10-14T12:02:23.025+02:00"];

const expectedTimeMap: Map<number, number> = new Map<number, number>();

const expectedTime2HoursWork = 1696939343025;
const expectedTime8HoursWork = 1697018543025;
const expectedTime48HoursWork = 1697623343025;

const config: DueDateCalculatorConfig = {
	WORKDAYS: [Days.MONDAY, Days.WEDNESDAY, Days.FRIDAY],
	WORKING_HOURS_FROM: 10,
	WORKING_HOURS_TO: 19,
};

test.before(() => {
	expectedTimeMap.set(2, expectedTime2HoursWork);
	expectedTimeMap.set(8, expectedTime8HoursWork);
	expectedTimeMap.set(48, expectedTime48HoursWork);
});

test("should create instance of DueDateCalculator", (t) => {
	const calculator = new DueDateCalculator();
	t.assert(calculator instanceof DueDateCalculator);
});

test("should accept any type of correct time", (t) => {
	t.plan(submitDates.length);
	const calc = new DueDateCalculator();

	for (let i = 0; i < submitDates.length; i++) {
		const res = calc.calculate(submitDates[i], 2);
		if (res) {
			t.assert(true);
		} else {
			t.fail();
		}
	}
});

test("should not accept incorrect date types", (t) => {
	t.plan(incorrectSubmitDates.length * 2);
	const calc = new DueDateCalculator();

	for (let i = 0; i < incorrectSubmitDates.length; i++) {
		const error = t.throws(
			() => {
				calc.calculate(incorrectSubmitDates[i], 2);
			},
			{ instanceOf: Error },
		);
		t.is(error.message, "INCORRECT DATE");
	}
});

test("should throw error if it is not working time", (t) => {
	t.plan(nonWorkingDates.length * 2);
	const calc = new DueDateCalculator();
	for (let i = 0; i < nonWorkingDates.length; i++) {
		const error = t.throws(
			() => {
				calc.calculate(nonWorkingDates[i], 2);
			},
			{ instanceOf: Error },
		);
		t.is(error.message, "NOT WORKING TIME");
	}
});

test("should use passed config", (t) => {
	t.plan(nonWorkingDates.length * 2);
	const calc = new DueDateCalculator(config);
	for (let i = 0; i < nonWorkingDates.length; i++) {
		const error = t.throws(
			() => {
				calc.calculate(nonWorkingDates[i], 2);
			},
			{ instanceOf: Error },
		);
		t.is(error.message, "NOT WORKING TIME");
	}
});

test("should correctly calculate date", (t) => {
	t.plan(expectedTimeMap.size);
	const calc = new DueDateCalculator();
	for (const [hours, expectedDate] of expectedTimeMap.entries()) {
		const res = calc.calculate(submitDates[0], hours);
		t.is(res.getTime(), expectedDate);
	}
});
