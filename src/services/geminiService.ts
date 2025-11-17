import { GoogleGenAI, Type } from "@google/genai";
import type { ConvertedDate } from '../types';

// The API key is assumed to be available in the environment as process.env.API_KEY
// The constructor will handle the key. A check here can crash the app.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const todayHijriResponseSchema = {
  type: Type.OBJECT,
  properties: {
    year: { type: Type.NUMBER, description: 'السنة الهجرية' },
    month: { type: Type.NUMBER, description: 'الشهر الهجري (رقم)' },
    day: { type: Type.NUMBER, description: 'اليوم الهجري (رقم)' },
    monthName: { type: Type.STRING, description: 'اسم الشهر الهجري' },
    weekdayName: { type: Type.STRING, description: 'اسم يوم الأسبوع باللغة العربية' },
  },
  required: ['year', 'month', 'day', 'monthName', 'weekdayName'],
};

const conversionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    year: { type: Type.NUMBER, description: 'السنة' },
    month: { type: Type.NUMBER, description: 'الشهر (رقم)' },
    day: { type: Type.NUMBER, description: 'اليوم (رقم)' },
    monthName: { type: Type.STRING, description: 'اسم الشهر (مثال: محرم أو يناير)' },
  },
  required: ['year', 'month', 'day', 'monthName'],
};

const callGeminiWithSchema = async <T,>(prompt: string, schema: any): Promise<T> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error("Empty response from API");
    }
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};

export const getTodaysHijriDate = async (): Promise<ConvertedDate> => {
    const today = new Date();
    const prompt = `أنا بحاجة إلى تحويل تاريخ اليوم الميلادي إلى التاريخ الهجري (تقويم أم القرى). تاريخ اليوم هو: ${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}. يرجى تقديم النتيجة بصيغة JSON، مع تضمين اسم اليوم واسم الشهر باللغة العربية.`;
    return callGeminiWithSchema<ConvertedDate>(prompt, todayHijriResponseSchema);
};

export const convertGregorianToHijri = async (year: number, month: number, day: number): Promise<ConvertedDate> => {
    const prompt = `قم بتحويل التاريخ الميلادي ${year}-${month}-${day} إلى التاريخ الهجري (تقويم أم القرى). قدم النتيجة بصيغة JSON، مع تضمين اسم الشهر الهجري.`;
    return callGeminiWithSchema<ConvertedDate>(prompt, conversionResponseSchema);
};

export const convertHijriToGregorian = async (year: number, month: number, day: number): Promise<ConvertedDate> => {
    const prompt = `قم بتحويل التاريخ الهجري ${year}-${month}-${day} (تقويم أم القرى) إلى التاريخ الميلادي. قدم النتيجة بصيغة JSON، مع تضمين اسم الشهر الميلادي.`;
    return callGeminiWithSchema<ConvertedDate>(prompt, conversionResponseSchema);
};