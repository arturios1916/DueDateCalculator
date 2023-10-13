import { CONFIG } from "./config";
import { ActionWithHours, MathAction, OtherAction } from "./enums/actions";
import { DueDateCalculatorConfig } from "./types/config";
import { Hours } from "./types/hours";
import { Utils } from "./utils";

export class DueDateCalculator {
	private readonly CONFIG: DueDateCalculatorConfig;
	private utcWorkingHoursRange: Array<Hours>;
	private localUtcOffset: number;

	constructor(private config?: DueDateCalculatorConfig) {
		this.CONFIG = this.config ?? CONFIG;
		if (!this.CONFIG) throw new Error("NO CONFIG PROVIDED");
		this.init();
	}

	public calculate(submitDate: Date | string | any, processingTime: number): Date {
		if (!(submitDate instanceof Date)) {
			switch (typeof submitDate) {
				case 'number':
					submitDate = new Date(submitDate);
					break;
				case 'string':
					if (isNaN(Date.parse(submitDate))) throw new Error('INCORRECT DATE');
					submitDate = new Date(Date.parse(submitDate));
					break;
				default:
					throw new Error('INCORRECT DATE');
			}
			if (isNaN(submitDate.getTime())) throw new Error("INCORRECT DATE");
		}

		if (!this.isWorkingTime(submitDate, this.utcWorkingHoursRange))
			throw new Error("NOT WORKING TIME");

		return this.doCalculations(
			submitDate,
			processingTime,
			this.utcWorkingHoursRange,
		);
	}

	private init(): void {
		this.localUtcOffset = new Date().getTimezoneOffset() / 60;
		const action: ActionWithHours = this.defineOffsetAction(
			this.localUtcOffset,
		);
		this.utcWorkingHoursRange =
			action === OtherAction.DO_NOTHING
				? this.defineWorkingHoursRange(
					CONFIG.WORKING_HOURS_FROM,
					CONFIG.WORKING_HOURS_TO,
				)
				: this.defineWorkingHoursRange(
					Utils.shiftHour(
						CONFIG.WORKING_HOURS_FROM,
						Math.abs(this.localUtcOffset),
						action,
					),
					Utils.shiftHour(
						CONFIG.WORKING_HOURS_TO,
						Math.abs(this.localUtcOffset),
						action,
					),
				);
	}

	private doCalculations(
		submitDate: Date,
		processingTime: number,
		workingHoursRange: Array<Hours>,
	): Date {
		const workingTimePerDay = workingHoursRange.length * Utils.hour;
		const shiftBeforeFirstWorkhour = (workingHoursRange[0] - 1) * Utils.hour;
		const shiftAfterLastWorkhour =
			Utils.day - (shiftBeforeFirstWorkhour + workingTimePerDay);
		const processingTimeInMilisec = processingTime * Utils.hour;

		const firstDayEndOffset =
			new Date(
				new Date(submitDate).setUTCHours(
					workingHoursRange[workingHoursRange.length - 1],
					0,
					0,
					0,
				),
			).getTime() - submitDate.getTime();

		if (firstDayEndOffset >= processingTimeInMilisec) {
			return new Date(submitDate.getTime() + processingTimeInMilisec);
		}

		let workingTimeElapsed = firstDayEndOffset;
		let nonWorkingTimeElapsed = shiftAfterLastWorkhour;

		for (let i = 0; workingTimeElapsed < processingTimeInMilisec; i++) {
			const isTodayWorkday = CONFIG.WORKDAYS.includes(
				new Date(
					submitDate.getTime() + workingTimeElapsed + nonWorkingTimeElapsed,
				).getUTCDay(),
			);

			if (isTodayWorkday) {
				nonWorkingTimeElapsed += shiftBeforeFirstWorkhour;
				const workLeft = processingTimeInMilisec - workingTimeElapsed;
				const willFitInThisDay = workLeft < workingTimePerDay;
				willFitInThisDay
					? (workingTimeElapsed += workLeft)
					: (workingTimeElapsed += workingTimePerDay);
			} else {
				nonWorkingTimeElapsed += Utils.day;
			}

			if (workingTimeElapsed !== processingTimeInMilisec && isTodayWorkday) {
				nonWorkingTimeElapsed += shiftAfterLastWorkhour;
			}
		}
		return new Date(
			submitDate.getTime() + workingTimeElapsed + nonWorkingTimeElapsed,
		);
	}

	private defineWorkingHoursRange(start: number, end: number): Array<Hours> {
		return Utils.arrayRange(start, end - 1, 1);
	}

	private defineOffsetAction(offset: number): ActionWithHours {
		return offset > 0
			? offset === 0
				? OtherAction.DO_NOTHING
				: MathAction.ADDITION
			: MathAction.SUBTRACTION;
	}

	private isWorkingTime(date: Date, workingHoursRange: Array<Hours>): boolean {
		return (
			CONFIG.WORKDAYS.includes(date.getUTCDay()) &&
			workingHoursRange.includes(date.getUTCHours() as Hours)
		);
	}
}
