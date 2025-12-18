module.exports.exportToJSON = (bmiData) => {
    return JSON.stringify({
        bmi: bmiData.bmi,
        category: bmiData.category,
        timestamp: new Date().toISOString(),
        additionalInfo: {
            fatIndex: bmiData.fatIndex,
            muscleIndex: bmiData.muscleIndex
        }
    });
};

module.exports.importFromJSON = (jsonString) => {
    return JSON.parse(jsonString);
};