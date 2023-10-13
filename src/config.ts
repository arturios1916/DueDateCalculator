import { Days } from './enums/days.enum';
import { DueDateCalculatorConfig } from './types/config';

export const CONFIG: DueDateCalculatorConfig = {
	WORKDAYS: [
		Days.MONDAY,
		Days.TUESDAY,
		Days.WEDNESDAY,
		Days.THURSDAY,
		Days.FRIDAY,
	],
	WORKING_HOURS_FROM: 9,
	WORKING_HOURS_TO: 17,
};
