import test from "ava";

import { MathAction } from "./enums/actions";
import { Utils } from "./utils";

test("should create array with range of numbers", (t) => {
	const expectedArr = Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	const res = Utils.arrayRange(1, 9, 1);
	t.deepEqual(res, expectedArr);
});

test("should shift up hour", (t) => {
	const res = Utils.shiftHour(22, 2, MathAction.ADDITION);
	t.is(res, 0);
});

test("should shift down hour", (t) => {
	const res = Utils.shiftHour(22, 2, MathAction.SUBTRACTION);
	t.is(res, 20);
});
