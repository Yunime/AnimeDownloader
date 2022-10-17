var data = {}
var object = require('./object')
var logger = require('./logger.js');

function loadSQLResult(lines, metadata) {
    data.lines = []
    data.metadata = []
    if (object.isNull(lines) || object.isNull(metadata))
        logger.error("Data undefined loaded", "SQLParser.js")
    else {
        data.lines = lines;
        data.metadata = metadata;
    }

}


function getParameterFromLine(lineIndex, parameterName) {

    if (lineIndex >= data.lines.length) {
        logger.error("Out of range", "SQLParser.js")
        return undefined;
    }

    if (object.isNull(parameterName)) {
        logger.error("Parameter null", "SQLParser.js")
        return undefined;
    }

    if (data.lines[lineIndex].length == data.metadata.length) {
        for (let index = 0; index < data.metadata.length; index++) {
            if (data.metadata[index].toLowerCase() == parameterName.trim().toLowerCase()) {
                return data.lines[lineIndex][index];
            }
        }
    }
    else
        console.error("Column metadata and line column have different length")


}


function searchParameter(sqlLine, metadata, parameterName) {

}


exports.loadSQLResult = loadSQLResult;
exports.getParameterFromLine = getParameterFromLine