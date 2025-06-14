import { expect, it, describe, afterEach, vi, beforeAll } from 'vitest'
import { LocalAPI } from '../src/api/local'
import { Config } from '../src/interface'
import * as utils from '../src/main/utils'

describe('api', () => {

  let localapi: LocalAPI

  beforeAll(() => {
    global.navigator = { platform: "MAC" } as any

    const [_, port, password] = utils.parseLockFile(utils.readLockfile())
    localapi = new LocalAPI({ hostname: 'https://192.168.31.197', port, lockfilePassword: password } as Config)
  })

  describe('local api', () => {
    it('getPlayerAccount', async () => {
      const res = await localapi.getPlayerAccount()
      console.log('res', res)
    })
  })
})
