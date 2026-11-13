import { useAtom } from "jotai";
import { Clock, X } from "lucide-react";
import { useEffect } from "react";
import atoms from "@/utils/atoms";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const RateLimitNotification = () => {
	const [rateLimitNotification, setRateLimitNotification] = useAtom(atoms.rateLimitNotification);

	// Auto-hide notification after retry time + buffer
	useEffect(() => {
		if (rateLimitNotification.isActive) {
			const hideTimeout = setTimeout(
				() => {
					setRateLimitNotification({ isActive: false, retryAfter: 0 });
				},
				(rateLimitNotification.retryAfter + 5) * 1000,
			); // Add 5 second buffer

			return () => clearTimeout(hideTimeout);
		}
	}, [rateLimitNotification.isActive, rateLimitNotification.retryAfter, setRateLimitNotification]);

	if (!rateLimitNotification.isActive) return null;

	return (
		<div className="fixed bottom-4 right-4 z-20">
			<Alert variant="default" className="max-w-sm text-xs flex items-start gap-2 border-yellow-500/50 bg-yellow-500/10">
				<Clock size={20} className="shrink-0 mt-0.5 text-yellow-500" />
				<div className="flex flex-col">
					<span className="font-semibold">Rate Limit Hit</span>
					<span>
						API requests are being throttled. Process will continue automatically in {rateLimitNotification.retryAfter}{" "}
						seconds.
					</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="shrink-0"
					onClick={() => setRateLimitNotification({ isActive: false, retryAfter: 0 })}
				>
					<X size={16} />
				</Button>
			</Alert>
		</div>
	);
};
