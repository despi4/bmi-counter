const express = require('express');
const router = express.Router();

const healthMetrics = require('../utils/healthMetrics');
const dataExport = require('../utils/dataExports');

const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

router.post('/calculate-bmi', (req, res) => {
    try {
        const weight = parseFloat(req.body.weight);
        const height = parseFloat(req.body.height);
        const fatIndex = parseFloat(req.body.fatIndex) || 0;
        const muscleIndex = parseFloat(req.body.muscleIndex) || 0;
        const gender = req.body.gender || 'male';

        if (!weight || !height || weight <= 0 || height <= 0) {
            return res.send(`<div style="color:red;"><h2>Error:</h2>Weight and height must be positive numbers<br><a href="/">Go Back</a></div>`);
        }

        if (height > 300) {
            return res.send('Height seems unrealistic. Please check your input.');
        }

        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);

        let category, color, recommendations;
        const recommendationsData = {
            underweight: [
                'Increase calorie intake by 300-500 calories per day',
                'Consume protein-rich foods',
                'Add healthy fats',
                'Strength training to build muscle',
                'Eat smaller, more frequent meals'
            ],
            normal: [
                'Maintain current balanced diet',
                'Exercise 3-5 times per week',
                'Drink at least 2 liters of water daily',
                'Get 7-9 hours of sleep',
                'Regular health check-ups'
            ],
            overweight: [
                'Reduce daily calorie intake by 500 calories',
                'Increase physical activity',
                'Limit processed foods and sugary drinks',
                'Increase fiber intake',
                'Track your food intake'
            ],
            obese: [
                'Consult with healthcare professional',
                'Consider medical weight loss program',
                'Join support group',
                'Start with low-impact exercises',
                'Focus on sustainable lifestyle changes'
            ]
        };

        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#3498db';
            recommendations = recommendationsData.underweight;
        } else if (bmi < 24.9) {
            category = 'Normal Weight';
            color = '#2ecc71';
            recommendations = recommendationsData.normal;
        } else if (bmi < 29.9) {
            category = 'Overweight';
            color = '#f39c12';
            recommendations = recommendationsData.overweight;
        } else {
            category = 'Obese';
            color = '#e74c3c';
            recommendations = recommendationsData.obese;
        }

        let additionalAdvice = [];
        if (fatIndex > 30) additionalAdvice.push('High fat index detected - consider reducing body fat percentage');
        if (muscleIndex < 40) additionalAdvice.push('Low muscle index - include strength training');
        if (fatIndex < 15 && muscleIndex > 45) additionalAdvice.push('Excellent body composition! Maintain your routine');

        const idealWeight = healthMetrics.calculateIdealWeight(height, gender);

        const jsonExport = dataExport.exportToJSON({
            bmi: bmi.toFixed(2),
            category,
            fatIndex,
            muscleIndex,
            idealWeight: idealWeight.toFixed(1),
        });

        const resultHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>BMI Results</title>
            <style>
                body { font-family: Arial; background: #f4f4f4; padding: 20px; }
                .container { max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px; }
                .bmi { font-size:48px; font-weight:bold; color:${color}; }
                .recommendation { background:#f8f8f8; padding:10px; margin:5px 0; border-left:4px solid ${color}; }
                .back { display:inline-block; margin-top:20px; padding:10px 20px; background:${color}; color:white; text-decoration:none; border-radius:5px; }
                textarea { width:100%; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>BMI Calculation Results</h1>
                <div class="bmi">${bmi.toFixed(1)}</div>
                <h2>${escapeHtml(category)}</h2>

                ${additionalAdvice.length > 0 ? `<div style="background:#fff3cd;padding:10px;border-radius:5px;"><ul>${additionalAdvice.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul></div>` : ''}

                <h3>Recommendations:</h3>
                ${recommendations.map(r => `<div class="recommendation">✓ ${escapeHtml(r)}</div>`).join('')}

                <h3>Ideal Weight:</h3>
                <p>${idealWeight.toFixed(1)} kg</p>

                <h3>Export JSON:</h3>
                <textarea rows="5">${jsonExport}</textarea>

                <a href="/" class="back">Calculate Again</a>
            </div>
        </body>
        </html>
        `;

        res.send(resultHtml);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error occurred');
    }
});

module.exports = router;
