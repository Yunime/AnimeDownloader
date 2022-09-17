module.exports = {
    isnullorempty: function(data) {
        if (data == undefined || data == "" || data == null)
        return true
    else
        return false
    },
};