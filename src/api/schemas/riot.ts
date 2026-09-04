export type SkinResponse = {
	status: number;
	data: {
		uuid: string;
		displayName: string;
		displayIcon: string;
		fullTransparentIcon: string;
		wideArt: string;
		largeArt: string;
	};
};

export type WalletResponse = {
	Balances: {
		[x: string]: number;
	};
};

export type GameSettingsResponse = {
	type: "Ares.PlayerSettings";
	data: string;
};
