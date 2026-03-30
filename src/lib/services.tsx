import Database from "@tauri-apps/plugin-sql";
import { Store } from "@tauri-apps/plugin-store";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { LocalAPI, SharedAPI } from "@/api";
import { StoreAPI } from "@/api/store";

export type AppServices = {
	cache: Database;
	localapi: LocalAPI;
	sharedapi: SharedAPI;
	storeapi: StoreAPI;
	store: Store;
};

const ServicesContext = createContext<AppServices | null>(null);

export const ServicesProvider = ({ value, children }: { value: AppServices | null; children: ReactNode }) => {
	return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
};

export const useServices = () => useContext(ServicesContext);
