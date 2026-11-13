import { AptabaseProvider } from "@aptabase/react";
import { ThemeProvider } from "next-themes";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider attribute="class" defaultTheme="dark">
			<AptabaseProvider appKey={import.meta.env.VITE_APTABASE_KEY}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</AptabaseProvider>
		</ThemeProvider>
	</React.StrictMode>,
);
