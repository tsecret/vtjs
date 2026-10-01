import { AptabaseProvider } from "@aptabase/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider attribute="class" defaultTheme="system">
			<AptabaseProvider appKey={import.meta.env.VITE_APTABASE_KEY}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</AptabaseProvider>
		</ThemeProvider>
	</React.StrictMode>,
);
