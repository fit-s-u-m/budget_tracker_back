import Valkey from "iovalkey"
import env from "@/env"

const valkey = new Valkey(env.VALKEY_PORT, env.VALKEY_HOST)

export default valkey
