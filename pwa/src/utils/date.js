import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'

dayjs.extend(isToday)
dayjs.locale(
  'pt-br',
  {
    monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  },
  true,
)
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
