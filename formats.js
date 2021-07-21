const formats = {}

formats.price = (value) => {
    let val = (value/1).toFixed(2).replace('.', ',')
    return '$ '+val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

formats.dates = (value) => {
    let dateFormat = new Date(value)
    return dateFormat.getDate()+"-"+(dateFormat.getMonth() + 1)+"-"+dateFormat.getFullYear()
}

formats.datesEdit = (value) => {
    let dateFormat = new Date(value)
    return (dateFormat.getMonth()+1)+"-"+dateFormat.getDate()+"-"+dateFormat.getFullYear()
}

formats.datesTime = (value) => {
    let dateFormat = new Date(value)
    var format = (dateFormat.getMonth()+1)+"-"+dateFormat.getDate()+"-"+dateFormat.getFullYear()
    var time = new Date(format).getTime()
    return time
}

formats.datesMonth = () => {
    const thisMonth = new Date()
    const prevMonth = new Date()
    prevMonth.setMonth(prevMonth.getMonth() + 1)
    var dates = {
        thisMonth: {
            since: (thisMonth.getMonth()+1)+"-01-"+thisMonth.getFullYear(),
            until: (thisMonth.getMonth()+1)+"-31-"+thisMonth.getFullYear()
        },
        prevMonth: {
            since: (prevMonth.getMonth()+1)+"-01-"+prevMonth.getFullYear(),
            until: (prevMonth.getMonth()+1)+"-31-"+prevMonth.getFullYear()
        } 
    }
    return dates
}

module.exports = formats