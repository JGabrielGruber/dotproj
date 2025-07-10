import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'

dayjs.extend(isToday)

export function formatToRelative(isoString) {
  const date = dayjs(isoString);

  if (date.isToday()) {
    return date.format('HH:mm');
  } else {
    return date.format('DD/MM');
  }
}
