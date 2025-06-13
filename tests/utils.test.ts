import { expect, it, describe, afterEach, vi, beforeAll } from 'vitest'

import * as utils from '../src/main/utils'

describe('utils', () => {

  beforeAll(() => {
    const spy = vi.spyOn(utils, 'readLockfile')
    spy.mockImplementation(() => 'Riot Client Test:8888:12345:secretpassword:https')
  })

  it('reads lockfile', () => {
    expect(utils.readLockfile()).toEqual('Riot Client Test:8888:12345:secretpassword:https')
  })

  it('reads parses lockfile', () => {
    expect(utils.parseLockFile(utils.readLockfile())).toStrictEqual([8888, 12345, 'cmlvdDpzZWNyZXRwYXNzd29yZA=='])
  })
})
