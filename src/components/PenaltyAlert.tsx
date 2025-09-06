import { Penalties } from "@/interface/utils.interface";
import moment from "moment";
import { Link } from "react-router";

export const PenaltyAlert = ({ penalty }: { penalty: Penalties | undefined }) => {

  const types = {
    'TEXT_CHAT_MUTED': 'text chat mute',
    'VOICE_CHAT_MUTED' : 'voice chat mute',
    'PBE_LOGIN_TIME_BAN': 'queue ban',
  }

  const reasons = {
    'INAPPROPRIATE_TEXT': 'bad text',
    'INAPPROPRIATE_VOICE': 'bad voice',
  }

  const getTypes = () => {
    return penalty?.type.map(r => types[r]).join(', ')
  }

  const getReasons = () => {
    return penalty?.reason.map(r => reasons[r]).join(', ')
  }

  if (!penalty)
    return null

  return <div className="alert alert-warning max-w-xl m-auto">
    <p className="wrap-normal">
      This account has <strong>{getTypes()}</strong> until <strong>{moment(penalty.freeTimestamp).format('HH:MM DD-MM-YY')} ({moment(penalty.freeTimestamp).fromNow()})</strong> because of <strong>{getReasons()}</strong> in <Link className="font-bold" to={`/match/${penalty.matchId}`}>this match</Link></p>
  </div>
}
