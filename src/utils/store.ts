import type { StorefrontResponse } from "@/api/schemas/riot";
import { GAME_IDS } from "./constants";

const getStoreItemInfo = (
	offers:
		| StorefrontResponse["AccessoryStore"]["AccessoryStoreOffers"]
		| StorefrontResponse["SkinsPanelLayout"]["SingleItemStoreOffers"]
		| StorefrontResponse["BonusStore"]["BonusStoreOffers"],
): {
	uuid: string;
	price: number;
	type: "weaponskin" | "spray" | "playercard" | "buddy";
}[] => {
	if (!offers) return [];

	return offers.map((offer) => {
		const rawOffer = "Offer" in offer ? offer.Offer : offer;

		return {
			uuid: rawOffer.Rewards[0].ItemID,
			price: Object.values(rawOffer.Cost)[0],
			type:
				rawOffer.Rewards[0].ItemTypeID === GAME_IDS.WEAPON_SKIN_TYPE_ID
					? "weaponskin"
					: rawOffer.Rewards[0].ItemTypeID === GAME_IDS.SPRAY_TYPE_ID
						? "spray"
						: rawOffer.Rewards[0].ItemTypeID === GAME_IDS.PLAYERCARD_TYPE_ID
							? "playercard"
							: "buddy",
		};
	});
};

export { getStoreItemInfo };
