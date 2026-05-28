process.env.NODE_ENV = 'test'

jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'warn').mockImplementation(() => {})

jest.setTimeout(15000)
