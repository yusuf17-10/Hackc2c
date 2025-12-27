// AI Service Configuration and Implementation
// This service handles different AI providers for medical diagnosis

const AI_SERVICE = import.meta.env.VITE_AI_SERVICE || 'gemini';

// Configuration for different AI services
const AI_CONFIG = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta'
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
    baseURL: 'https://api.openai.com/v1'
  },
  azure: {
    endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
    apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
    deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME,
    apiVersion: '2024-02-15-preview'
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229'
  }
};

// Medical diagnosis prompt template
const MEDICAL_PROMPT = `You are a kind and supportive medical AI assistant (Gemini 1.5). Your tone must be gentle, respectful, and reassuring while remaining factual and concise. Help users understand potential health conditions based on their symptoms.

IMPORTANT DISCLAIMERS:
- This is for informational purposes only and should not replace professional medical advice
- Always recommend consulting with a healthcare professional
- Do not provide specific medical diagnoses or treatment recommendations
- Focus on general health information and when to seek medical attention

User's symptoms (comma separated list): {symptoms}
Known existing medical conditions (if any): {existing_conditions}

Rule for insufficient input: If the symptoms are vague, unrelated to health, too short (<3 meaningful words), or you cannot infer symptom-like content, set "insufficient": true and provide NO conditions.

Please provide ONLY a JSON object with the following structure (be descriptive, supportive, and specific in wording):
{
  "insufficient": false,
  "conditions": [
    {
      "condition": "Condition Name",
      "confidence": 0.85,
      "urgency": "low|medium|high",
      "steps": ["step1", "step2", "step3", "step4"],
      "description": "A friendly, concise description explaining what this is and why it may relate to the user's symptoms, in plain language"
    }
  ],
  "general_advice": "Practical self-care tips tailored to the symptoms and any existing conditions (if any)",
  "when_to_seek_help": "Clear guidance on red flags and when to seek urgent or routine care",
  "disclaimer": "This information is for educational purposes only and should not replace professional medical advice."
}

Return only the JSON response, no additional text.`;

// Medical diagnosis prompt template with image analysis
const MEDICAL_PROMPT_WITH_IMAGES = `You are a kind and supportive medical AI assistant (Gemini 1.5). Your tone must be gentle, respectful, and reassuring while remaining factual and concise. Help users understand potential health conditions based on their symptoms and visual analysis of uploaded images.

IMPORTANT DISCLAIMERS:
- This is for informational purposes only and should not replace professional medical advice
- Always recommend consulting with a healthcare professional
- Do not provide specific medical diagnoses or treatment recommendations
- Focus on general health information and when to seek medical attention
- Visual analysis is limited and should be confirmed by a healthcare professional

User's symptoms (comma separated list): {symptoms}
Known existing medical conditions (if any): {existing_conditions}

Please analyze the uploaded images for visible symptoms, rashes, skin conditions, or other external signs that might be relevant to the described symptoms.

Rule for insufficient input: If the symptoms are vague, unrelated to health, too short (<3 meaningful words), or you cannot infer symptom-like content, set "insufficient": true and provide NO conditions.

Provide ONLY a JSON object with the following structure (be descriptive, supportive, and specific in wording):
{
  "insufficient": false,
  "conditions": [
    {
      "condition": "Condition Name",
      "confidence": 0.85,
      "urgency": "low|medium|high",
      "steps": ["step1", "step2", "step3", "step4"],
      "description": "A friendly, concise description explaining what this is and why it may relate to the user's symptoms, in plain language",
      "visual_analysis": "Analysis of visible symptoms from images"
    }
  ],
  "visual_findings": "Summary of what was observed in the images",
  "general_advice": "Practical self-care tips tailored to the symptoms, visual findings, and any existing conditions (if any)",
  "when_to_seek_help": "Clear guidance on red flags and when to seek urgent or routine care",
  "disclaimer": "This information is for educational purposes only and should not replace professional medical advice. Visual analysis is limited and should be confirmed by a healthcare professional."
}

Return only the JSON response, no additional text.`;

class AIService {
  constructor() {
    this.config = AI_CONFIG[AI_SERVICE];
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config) {
      throw new Error(`Invalid AI service: ${AI_SERVICE}. Supported services: gemini, openai, azure, anthropic`);
    }

    // Check for required API keys
    if (AI_SERVICE === 'gemini' && !this.config.apiKey) {
      throw new Error('Google Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
    }
    
    if (AI_SERVICE === 'openai' && !this.config.apiKey) {
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file');
    }
    
    if (AI_SERVICE === 'azure' && (!this.config.apiKey || !this.config.endpoint || !this.config.deploymentName)) {
      throw new Error('Azure OpenAI configuration incomplete. Please check your .env file');
    }
    
    if (AI_SERVICE === 'anthropic' && !this.config.apiKey) {
      throw new Error('Anthropic API key not found. Please set VITE_ANTHROPIC_API_KEY in your .env file');
    }
  }

  async diagnose(symptoms, images = [], existingConditions = '') {
    try {
      const hasImages = images && images.length > 0;
      console.log('Diagnosing with images:', hasImages ? `${images.length} images` : 'no images');
      
      const conditionsText = existingConditions && existingConditions.trim().length > 0 
        ? existingConditions 
        : 'None reported';
      const prompt = hasImages 
        ? MEDICAL_PROMPT_WITH_IMAGES.replace('{symptoms}', symptoms.join(', ')).replace('{existing_conditions}', conditionsText)
        : MEDICAL_PROMPT.replace('{symptoms}', symptoms.join(', ')).replace('{existing_conditions}', conditionsText);
      
      switch (AI_SERVICE) {
        case 'gemini':
          return await this.callGemini(prompt, hasImages ? images : []);
        case 'openai':
          return await this.callOpenAI(prompt, hasImages ? images : []);
        case 'azure':
          return await this.callAzureOpenAI(prompt, hasImages ? images : []);
        case 'anthropic':
          return await this.callAnthropic(prompt, hasImages ? images : []);
        default:
          throw new Error(`Unsupported AI service: ${AI_SERVICE}`);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI diagnosis failed: ${error.message}`);
    }
  }

  async callGemini(prompt, images = []) {
    // Prepare content parts
    const parts = [{ text: prompt }];
    
    // Add image parts only if images are provided and not empty
    if (images && images.length > 0) {
      console.log(`Processing ${images.length} images for Gemini analysis`);
      for (const image of images) {
        try {
          const base64 = await this.fileToBase64(image.file);
          parts.push({
            inline_data: {
              mime_type: image.file.type,
              data: base64
            }
          });
        } catch (error) {
          console.error('Error processing image:', error);
          // Continue without this image
        }
      }
    } else {
      console.log('No images provided, using text-only analysis');
    }

    const response = await fetch(`${this.config.baseURL}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 10
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    return this.parseAIResponse(responseText);
  }

  // Helper method to convert file to base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  async callOpenAI(prompt, images = []) {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical AI assistant. Always provide responses in valid JSON format as specified in the prompt.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content);
  }

  async callAzureOpenAI(prompt, images = []) {
    const url = `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=${this.config.apiVersion}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical AI assistant. Always provide responses in valid JSON format as specified in the prompt.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return this.parseAIResponse(data.choices[0].message.content);
  }

  async callAnthropic(prompt, images = []) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return this.parseAIResponse(data.content[0].text);
  }

  parseAIResponse(responseText) {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const conditions = Array.isArray(parsed.conditions) ? parsed.conditions.map(condition => ({
        condition: condition.condition,
        confidence: Math.min(Math.max(condition.confidence ?? 0, 0), 1),
        urgency: condition.urgency || 'low',
        steps: Array.isArray(condition.steps) ? condition.steps : [],
        description: condition.description || '',
        visual_analysis: condition.visual_analysis || undefined
      })) : [];

      const highestConfidence = conditions.reduce((m, c) => Math.max(m, typeof c.confidence === 'number' ? c.confidence : 0), 0);
      const insufficient = Boolean(parsed.insufficient) || conditions.length === 0 || highestConfidence < 0.35;

      return {
        insufficient,
        conditions,
        visual_findings: parsed.visual_findings || undefined,
        general_advice: parsed.general_advice || '',
        when_to_seek_help: parsed.when_to_seek_help || '',
        disclaimer: parsed.disclaimer || ''
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response:', responseText);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  // Fallback used when AI fails or is not configured
  getMockFallback() {
    console.warn('Using strict insufficient fallback');
    return {
      insufficient: true,
      conditions: [],
      general_advice: '',
      when_to_seek_help: '',
      disclaimer: ''
    };
  }
}

// Create singleton instance
let aiServiceInstance = null;

export function getAIService() {
  if (!aiServiceInstance) {
    try {
      aiServiceInstance = new AIService();
    } catch (error) {
      console.warn('AI Service initialization failed, will use mock data:', error.message);
      return null;
    }
  }
  return aiServiceInstance;
}

// Main diagnosis function
export async function diagnose(symptoms, images = [], existingConditions = '') {
  const aiService = getAIService();
  
  if (!aiService) {
    // Fallback to mock data if AI service is not available
    const mockService = new AIService();
    return mockService.getMockFallback(symptoms);
  }

  try {
    return await aiService.diagnose(symptoms, images, existingConditions);
  } catch (error) {
    console.error('AI diagnosis failed, using fallback:', error);
    const mockService = new AIService();
    return mockService.getMockFallback(symptoms);
  }
}

export default { diagnose, getAIService };
