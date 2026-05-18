import base64 from "base-64";
import { Buffer } from "buffer";
import pako from "pako";

const base64Decode = (input: string): string => {
	return base64.decode(input);
};

const zdecode = (input: string): any => {
	return JSON.parse(pako.inflateRaw(Buffer.from(input, "base64"), { to: "string" }));
};

const zencode = (input: any): string => {
	return Buffer.from(pako.deflateRaw(Buffer.from(JSON.stringify(input), "utf-8"))).toString("base64");
};

const randomInt = (min: number, max: number): number => {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export { base64Decode, randomInt, zdecode, zencode };
