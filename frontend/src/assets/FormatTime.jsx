const convertToIST = (utcDateStr) => {
        const utcDate = new Date(utcDateStr);
        const istTimeInMillis = utcDate.getTime() 
        const istDate = new Date(istTimeInMillis);
        const year = istDate.getFullYear();
        const month = ('0' + (istDate.getMonth() + 1)).slice(-2);
        const day = ('0' + istDate.getDate()).slice(-2);
        const hours = ('0' + istDate.getHours()).slice(-2);
        const minutes = ('0' + istDate.getMinutes()).slice(-2);
        const istDateStr = ` ${hours}:${minutes} || ${day}-${month}-${year} `;
        return istDateStr;
    
  
}

export default convertToIST
