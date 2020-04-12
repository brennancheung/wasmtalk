// Eq, Num, Show, Ord

export const types = {
  Num: {
    constraints: {
      'a': 'Num',
    },
    functions: {
      '+': ['a', 'a', 'a'],
    },
  },
  Show: {
    functions: {
      'show': ['a', 'String']
    }
  },
  Eq: {
    functions: {
      functions: {
        '==': ['a', 'a', 'Bool'],
        '!=': ['a', 'a', 'Bool'],
      }
    }
  }
}

export const instances = {
  Float: {
    instances:  {
      Num: {
        functions: {
          '+': {}
        }
      }
    }
  },
  Show: {
    instances: {
      Num: {
        show: {

        }
      }
    }
  }
}
