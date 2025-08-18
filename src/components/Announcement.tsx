import atoms from "@/utils/atoms"
import { useAtom } from "jotai"
import { X } from "lucide-react"

export const Announcement = ({}) => {
  const [announcement, setAnnouncement] = useAtom(atoms.announcement)

  if (announcement)
    return <div onClick={() => setAnnouncement(null)} className="toast toast-top toast-end z-10 cursor-pointer">
      <div className="alert alert-warning">
        <p>{announcement}</p>
        <X size={16} />
      </div>
    </div>

  return null
}
