import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
// CRITICAL: Using process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise title for the problem analysis" },
    problemType: { type: Type.STRING, description: "The category of the math problem (e.g., Optimization, Differential Equations)" },
    summary: { type: Type.STRING, description: "A brief executive summary of the problem statement" },
    keyChallenges: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of the main difficulties or ambiguities in the problem"
    },
    assumptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Necessary simplifying assumptions to make the problem solvable"
    },
    variables: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING },
          description: { type: Type.STRING },
          unit: { type: Type.STRING },
          type: { type: Type.STRING, description: "Variable type (e.g., Continuous, Integer)" }
        },
        required: ["symbol", "description", "type"]
      }
    },
    approaches: {
      type: Type.ARRAY,
      description: "At least 3 distinct mathematical approaches to solve the problem",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          summary: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          complexity: { type: Type.STRING },
          toolsRecommendation: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["name", "summary", "steps", "pros", "cons", "toolsRecommendation"]
      }
    },
    conclusion: { type: Type.STRING, description: "Final advice on which method might be best based on data availability" }
  },
  required: ["title", "problemType", "summary", "variables", "approaches"]
};

/**
 * Analyzes a math problem.
 * @param text The problem description text.
 * @param pdfBase64 Optional base64 string of a PDF file to include in the analysis.
 */
export const analyzeMathProblem = async (text: string, pdfBase64?: string): Promise<AnalysisResult> => {
  try {
    const model = "gemini-3-pro-preview"; // Best for STEM/Reasoning
    
    const parts: any[] = [];
    
    // If a PDF is provided, attach it as inline data
    if (pdfBase64) {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64
            }
        });
    }

    const promptText = `
      You are an expert Mathematical Modeling Coach (MCM/ICM/CUMCM level). 
      Your task is to analyze the following competition problem statement deeply.
      
      ${pdfBase64 ? "The problem statement is contained in the attached PDF file." : ""}
      
      Additional Instructions / Problem Text:
      """
      ${text}
      """

      Requirements:
      1. Analyze the problem type (Optimization, Forecasting, Network, etc.).
      2. Define key variables and necessary assumptions.
      3. Provide AT LEAST 3 DISTINCT solving strategies (e.g., one using differential equations, one using heuristics/machine learning, one using statistical models, or whatever fits best).
      4. Compare the pros and cons of each approach.
      5. Recommend software tools (Python, MATLAB, Lingo, SAS) for each.

      Think step-by-step about the mathematical structures involved before generating the JSON response.
    `;
    
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        // Using thinking budget for deeper analysis of complex math problems
        thinkingConfig: { thinkingBudget: 4096 } 
      }
    });

    const outputText = response.text;
    if (!outputText) throw new Error("No response received from Gemini.");

    const data = JSON.parse(outputText) as AnalysisResult;
    return data;

  } catch (error) {
    console.error("Error analyzing problem:", error);
    throw error;
  }
};