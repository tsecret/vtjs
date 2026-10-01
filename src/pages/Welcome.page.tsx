import { useAtom, useSetAtom } from "jotai";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router";
import { useServices } from "@/lib/services";
import atoms from "../utils/atoms";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export const WelcomePage = () => {
	const services = useServices();
	const store = services?.store;
	const setFirstTimeUser = useSetAtom(atoms.firstTimeUser);
	const [allowAnalytics, setAllowAnalytics] = useAtom(atoms.allowAnalytics);

	const navigate = useNavigate();

	async function onStart() {
		setFirstTimeUser(false);
		await store?.set("firstTimeUser", false);
		navigate("/dashboard");
	}

	async function onAnalyticsChange(state: boolean) {
		await store?.set("allowAnalytics", state);
		setAllowAnalytics(state);
	}

	return (
		<div className="p-4 flex flex-col items-center gap-4">
			<div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
				<div className="text-center max-w-md">
					<h1 className="text-5xl font-bold">Welcome to VTJS!</h1>
					<p className="py-6">Thank you for using the app</p>

					<Button className="my-4" onClick={onStart}>
						Get Started
					</Button>

					<div id="analytics-prompt" className="my-10">
						<Alert>
							<span>
								<span className="text-primary font-bold">Enable analytics?</span> This helps us improve the app and
								provide better experience
							</span>
							{allowAnalytics ? (
								<Button variant="secondary" size="sm" className="gap-2">
									<Heart size={16} /> Enabled
								</Button>
							) : (
								<Button variant="default" size="sm" onClick={() => onAnalyticsChange(true)}>
									Enable
								</Button>
							)}
						</Alert>
					</div>
				</div>
			</div>
		</div>
	);
};
