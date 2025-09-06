import atoms from "@/utils/atoms"
import { useAtom } from "jotai"
import { Clock, X } from "lucide-react"
import { useEffect } from "react"

export const RateLimitNotification = () => {
  const [rateLimitNotification, setRateLimitNotification] = useAtom(atoms.rateLimitNotification)

  // Auto-hide notification after retry time + buffer
  useEffect(() => {
    if (rateLimitNotification.isActive) {
      const hideTimeout = setTimeout(() => {
        setRateLimitNotification({ isActive: false, retryAfter: 0 })
      }, (rateLimitNotification.retryAfter + 5) * 1000) // Add 5 second buffer

      return () => clearTimeout(hideTimeout)
    }
  }, [rateLimitNotification.isActive, rateLimitNotification.retryAfter, setRateLimitNotification])

  if (!rateLimitNotification.isActive) return null

  return (
    <div className="toast toast-end z-20">
      <div className="alert alert-warning max-w-sm text-xs">
        <Clock size={20} />
        <div className="flex flex-col">
          <span className="font-semibold">Rate Limit Hit</span>
          <span>
            API requests are being throttled. Process will continue automatically in {rateLimitNotification.retryAfter} seconds.
          </span>
        </div>
        <button
          className="btn btn-sm btn-ghost btn-circle"
          onClick={() => setRateLimitNotification({ isActive: false, retryAfter: 0 })}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
