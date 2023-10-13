export const enum MathAction {
	ADDITION,
	SUBTRACTION,
}

export const enum OtherAction {
	DO_NOTHING = 0,
}

export type ActionWithHours = MathAction | OtherAction;
