import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import atoms from "../utils/atoms"
import { useAptabase } from "@aptabase/react"
import { getStoreItemInfo } from "@/utils"
import Countdown from 'react-countdown';

export const StorePage = () => {
  const [storeapi] = useAtom(atoms.storeapi)
  const [puuid] = useAtom(atoms.puuid)
  const [allowAnalytics] = useAtom(atoms.allowAnalytics)

  const [skins, setSkins] = useState<{ price: number, name: string, url: string, uuid: string }[]>()
  const [, setBundles] = useState<{ price: number, name: string, url: string, uuid: string }[]>()
  const [accessories, setAccessories] = useState<{ price: number, name: string, url: string, uuid: string, urlFull: string, urlWide: string, urlTall: string }[]>()

  const [skinsResetTime, setSkinsResetTime] = useState<number>()
  const [accessoriesResetTime, setAccessoriesResetTime] = useState<number>()


  const { trackEvent } = useAptabase();

  useEffect(() => {
    if (!storeapi) return

    const init = async () => {
      const storeInfo = await storeapi.getStore(puuid!)

      // Bundle
      const bundleInfo = await Promise.all(storeInfo.FeaturedBundle.Bundles.map(bundle => storeapi.getBundleById(bundle.DataAssetID)))


      // Skins
      const skins = getStoreItemInfo(storeInfo.SkinsPanelLayout.SingleItemStoreOffers)
      const skinsData = await Promise.all(skins.map(skin => storeapi.getSkinByLevelId(skin.uuid)))



      // Accessories
      const accessories = getStoreItemInfo(storeInfo.AccessoryStore.AccessoryStoreOffers)
      const accessoriesData = await Promise.all(
        accessories.map(item =>
          item.type === 'spray' ? storeapi.getSprayById(item.uuid) :
          item.type === 'buddy' ? storeapi.getBuddieById(item.uuid) :
          item.type === 'playercard' ? storeapi.getPlayerCardById(item.uuid) :
          null
        )
      )

      setBundles(bundleInfo.filter(bundle => bundle).map(bundle => ({
        name: bundle.data.displayName,
        url: bundle.data.displayIcon,
        uuid: bundle.data.uuid,
        price: Object.values(storeInfo.FeaturedBundle.Bundles.find(_bundle => _bundle.DataAssetID === bundle.data.uuid)!.TotalDiscountedCost as any)[0] as number
      })))
      setAccessories(
        accessoriesData
          .filter(item => item != null)
          .map(item => ({
            ...item.data,
            ...accessories.find(_item => _item.uuid === item.data.uuid)!
          }))
          .map(item => ({
            name: item.displayName,
            price: item.price,
            uuid: item.uuid,
            url: item.displayIcon,
            urlWide: item.wideArt,
            urlTall: item.largeArt,
            urlFull: item.fullTransparentIcon
          }))
      )
      setSkins(
        skins
          .map(skin => ({
            ...skin,
            ...skinsData.find(_skin => _skin.data.uuid === skin.uuid)!.data
          }))
          .map(skin => ({
            uuid: skin.uuid,
            price: skin.price,
            url: skin.displayIcon,
            name: skin.displayName
          }))
      )
      setSkinsResetTime(+new Date() + storeInfo.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds * 1000)
      setAccessoriesResetTime(+new Date() + storeInfo.AccessoryStore.AccessoryStoreRemainingDurationInSeconds * 1000)

      if (allowAnalytics)
        trackEvent('store_open')
    }

    init()
  }, [])

  return <div className="flex flex-col p-8 space-y-4 max-w-6xl m-auto">

    <p className="alert alert-warning w-full">Bundles are corrently not shown</p>

    {/* <section id="bundles" className="w-1/2 max-w-2xl rounded-md">
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
    </section> */}

    {/* Store */}
    <section id="skins" className="w-full">
      <div className="flex flex-row items-center justify-between">
        <h2>Weapon Skins</h2>
        { skinsResetTime && <p>Resets in <Countdown date={skinsResetTime} /></p> }
      </div>
      <div className="flex flex-row items-center justify-center space-x-4 m-auto px-8 my-8">
        {skins?.map(skin => <div key={skin.uuid} className="flex flex-1 flex-col border-2 border-primary rounded-md p-4 h-48 max-w-64 justify-between">
          <img className="max-h-24 object-contain" src={skin.url} draggable={false} />
          <div>
            <p className="font-bold">{skin.name}</p>
            <p className="text-sm">{skin.price}</p>
          </div>
        </div>)}
      </div>
    </section>

    {/* Accessories */}
    <section id="skins" className="w-full">
      <div className="flex flex-row items-center justify-between">
        <h2>Accessories</h2>
        { accessoriesResetTime && <p>Resets in <Countdown date={accessoriesResetTime} /></p> }
      </div>
      <div className="flex flex-row items-center justify-center space-x-4 m-auto px-8 my-8">
        {accessories?.map(skin => <div key={skin.uuid} className="flex flex-1 flex-col border-2 border-primary rounded-md p-4 min-h-48 max-w-64 justify-between tooltip">
            <div className="tooltip-content">
              {
                skin.urlFull ? <img className="max-h-96 object-contain" src={skin.urlFull} draggable={false} /> : null
              }
            </div>

            <img className="size-24 object-contain m-auto rounded-md" src={skin.url} draggable={false} />

            <div>
              <p className="font-bold">{skin.name}</p>
              <p className="text-sm">{skin.price}</p>
            </div>
        </div>)}
      </div>
    </section>

  </div>
}
