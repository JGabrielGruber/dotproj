import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import ptBr from 'dayjs/locale/pt-br'

dayjs.extend(isToday)
dayjs.locale('pt-br', ptBr)
dayjs.extend(localizedFormat)

export function formatToRelative(isoString) {
  const date = dayjs(isoString)

  if (date.isToday()) {
    return date.format('HH:mm')
  } else {
    return date.format('DD/MM')
  }
}

export default dayjs
