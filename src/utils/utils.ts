import base64 from "base-64";

const base64Decode = (input: string): string => {
	return base64.decode(input);
};

const randomInt = (min: number, max: number): number => {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export { base64Decode, randomInt };
