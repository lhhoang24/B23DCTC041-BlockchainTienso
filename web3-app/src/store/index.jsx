import { createGlobalState } from 'react-hooks-global-state'
import moment from 'moment'

const { setGlobalState, useGlobalState, getGlobalState } = createGlobalState({
  createModal: 'scale-0',
  connectedAccount: '',
  contract: null,
  proposals: [],
  isStakeholder: false,
  balance: 0,
  mybalance: 0,
})

// Rut gon dia chi vi: 0x1234...abcd
const truncate = (text, startChars, endChars, maxLength) => {
  if (text.length > maxLength) {
    var start = text.substring(0, startChars)
    var end = text.substring(text.length - endChars, text.length)
    while (start.length + end.length < maxLength) {
      start = start + '.'
    }
    return start + end
  }
  return text
}

// Thoi gian con lai den luc het han vote (duration la timestamp tinh bang giay)
const daysRemaining = (days) => {
  const todaysdate = moment()
  days = Number((days + '000').slice(0))
  days = moment(days).format('YYYY-MM-DD')
  days = moment(days)
  days = days.diff(todaysdate, 'days')
  return days == 1 ? '1 day' : days + ' days'
}

export {
  truncate,
  setGlobalState,
  useGlobalState,
  getGlobalState,
  daysRemaining,
}
