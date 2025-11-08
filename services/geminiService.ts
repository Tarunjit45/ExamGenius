import { GoogleGenAI, Type } from "@google/genai";
import type { SyllabusTopic, StudyPlan, QuizQuestion, Mission, AidType } from '../types';

// Declaring pdfjsLib as it's loaded from a script tag in index.html
declare const pdfjsLib: any;

/**
 * Robustly parses a JSON string from a Gemini API response.
 * It handles cases where the JSON is wrapped in markdown code fences (```json ... ```).
 * @param jsonString The raw string response from the API.
 * @returns The parsed JSON object.
 */
const parseJsonFromResponse = (jsonString: string): any => {
    // Clean the string: remove markdown fences and trim whitespace
    const cleanedString = jsonString.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    try {
        return JSON.parse(cleanedString);
    } catch (error) {
        console.error("Failed to parse JSON response:", cleanedString);
        throw new Error("The AI returned an invalid format. Please try again.");
    }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

/**
 * Extracts text from a PDF file using the pdf.js library.
 * @param file The PDF file.
 * @returns A promise that resolves with the extracted text content.
 */
const extractTextFromPdf = async (file: File): Promise<string> => {
    // This worker is required by pdf.js to perform heavy lifting off the main thread.
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((s: any) => s.str).join(' ') + '\n';
    }
    return textContent;
};


const getGeminiAI = () => {
    // API key is automatically sourced from process.env.API_KEY
    if (!process.env.API_KEY) {
        // In a real app, you'd handle this more gracefully.
        // For this context, we assume the key is present.
        console.error("API key not found. Please set the API_KEY environment variable.");
        // We'll proceed, but API calls will fail. The UI should show an error.
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY! });
};

export const extractTopicsFromSyllabus = async (file: File): Promise<SyllabusTopic[]> => {
  const ai = getGeminiAI();
  let modelContents: any;

  if (file.type.startsWith('image/')) {
    const filePart = await fileToGenerativePart(file);
    modelContents = {
      parts: [
        filePart,
        { text: "Analyze this image of a syllabus. Extract all subjects and their corresponding topics. Respond in a valid JSON format that adheres to the provided schema." }
      ]
    };
  } else if (file.type === 'application/pdf') {
    const pdfText = await extractTextFromPdf(file);
    if (!pdfText.trim()) {
        throw new Error("Could not extract any text from the PDF. It might be an image-based PDF or corrupted.");
    }
    modelContents = {
      parts: [
        { text: `Here is the text extracted from a syllabus PDF:\n\n---\n${pdfText}\n---\n\nAnalyze this text. Extract all subjects and their corresponding topics. Respond in a valid JSON format that adheres to the provided schema.` }
      ]
    };
  } else {
    throw new Error("Unsupported file type.");
  }

  const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: modelContents,
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      subject: { type: Type.STRING },
                      topics: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                      }
                  },
                  required: ["subject", "topics"]
              }
          }
      }
  });

  return parseJsonFromResponse(result.text) as SyllabusTopic[];
};

export const createStudyPlan = async (topics: SyllabusTopic[], days: number, studySpeed: 'Chill' | 'Normal' | 'Speedrun'): Promise<StudyPlan> => {
    const ai = getGeminiAI();
    const allTopics = topics.flatMap(t => t.topics.map(topic => ({ subject: t.subject, topic })));

    const prompt = `You are an expert study planner designing a gamified study quest.
    
    Topics list: ${JSON.stringify(allTopics)}.
    Days to prepare: ${days}.
    Student's preferred pace: '${studySpeed}'.

    Instructions:
    1. Create a balanced, day-by-day study plan.
    2. Each topic is a 'mission'. Every single topic must be included exactly once.
    3. Adjust the daily mission load based on the study speed:
        - 'Chill': Fewer missions per day, more relaxed pace.
        - 'Normal': A moderate, balanced number of missions per day.
        - 'Speedrun': More missions per day for an intense session.
    4. Mix subjects daily to keep it engaging. Prioritize harder topics earlier if possible.
    5. Distribute missions as evenly as possible across the days according to the chosen pace.
    6. Respond in a valid JSON format with the specified schema.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    days: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.INTEGER },
                                missions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            subject: { type: Type.STRING },
                                            topic: { type: Type.STRING }
                                        },
                                        required: ["subject", "topic"]
                                    }
                                 }
                            },
                            required: ["day", "missions"]
                        }
                    }
                },
                required: ["days"]
            }
        }
    });

    const parsedPlan = parseJsonFromResponse(result.text);
    // Add status and id to missions
    const planWithStatus: StudyPlan = {
        days: parsedPlan.days.map((day: any) => ({
            ...day,
            missions: day.missions.map((mission: Omit<Mission, 'status' | 'id'>) => ({
                ...mission,
                id: `${mission.subject}-${mission.topic}-${Math.random()}`,
                status: 'pending'
            }))
        }))
    };
    return planWithStatus;
};

export const generateStudyAid = async (topic: string, subject: string, aidType: 'notes' | 'summary' | 'mnemonics' | 'story'): Promise<string> => {
    const ai = getGeminiAI();
    let modelName = 'gemini-flash-lite-latest';
    let prompt = ``;
    let config: any = {};

    if (aidType === 'notes') {
        modelName = 'gemini-2.5-flash';
        prompt = `Generate comprehensive but easy-to-understand notes for the topic "${topic}" in the subject "${subject}". Use Google Search to ensure the information is accurate and up-to-date. Use Markdown for formatting. Structure the notes with headings and bullet points for clarity.`;
        config.tools = [{ googleSearch: {} }];
    } else if (aidType === 'summary') {
        prompt = `Provide a short, one-paragraph summary of the key concepts for the topic "${topic}" in the subject "${subject}".`
    } else if (aidType === 'mnemonics') {
        prompt = `Create clever and memorable mnemonics for the key concepts in the topic "${topic}" under the subject "${subject}". Format the response using Markdown, with headings for different concepts and lists for the mnemonics themselves.`;
    } else if (aidType === 'story') {
        modelName = 'gemini-2.5-pro';
        prompt = `I am studying the subject "${subject}". My current topic is "${topic}". Turn this topic into a game-like story - with characters, storylines, and challenges - so it feels like I'm leveling up instead of memorizing facts. Make it engaging and memorable. Use Markdown for formatting.`;
    }

    const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config,
    });
    return result.text;
};

export const generateQuiz = async (topic: string, subject:string): Promise<QuizQuestion[]> => {
    const ai = getGeminiAI();
    const prompt = `Create a quiz with 4 multiple-choice questions for the topic "${topic}" in the subject "${subject}". Each question must have exactly 4 options. Ensure one option is clearly the correct answer. The goal is to test a student's understanding. Respond in a valid JSON format that adheres to the provided schema.`;
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            minItems: 4,
                            maxItems: 4,
                        },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswer"]
                }
            }
        }
    });

    const quizData = parseJsonFromResponse(result.text) as QuizQuestion[];

    // Basic validation
    if (!quizData || !Array.isArray(quizData) || quizData.some(q => q.options.length !== 4)) {
        throw new Error('Quiz generation failed to produce valid questions.');
    }
    return quizData;
};