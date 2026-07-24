import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateProductDescription = async (
    productName,
    category
) => {

    const prompt = `
        Generate a professional e-commerce product description.

        Product Name: ${productName}
        Category: ${category}

        Requirements:
        - Write in clear professional English.
        - Keep it between 80 and 120 words.
        - Highlight the product's purpose and benefits.
        - Do not mention price.
        - Do not invent specifications.
        - Return only the description.
        `;

    const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
    });

    return response.text;

};



export const generateAlternativeNames = async (productName, category) => {
    const prompt = `
Generate exactly 5 alternative product names for the following product.

Product Name: ${productName}
Category: ${category}

Rules:
- Return only the names.
- Separate each name with a comma.
- Do not use numbering.
- Do not add explanations.
`;

    const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
    });

    return response.text.trim();
};