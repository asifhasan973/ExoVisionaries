import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const AVAILABLE_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
    'mixtral-8x7b-32768',
    'llama3-groq-70b-8192-tool-use-preview',
    'llama3-groq-8b-8192-tool-use-preview'
];

const getApiKey = () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
        return null;
    }
    if (!apiKey.startsWith('gsk_')) {
        return null;
    }
    return apiKey;
};

const SYSTEM_PROMPT = `You are a friendly AI space weather assistant designed specifically for children aged 8-14. Your name is "Space Weather Assistant" and you help kids learn about space science.

CRITICAL INSTRUCTIONS:
- NEVER show your thinking process or use <think> tags
- NEVER include reasoning or internal thoughts in your response
- Only provide the final answer directly
- Always maintain the same personality and identity
- Do not change your name or introduce yourself differently

Your role is to explain space weather, auroras, solar storms, and related space science topics in an engaging, educational, and age-appropriate way.

Response Guidelines:
- Give direct, clear answers without showing your thought process
- Use simple, clear language that children can understand
- Be enthusiastic and encouraging about space science
- Include fun facts and analogies to help explain complex concepts
- Use emojis occasionally to make responses more engaging (1-2 per response maximum)
- Keep responses informative but not too long (2-4 sentences typically)
- Always maintain a positive, curious tone
- If asked about non-space topics, gently redirect to space weather topics
- Focus on wonder and discovery rather than fear about space weather events
- Explain how scientists study and predict space weather
- Connect space weather to things kids might see or experience (like auroras, GPS, satellites)
- If asked personal questions (like "how are you"), respond briefly and redirect to space topics
- Stay consistent - you are the same AI assistant in every conversation

Remember: Provide only clean, direct responses without any thinking process visible. You're helping spark curiosity about space science in young minds!`;

const FALLBACK_RESPONSES = [
    "That's a great question about space! 🌌 Space weather is fascinating - it's all about how the Sun affects Earth and creates amazing phenomena like auroras! What specific aspect would you like to know more about?",
    "I love your curiosity about space! 🚀 The Sun and Earth have such an interesting relationship, creating beautiful auroras and affecting our technology. Keep asking questions - that's how we learn!",
    "Space weather is so exciting to explore! ✨ From solar storms to the dancing lights of auroras, there's always something amazing happening in space. What would you like to discover next?",
    "Great thinking! 🌟 Space science helps us understand how the Sun protects and affects life on Earth. Scientists work every day to learn more about these cosmic connections!",
    "That's an awesome question! 🌈 Space weather affects everything from the beautiful auroras we see to the satellites that help us navigate. There's so much to explore in space science!"
];

const _tryApiCall = async (apiKey, messages, modelIndex = 0) => {
    if (modelIndex >= AVAILABLE_MODELS.length) {
        throw new Error('All models failed');
    }

    const model = AVAILABLE_MODELS[modelIndex];

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: model,
                messages: messages,
                max_tokens: 300, // Keep responses concise for children
                temperature: 0.7, // Balanced creativity and consistency
                top_p: 0.9,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        if (response.data?.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content.trim();
        } else {
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message;

        if (errorMessage?.includes('decommissioned') ||
            errorMessage?.includes('not found') ||
            errorMessage?.includes('does not exist')) {
            return await _tryApiCall(apiKey, messages, modelIndex + 1);
        }

        // For other errors, don't retry
        throw error;
    }
};

// Function to get AI response with automatic retry
export const getAIResponse = async (userMessage, retryCount = 0, maxRetries = 3) => {
    const apiKey = getApiKey();

    // If no API key, throw error instead of fallback
    if (!apiKey) {
        throw new Error('API_KEY_MISSING');
    }

    try {

        // Fetch available models dynamically
        const availableModels = await fetchAvailableModels(apiKey);

        if (availableModels.length === 0) {
            throw new Error('No models available');
        }

        // Try the first available model
        const model = availableModels[0];

        const response = await axios.post(
            GROQ_API_URL,
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 300,
                temperature: 0.3, // Lower temperature for more consistent responses
                top_p: 0.8,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // Increased timeout
            }
        );

        if (response.data?.choices?.[0]?.message?.content) {
            let content = response.data.choices[0].message.content.trim();

            // Clean up any thinking tags or internal reasoning that might appear
            content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
            content = content.replace(/\*thinks?\*[\s\S]*?\*\/?thinks?\*/gi, '');
            content = content.replace(/\(thinking:[\s\S]*?\)/gi, '');
            content = content.replace(/^(thinking|reasoning|internal thought):.*$/gim, '');

            // Clean up extra whitespace
            content = content.replace(/\n\s*\n/g, '\n').trim();

            return content;
        } else {
            throw new Error('Invalid response format from API');
        }
    } catch (error) {

        // If we haven't reached max retries, try again
        if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            return await getAIResponse(userMessage, retryCount + 1, maxRetries);
        }

        // If all retries failed, throw the error
        throw error;
    }
};

// Function to fetch available models from Groq API
const fetchAvailableModels = async (apiKey) => {
    try {
        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        if (response.data?.data) {
            const modelNames = response.data.data.map(model => model.id);
            return modelNames;
        }
    } catch {
    }
    return AVAILABLE_MODELS; // fallback to hardcoded list
};

// Function to check if API is configured
export const isApiConfigured = () => {
    const apiKey = getApiKey();
    return apiKey !== null;
};

export const isAiServiceAvailable = () => {
    if (import.meta.env.VITE_AI_ENABLED === 'true' && isApiConfigured()) {
        return true;
    }
    return false;
};

export const getAiUnavailableReason = () => ({
    title: 'AI Assistant Temporarily Unavailable',
    message:
        'The AI assistant is currently offline because the API quota has expired. All other features — Aurora Lab, live forecasts, games, and story modules — work normally.',
});

// Function to test API connection
export const testApiConnection = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return { success: false, message: 'No API key configured' };
    }

    try {
        // First, try to fetch available models
        const availableModels = await fetchAvailableModels(apiKey);

        if (availableModels.length === 0) {
            return { success: false, message: 'No models available' };
        }

        // Try the first available model
        const testModel = availableModels[0];

        const response = await axios.post(
            GROQ_API_URL,
            {
                model: testModel,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello! Just testing the connection. Please respond with "Connection successful!"'
                    }
                ],
                max_tokens: 50,
                temperature: 0.1
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.data?.choices?.[0]?.message?.content) {
            return { success: true, message: `API connection successful using ${testModel}!` };
        } else {
            return { success: false, message: 'Invalid API response format' };
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Connection failed';
        return {
            success: false,
            message: errorMessage
        };
    }
};

// Function to get API status
export const getApiStatus = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return {
            configured: false,
            message: 'API key not configured. Using fallback responses.'
        };
    }
    return {
        configured: true,
        message: 'Groq AI API is configured and ready!'
    };
};
