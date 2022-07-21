import moment from 'moment'

export const dateFormat = (date) => {
    return moment(date).format('MM-DD')
}

export const timeFormat = (time) => {
    return moment(time).format('HH:mm')
}

export const buildDisplayTime = (date, time) => {
    let timestamp

    const waitFormat = moment(date + ' ' + time)

    const diffDay = moment().diff(waitFormat, 'days')
    if (diffDay === 0) {
        timestamp = waitFormat.format('HH:mm')
    } else if (diffDay === 1) {
        timestamp = '昨天 ,   ' + waitFormat.format('HH:mm')
    } else if (diffDay > 1 && diffDay < 365) {
        timestamp = waitFormat.format('MM-DD HH:mm')
    } else {
        timestamp = waitFormat.format('YYYY-MM-DD HH:mm')
    }

    return timestamp
}
