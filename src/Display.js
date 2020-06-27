import React from 'react'
import { v4 as uuid } from 'uuid'
import { last, isNumeric } from './utilities'

const ClosingParenthese = () => (
  <span style={{ color: 'rgb(204, 204, 204)' }}>)</span>
)

const addSpaces = (expression, index) => {
  const value = expression[index]

  if (/^[+\-×÷]$/.test(value)) return ` ${value} `

  if (
    expression[index - 1] !== '(' &&
    (value === 'sin' ||
      value === 'cos' ||
      value === 'tan' ||
      value === 'arcsin' ||
      value === 'arccos' ||
      value === 'arctan' ||
      //value === '√' ||
      value === 'ln' ||
      value === 'log')
  )
    return ` ${value}`

  return value
}

const addClosingParentheses = (arr) => {
  let arrayClosingParentheses = []
  let newArray = []

  for (const value of arr) {
    if (value === '(') {
      arrayClosingParentheses.push(<ClosingParenthese key={uuid()} />)
    }

    if (value === ')') arrayClosingParentheses.pop()

    newArray.push(value)
  }

  return newArray.concat(arrayClosingParentheses)
}

const convertFractionalExponent = (arr) => {
  const operators = ['+', '-', '×', '÷']

  let newArr = []
  let base = []

  for (let index = 0; index < arr.length; index++) {
    if (arr[index] === 'fracExp') {
      while (newArr.length) {
        if (last(newArr) === ')') {
          while (!base.length || base[0] !== '(') {
            base.unshift(newArr.pop())
          }
          break
        }

        if (operators.includes(last(newArr))) break

        base.push(newArr.pop())
      }

      let exponentEnd
      let openedParentheses = 0

      for (
        let indexExponent = index;
        indexExponent < arr.length;
        indexExponent++
      ) {
        if (arr[index + 1] === '(') {
          if (arr[indexExponent + 1] === '(') openedParentheses += 1

          if (arr[indexExponent + 1] === ')') openedParentheses -= 1

          if (openedParentheses === 0) {
            exponentEnd = indexExponent + 2
            break
          }
        }

        if (isNumeric(arr[index + 1])) {
          if (
            !isNumeric(arr[indexExponent + 1]) &&
            arr[indexExponent + 1] !== '!' &&
            arr[indexExponent + 1] !== '%' &&
            arr[indexExponent + 1] !== 'E' &&
            arr[indexExponent + 1] !== '^'
          ) {
            exponentEnd = indexExponent + 1
            break
          }
        }
      }

      let exponent = arr.slice(index + 1, exponentEnd)

      if (!exponent.length)
        exponent.push(
          <span key={uuid()} style={{ color: 'rgb(204, 204, 204)' }}>
            □
          </span>
        )

      index += exponent.length

      const recurseExponent = (
        <sup key={uuid()}>{convertFractionalExponent(exponent)}</sup>
      )

      newArr = [...newArr, recurseExponent, '√', ...base]

      base = []
    } else {
      newArr.push(arr[index])
    }
  }

  return newArr
}

const nestSuperscript = (expression) => {
  let superscriptNestedArray = []

  for (let index = 0; index < expression.length; index++) {
    if (expression[index] === '^') {
      const slicedExp = expression.slice(index)

      let superscriptEnd

      if (slicedExp[1] === '(') {
        let openedParentheses = 0

        for (const [indexParenthese, value] of slicedExp.entries()) {
          if (value === '(') openedParentheses += 1

          if (value.type === ClosingParenthese || value === ')') {
            openedParentheses -= 1

            if (openedParentheses === 0) {
              superscriptEnd = indexParenthese + 1
              break
            }
          }
        }
      } else {
        superscriptEnd = slicedExp.findIndex((element) => {
          return (
            !isNumeric(element) &&
            element !== '!' &&
            element !== '%' &&
            element !== 'E' &&
            element !== '^'
          )
        })
      }

      if (superscriptEnd === -1) superscriptEnd = slicedExp.length

      let superscriptSubExpression = slicedExp.slice(0, superscriptEnd)

      if (superscriptSubExpression.length === 1) {
        superscriptSubExpression[0] = (
          <span key={uuid()} style={{ color: 'rgb(204, 204, 204)' }}>
            □
          </span>
        )
      } else {
        superscriptSubExpression[0] = (
          <span key={uuid()} style={{ fontSize: '0px' }}>
            □
          </span>
        )
      }

      index += superscriptSubExpression.length - 1

      superscriptNestedArray.push(
        <sup key={uuid()}>{nestSuperscript(superscriptSubExpression)}</sup>
      )

      continue
    }

    superscriptNestedArray.push(addSpaces(expression, index))
  }

  return superscriptNestedArray
}

const Display = ({ expression }) => {
  console.log(convertFractionalExponent(addClosingParentheses(expression)))
  return nestSuperscript(
    convertFractionalExponent(addClosingParentheses(expression))
  )
}

export default Display
