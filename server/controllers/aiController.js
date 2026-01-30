const Job = require('../models/Job');
const User = require('../models/User');
const axios = require('axios');

/**
 * @desc    Get AI-powered job recommendations for the logged-in job seeker
 * @route   GET /api/jobs/recommendations/ai
 * @access  Private/JobSeeker
 */
exports.getAIRecommendations = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        console.log(`[AI Recs] Fetching for user: ${userId}`);
        const user = await User.findById(userId).lean();

        if (!user || user.role !== 'job_seeker') {
            console.log(`[AI Recs] User not found or not a job seeker: ${userId}`);
            return res.status(403).json({
                success: false,
                message: 'Only job seekers can get AI recommendations'
            });
        }

        // 1. Gather User Profile Data
        const profile = user.profile || {};
        const userContext = {
            skills: profile.skills || [],
            summary: profile.summary || '',
            experience: (profile.experience || []).map(exp => `${exp.title} at ${exp.company}`).join(', '),
            headline: profile.headline || ''
        };

        console.log('[AI Recs] User Context:', JSON.stringify(userContext));

        // If profile is too empty, we might not get good results
        if (userContext.skills.length === 0 && !userContext.summary && !userContext.headline) {
            console.log('[AI Recs] Profile too empty for recommendations');
            return res.status(200).json({
                success: true,
                data: [],
                message: 'Please complete your profile or upload a resume to get personalized recommendations'
            });
        }

        // 2. Fetch Active Jobs
        const jobs = await Job.find({ status: 'active' }).limit(50).select('title company description skills location type salary').lean();

        if (jobs.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No active jobs found to recommend'
            });
        }

        // 3. Prompt Groq for Matching
        const groqApiKey = process.env.VITE_GROQ_API_KEY;
        if (!groqApiKey) {
            console.error('Groq API key missing in environment variables');
            return res.status(500).json({
                success: false,
                message: 'AI service configuration error'
            });
        }

        const jobListStr = jobs.map((job, index) =>
            `ID: ${index} | Title: ${job.title} | Company: ${job.company} | Skills Required: ${job.skills?.join(', ')} | Type: ${job.type} | Location: ${job.location}`
        ).join('\n');

        const prompt = `
You are an expert recruitment assistant for Amdox Job Portal.
Your task is to match a Job Seeker's profile with the most relevant job listings.

JOB SEEKER PROFILE:
- Headline: ${userContext.headline}
- Summary: ${userContext.summary}
- Skills: ${userContext.skills.join(', ')}
- Past Experience: ${userContext.experience}

AVAILABLE JOBS:
${jobListStr}

INSTRUCTIONS:
1. Analyze the job seeker's skills and experience.
2. Select the top 5 most relevant jobs from the list above.
3. Return ONLY a JSON array of the indices (IDs) of these jobs, ranked by relevance.
4. Do not include any explanation or text other than the JSON array.
5. Example format: [2, 14, 5, 1, 9]
`;

        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a professional recruiting assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1, // Low temperature for consistent JSON output
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = groqResponse.data.choices[0].message.content.trim();
        let recommendedIndices = [];

        try {
            // Find the JSON array in the response (handling potential markdown wrapper)
            const jsonMatch = content.match(/\[.*\]/);
            if (jsonMatch) {
                recommendedIndices = JSON.parse(jsonMatch[0]);
            } else {
                recommendedIndices = JSON.parse(content);
            }
        } catch (e) {
            console.error('Failed to parse Groq response:', content);
            // Fallback: return first few jobs if AI fails
            recommendedIndices = [0, 1, 2].slice(0, jobs.length);
        }

        // 4. Map indices back to full job objects
        const recommendedJobs = recommendedIndices
            .filter(idx => idx >= 0 && idx < jobs.length)
            .map(idx => jobs[idx]);

        res.status(200).json({
            success: true,
            data: recommendedJobs
        });

    } catch (error) {
        console.error('AI Recommendation Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get AI recommendations',
            error: error.message
        });
    }
};

/**
 * @desc    Generate a job description based on title and company info
 * @route   POST /api/jobs/generate-description
 * @access  Private/Employer
 */
exports.generateJobDescription = async (req, res) => {
    try {
        const { title, company, industry, location } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Job title is required for generation'
            });
        }

        const groqApiKey = process.env.VITE_GROQ_API_KEY;
        if (!groqApiKey) {
            return res.status(500).json({
                success: false,
                message: 'AI service configuration error'
            });
        }

        const prompt = `
            You are a professional HR assistant and technical writer. 
            Generate a comprehensive and compelling job posting for the following role:
            - Title: ${title}
            - Company: ${company || 'Our Company'}
            - Industry: ${industry || 'Technology'}
            - Location: ${location || 'Remote/On-site'}

            Return ONLY a JSON object with two fields:
            1. "description": A structured job description in markdown. Include "About the Role", "Key Responsibilities", and "About the Company".
            2. "skills": A comma-separated string of the top 8-10 required technical skills and soft skills for this specific role.

            JSON ONLY. Do not include any other text.
        `;

        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a professional HR content generator. Return ONLY JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1500
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = groqResponse.data.choices[0].message.content.trim();
        let result = { description: '', skills: '' };

        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                result = JSON.parse(content);
            }
        } catch (parseError) {
            console.error('[AI JD] Failed to parse JSON, falling back to raw content');
            result = { description: content, skills: '' };
        }

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('AI JD Generation Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to generate job description',
            error: error.message
        });
    }
};
