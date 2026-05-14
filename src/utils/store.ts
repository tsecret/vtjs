import type { StorefrontResponse } from "@/interface";

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
				rawOffer.Rewards[0].ItemTypeID === "e7c63390-eda7-46e0-bb7a-a6abdacd2433"
					? "weaponskin"
					: rawOffer.Rewards[0].ItemTypeID === "d5f120f8-ff8c-4aac-92ea-f2b5acbe9475"
						? "spray"
						: rawOffer.Rewards[0].ItemTypeID === "3f296c07-64c3-494c-923b-fe692a4fa1bd"
							? "playercard"
							: "buddy",
		};
	});
};

export { getStoreItemInfo };
