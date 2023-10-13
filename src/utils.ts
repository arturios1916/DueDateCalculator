import { MathAction } from './enums/actions';
import { Hours } from './types/hours';

export class Utils {
	public static second = 1000;
	public static minute = this.second * 60;
	public static hour = this.minute * 60;
	public static day = this.hour * 24;
	static arrayRange = (start, stop, step) =>
		Array.from(
			{ length: (stop - start) / step + 1 },
			(_value, index) => start + index * step,
		);

	static shiftHour = (val: Hours, delta: number, action: MathAction) => {
		return new Date(
			new Date().setHours(
				action === MathAction.ADDITION ? val + delta : val - delta,
			),
		).getHours();
	};
}
