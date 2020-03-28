import ByteReader from '../ByteReader'
import Result  from '../../fp/Result'

const empty = new Uint8Array([])
const sample = new Uint8Array([0, 1, 2, 3, 4, 5])

describe('ByteReader', () => {
  describe('read', () => {
    it('reads when empty', () => {
      const reader = new ByteReader(empty)
      const result = reader.read(100)
      expect(result.isOk()).toEqual(true)
      expect(result.unwrap()).toMatchObject({ size: 0 })
    })

    it('performs consecutive reads', () => {
      const reader = new ByteReader(sample)
      let result = reader.read(3)
      expect(result.unwrap()).toEqual({ size: 3, bytes: [ 0, 1, 2 ]})
      result = reader.read(3)
      expect(result.unwrap()).toEqual({ size: 3, bytes: [ 3, 4, 5 ]})
      result = reader.read(3)
      expect(result.unwrap()).toEqual({ size: 0, bytes: [] })
    })

    it('only reads up to the end', () => {
      const reader = new ByteReader(sample)
      let result = reader.read(100)
      expect(result.unwrap()).toEqual({ size: 6, bytes: [0,1,2,3,4,5] })
      result = reader.read(100)
      expect(result.unwrap()).toEqual({ size: 0, bytes: [] })
    })
  })

  describe('readExact', () => {
    it('errors when there are insufficient bytes', () => {
      const reader = new ByteReader(sample)
      let result = reader.readExact(100)
      expect(result.isErr()).toEqual(true)
    })

    it('performs consecutive reads', () => {
      const reader = new ByteReader(sample)
      let result = reader.readExact(3)
      expect(result.unwrap()).toEqual([0, 1, 2])

      result = reader.readExact(3)
      expect(result.unwrap()).toEqual([3, 4, 5])

      result = reader.readExact(3)
      expect(result.isErr()).toEqual(true)
    })

    // TODO: This should really be using Kleisli composition
    it('propagates errors through map', () => {
      const reader = new ByteReader(sample)
      let result = reader.readExact(3)
        .bind(value => {
          expect(value).toEqual([0, 1, 2])
          return reader.readExact(100)
        })
        .bind(value => {
          expect(value.isErr()).toEqual(true)
          return reader.readExact(3)
        })
      expect(result.isErr()).toEqual(true)
    })
  })
})