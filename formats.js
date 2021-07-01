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

module.exports = formats