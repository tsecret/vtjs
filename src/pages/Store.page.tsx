import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import atoms from "../utils/atoms"
import { useAptabase } from "@aptabase/react"

export const StorePage = () => {
  const [storeapi] = useAtom(atoms.storeapi)
  const [puuid] = useAtom(atoms.puuid)
  const [allowAnalytics] = useAtom(atoms.allowAnalytics)

  const [skins, setSkins] = useState<{ price: number, name: string, url: string, uuid: string }[]>()
  const [bundles, setBundles] = useState<{ price: number, name: string, url: string, uuid: string }[]>()

  const { trackEvent } = useAptabase();

  useEffect(() => {
    if (!storeapi) return

    const init = async () => {
      const storeInfo = await storeapi.getStore(puuid!)

      // Bundle
      const bundleInfo = await Promise.all(storeInfo.FeaturedBundle.Bundles.map(bundle => storeapi.getBundleById(bundle.DataAssetID)))
      setBundles(bundleInfo.filter(bundle => bundle).map(bundle => ({
        name: bundle.data.displayName,
        url: bundle.data.displayIcon,
        uuid: bundle.data.uuid,
        price: Object.values(storeInfo.FeaturedBundle.Bundles.find(_bundle => _bundle.DataAssetID === bundle.data.uuid)!.TotalDiscountedCost as any)[0] as number
      })))

      // Skins
      const promises = storeInfo?.SkinsPanelLayout.SingleItemOffers.map(uuid => storeapi?.getSkinByLevelId(uuid))
      const skins = await Promise.all(promises)

      setSkins(skins.filter(skin => skin !== undefined).map(skinData => ({
        name: skinData?.data.displayName,
        url: skinData?.data.displayIcon,
        price: Object.values(storeInfo.SkinsPanelLayout.SingleItemStoreOffers.find(item => item.OfferID === skinData?.data.uuid)!.Cost)[0] as number,
        uuid: skinData?.data.uuid
      })))

      if (allowAnalytics)
        trackEvent('store_open')
    }

    init()
  }, [])

  return <div className="flex flex-col items-center">

    <section id="bundles" className="w-1/2 max-w-2xl rounded-md">
      <div className="carousel w-full">
        {bundles?.map((bundle, i) => <div key={bundle.uuid} id={`bundle${i}`} className="carousel-item relative w-full">
          <img className="w-full rounded-md" src={bundle.url} />
          <div className="absolute left-5 bottom-5">
            <p className="font-bold">{bundle.name}</p>
            <p className="text-sm">{bundle.price}</p>
          </div>

          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            { bundles.length > 1 && <a href={`#bundle${i-1}`} className="btn btn-circle">❮</a> }
            { bundles.length > 1 && <a href={`#bundle${i+1}`} className="btn btn-circle">❯</a> }
          </div>
        </div>)}
      </div>
    </section>

    <section id="skins" className="flex flex-row items-center space-x-4 m-auto px-8 my-8">
      {skins?.map(skin => <div key={skin.uuid} className="flex flex-1 flex-col border-2 border-primary rounded-md p-4 h-48 max-w-64 justify-between">
        <img className="max-h-24 object-contain" src={skin.url} draggable={false} />
        <div>
          <p className="font-bold">{skin.name}</p>
          <p className="text-sm">{skin.price}</p>
        </div>
      </div>)}
    </section>

  </div>
}
