import { useEffect } from "react";
import { useServices } from "@/lib/services";

export const TestPage = () => {
	const services = useServices();
	const cache = services?.cache;

	useEffect(() => {
		(async () => {
			console.log("Loading requests");
			const requests = await cache?.select("SELECT endpoint, ttl from requests", [Date.now()]);
			console.log("requests", requests);
		})();
	}, [cache]);

	return <div className="p-4"></div>;
};
