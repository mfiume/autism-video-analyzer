/**
 * ARIA Autism Assessment Video Analyzer Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint for case data
app.get('/api/cases', (req, res) => {
    // Sample cases - in production this would come from a database
    const cases = [
        {
            id: '1-0102-004',
            subject: 'Subject 1-0102-004',
            dob: 'August 1, 1992',
            sex: 'M',
            affection: 2,
            motherId: '1-0102-001',
            fatherId: '1-0102-002',
            familyId: 'FAM_1-0102-004',
            familyType: 'SPX',
            sample: {
                submittedId: '1-0102-004',
                indexId: '1-0102-004',
                dnaSource: 'White blood cell',
                platform: 'Complete Genomics',
                predictedAncestry: 'EUR'
            },
            video: 'https://www.youtube.com/watch?v=US90ZQyKHR8',
            scores: {
                ados: null,
                adi: null,
                vineland: null
            }
        }
    ];

    res.json(cases);
});

// Get specific case
app.get('/api/cases/:id', (req, res) => {
    // In production, fetch from database
    const caseData = {
        id: req.params.id,
        subject: `Subject ${req.params.id}`,
        dob: 'August 1, 1992',
        sex: 'M',
        affection: 2,
        motherId: '1-0102-001',
        fatherId: '1-0102-002',
        familyId: 'FAM_1-0102-004',
        familyType: 'SPX',
        sample: {
            submittedId: '1-0102-004',
            indexId: '1-0102-004',
            dnaSource: 'White blood cell',
            platform: 'Complete Genomics',
            predictedAncestry: 'EUR'
        },
        video: 'https://www.youtube.com/watch?v=x3aqed6EZE0',
        scores: {
            ados: null,
            adi: null,
            vineland: null
        }
    };

    res.json(caseData);
});

app.listen(PORT, () => {
    console.log(`ARIA Autism Video Analyzer running at http://localhost:${PORT}`);
});
