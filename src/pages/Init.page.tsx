import { useNavigate } from "react-router";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export const InitPage = ({ status, error }: { status: string; error: string | null }) => {
	const navigate = useNavigate();

	return (
		<div className="h-screen w-screen flex flex-col items-center bg-primary/15 relative justify-evenly">
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-black"></div>

			<section className="text-center space-y-4">
				<p className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
					VTJS
				</p>

				{error ? (
					<Alert variant="destructive">{error}</Alert>
				) : (
					<p className="text-xl flex items-center justify-center gap-4">
						<Spinner className="size-6" />
						{status || "Loading"}
					</p>
				)}

				<Button variant="default" size="sm" onClick={() => navigate(0)}>
					Reload
				</Button>
			</section>

		</div>
	);
};
