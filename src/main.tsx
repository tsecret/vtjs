import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router";
import { AptabaseProvider } from '@aptabase/react';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AptabaseProvider appKey={import.meta.env.VITE_APTABASE_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AptabaseProvider>
  </React.StrictMode>,
);
