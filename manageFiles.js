const fs = require('fs')

module.exports = {
    read: function (file) {
        try {
            const data = fs.readFileSync(file, 'utf8')
            return data;
        } catch (err) {
            console.error(err)
            return "";
        }
    },

    write: function (file, data) {
        try {
            fs.writeFileSync(file, data)
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    },

    append: function (file, data) {
        try {
            fs.appendFileSync(file, data);
        } catch (err) {
            console.error(err)
        }
    }


    
};
