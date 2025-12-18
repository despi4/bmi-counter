module.exports.calculateIdealWeight = (height, gender) => {
    if (gender === 'male') {
        return 50 + 0.9 * (height - 152);
    } else {
        return 45.5 + 0.9 * (height - 152);
    }
};

module.exports.calculateBMR = (weight, height, age, gender) => {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
};