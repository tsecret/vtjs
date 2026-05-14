const sleep = (ms: number = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

import base64 from "base-64";

const base64Decode = (input: string): string => {
	return base64.decode(input);
};

const zdecode = async (input: string): Promise<any> => {
	const { Buffer } = await import("buffer");
	const pako = await import("pako");
	return JSON.parse(pako.inflateRaw(Buffer.from(input, "base64"), { to: "string" }));
};

const zencode = async (input: any): Promise<string> => {
	const { Buffer } = await import("buffer");
	const pako = await import("pako");
	return Buffer.from(pako.deflateRaw(Buffer.from(JSON.stringify(input), "utf-8"))).toString("base64");
};

const randomInt = (min: number, max: number): number => {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export { sleep, base64Decode, zdecode, zencode, randomInt };
