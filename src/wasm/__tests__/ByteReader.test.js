import ByteReader from '../ByteReader'

const empty = new Uint8Array([])
const sample = new Uint8Array([0, 1, 2, 3, 4, 5])

describe('ByteReader', () => {
  it('reads when empty', () => {
    const reader = new ByteReader(empty)
    expect(reader.read(100)).toEqual({ size: 0, bytes: [] })
  })

  it('performs consecutive reads', () => {
    const reader = new ByteReader(sample)
    expect(reader.read(3)).toEqual({ size: 3, bytes: [ 0, 1, 2 ]})
    expect(reader.read(3)).toEqual({ size: 3, bytes: [ 3, 4, 5 ]})
    expect(reader.read(3)).toEqual({ size: 0, bytes: [] })
  })

  it('only reads up to the end', () => {
    const reader = new ByteReader(sample)
    expect(reader.read(100)).toEqual({ size: 6, bytes: [0,1,2,3,4,5] })
    expect(reader.read(100)).toEqual({ size: 0, bytes: [] })
  })
})