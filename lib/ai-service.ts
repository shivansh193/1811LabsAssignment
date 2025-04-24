import axios from 'axios';

// API endpoint for Google's Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// System prompt for summarization
const SUMMARIZATION_PROMPT = `
You are an expert note summarizer with the following capabilities:

1. Extracting key points and main ideas from text
2. Condensing information while preserving essential meaning
3. Organizing information in a clear, logical structure
4. Removing redundant or less important details
5. Maintaining the original tone and intent of the content

Your summaries should be:
- Concise: Typically 20-30% of the original length
- Comprehensive: Capture all important information
- Clear: Easy to understand and well-structured
- Accurate: Faithful to the original content

Focus on identifying the most important concepts, arguments, findings, or conclusions in the text.
`;

/**
 * Summarize text using Google's Gemini API
 * @param text - The text to summarize
 * @returns The summarized text
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables');
    }

    // Construct the API URL with the API key
    const apiUrlWithKey = `${GEMINI_API_URL}?key=${apiKey}`;

    // Create a combined prompt with instructions and the text to summarize
    const combinedPrompt = `${SUMMARIZATION_PROMPT}\n\nPlease summarize the following text:\n\n${text}`;

    // Prepare the request payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            { text: combinedPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    };

    console.log('Sending request to Gemini API...');
    
    // Make the API request
    const response = await axios.post(
      apiUrlWithKey,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Received response from Gemini API');

    // Extract the summary from the response
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0]) {
      
      const summary = response.data.candidates[0].content.parts[0].text.trim();
      console.log('Successfully extracted summary');
      return summary;
    } else {
      console.error('Unexpected response format:', JSON.stringify(response.data, null, 2));
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error: unknown) {
    console.error('Error summarizing text with Gemini API:', error);
    
    // Provide more detailed error message if available
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response) {
      console.error('Gemini API error details:', JSON.stringify(error.response.data, null, 2));
    }
    
    throw new Error('Failed to summarize text. Please try again later.');
  }
}
