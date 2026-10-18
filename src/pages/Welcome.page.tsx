import { useAtom, useSetAtom } from "jotai";
import { useNavigate } from "react-router";
import { useServices } from "@/lib/services";
import atoms from "../utils/atoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

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

					<div id="analytics-prompt" className="my-10 w-full">
						<Card>
							<CardContent className="flex items-center justify-between gap-4">
								<div>
									<p className="font-bold">Enable analytics?</p>
									<p className="text-sm text-muted-foreground">
										This helps us improve the app and provide better experience
									</p>
								</div>
								<Switch checked={allowAnalytics} onCheckedChange={onAnalyticsChange} />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};
