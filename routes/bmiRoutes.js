const express = require('express');
const router = express.Router();

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

        if (!weight || !height || weight <= 0 || height <= 0) {
            return res.send(`
                <div style="color: red; padding: 20px;">
                    <h2>Error</h2>
                    <p>Weight and height must be positive numbers</p>
                    <a href="/">Go Back</a>
                </div>
            `);
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
                'Consume protein-rich foods (eggs, chicken, fish, legumes)',
                'Add healthy fats (avocado, nuts, olive oil)',
                'Strength training to build muscle mass',
                'Eat smaller, more frequent meals'
            ],
            normal: [
                'Maintain current balanced diet',
                'Exercise 3-5 times per week (cardio + strength)',
                'Drink at least 2 liters of water daily',
                'Get 7-9 hours of sleep per night',
                'Regular health check-ups'
            ],
            overweight: [
                'Reduce daily calorie intake by 500 calories',
                'Increase physical activity to 60 minutes daily',
                'Limit processed foods and sugary drinks',
                'Increase fiber intake (vegetables, whole grains)',
                'Track your food intake in a diary'
            ],
            obese: [
                'Consult with healthcare professional',
                'Consider medical weight loss program',
                'Join support group or find accountability partner',
                'Start with low-impact exercises (walking, swimming)',
                'Focus on sustainable lifestyle changes, not quick fixes'
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
        
        if (fatIndex > 30) {
            additionalAdvice.push('High fat index detected - consider reducing body fat percentage');
        }
        if (muscleIndex < 40) {
            additionalAdvice.push('Low muscle index - include strength training in your routine');
        }
        if (fatIndex < 15 && muscleIndex > 45) {
            additionalAdvice.push('Excellent body composition! Maintain your current fitness routine');
        }

        const resultHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BMI Results</title>
            <link rel="stylesheet" href="/css/style.css">
            <style>
                .result-container {
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .bmi-value {
                    font-size: 48px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .category-badge {
                    display: inline-block;
                    padding: 10px 20px;
                    border-radius: 20px;
                    color: white;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .recommendation-card {
                    background: #f8f9fa;
                    border-left: 4px solid ${color};
                    padding: 15px;
                    margin: 10px 0;
                }
                .additional-inputs {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 20px 0;
                }
                .input-box {
                    padding: 15px;
                    background: #e8f4fc;
                    border-radius: 5px;
                }
                .back-btn {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: ${color};
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="result-container">
                <h1>BMI Calculation Results</h1>
                
                <div class="bmi-value" style="color: ${color}">
                    ${bmi.toFixed(1)}
                </div>
                
                <div class="category-badge" style="background: ${color}">
                    ${escapeHtml(category)}
                </div>
                
                <div class="additional-inputs">
                    <div class="input-box">
                        <h3>Fatness Index</h3>
                        <p>${escapeHtml(fatIndex)}%</p>
                    </div>
                    <div class="input-box">
                        <h3>Muscle Index</h3>
                        <p>${escapeHtml(muscleIndex)}%</p>
                    </div>
                </div>
                
                ${additionalAdvice.length > 0 ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Additional Analysis</h3>
                    <ul>
                        ${additionalAdvice.map(advice => `<li>${escapeHtml(advice)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <h2>Personalized Recommendations</h2>
                ${recommendations.map(rec => `
                    <div class="recommendation-card">
                        ✓ ${escapeHtml(rec)}
                    </div>
                `).join('')}
                
                <h3>Health Risk Assessment</h3>
                <p>${getRiskAssessment(category, bmi)}</p>
                
                <a href="/" class="back-btn">Calculate Again</a>
            </div>
        </body>
        </html>
        `;

        res.send(resultHtml);

    } catch (error) {
        console.error('Error calculating BMI:', error);
        res.status(500).send('Server error occurred');
    }
});

function getRiskAssessment(category, bmi) {
    const risks = {
        'Underweight': 'Increased risk of osteoporosis, anemia, and weakened immune system',
        'Normal Weight': 'Lowest health risks. Maintain your healthy lifestyle!',
        'Overweight': 'Moderate risk of heart disease, high blood pressure, and type 2 diabetes',
        'Obese': 'High risk of cardiovascular diseases, stroke, diabetes, and certain cancers'
    };
    
    let riskLevel = risks[category] || 'Risk assessment not available';
    
    if (bmi > 35) {
        riskLevel += ' (Very High Risk - Immediate medical consultation recommended)';
    }
    
    return riskLevel;
}

module.exports = router;