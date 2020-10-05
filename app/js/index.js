// import * as $ from 'jquery'
import fold from './scripts/fold'
import './scripts/babel'
import '../scss/style.scss'

const firstNumber = fold(5)

console.log(firstNumber(5))
console.log(firstNumber(15))