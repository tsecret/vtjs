import { beforeAll, beforeEach, describe, it } from 'vitest'
import { LocalAPI, SharedAPI } from  '../src/api'

describe('local', () => {
  let localapi: LocalAPI


  beforeEach(() => {
    localapi = new LocalAPI({ port: "1234", password: "test-password" })
  })

  it('help', async () => {
    const res = await localapi.help()
    console.log('res', res)
  })
})
