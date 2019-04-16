function getDateTime(timestamp)
{
    let dateTime = new Date(timestamp).toLocaleString();
    const secondsIndex = dateTime.lastIndexOf(':');
    return dateTime.slice(0, -(dateTime.length - secondsIndex)) + dateTime.substring(secondsIndex + 3, dateTime.length);
}

module.exports = {getDateTime}