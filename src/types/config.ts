import { Days } from '../enums/days.enum';
import { Hours } from './hours';

export interface DueDateCalculatorConfig {
	WORKDAYS: Array<Days>;
	WORKING_HOURS_FROM: Hours;
	WORKING_HOURS_TO: Hours;
}
