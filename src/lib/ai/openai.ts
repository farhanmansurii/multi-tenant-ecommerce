import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
}

export interface CopySuggestion {
  original: string;
  improved: string;
  reasoning: string;
}

export class AIService {
  async generateProductRecommendations(
    product: {
      name: string;
      description: string;
      categories: string[];
      tags: string[];
    },
    storeProducts: Array<{
      id: string;
      name: string;
      description: string;
      categories: string[];
      tags: string[];
    }>,
    limit = 5
  ): Promise<ProductRecommendation[]> {
    try {
      const prompt = `
Given a product and a list of other products in the store, recommend the most relevant products that customers would likely be interested in buying together or as alternatives.

Product: ${JSON.stringify(product, null, 2)}

Store Products: ${JSON.stringify(storeProducts, null, 2)}

Return a JSON array of recommendations with the following format:
[
  {
    "productId": "string",
    "score": number (0-1, higher is better),
    "reason": "string explaining why this product is recommended"
  }
]

Only recommend products from the store products list. Limit to ${limit} recommendations.
Focus on complementary products, alternatives, or products in the same category.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");

      const recommendations = JSON.parse(content) as ProductRecommendation[];
      return recommendations.slice(0, limit);
    } catch (error) {
      console.error("Error generating product recommendations:", error);
      return [];
    }
  }

  async improveProductCopy(
    product: {
      name: string;
      description: string;
      categories: string[];
      price: string;
    },
    targetAudience = "general consumers"
  ): Promise<CopySuggestion> {
    try {
      const prompt = `
Improve the product description to be more engaging, persuasive, and SEO-friendly. Focus on benefits rather than just features. Make it compelling for ${targetAudience}.

Original Product:
Name: ${product.name}
Description: ${product.description}
Categories: ${product.categories.join(", ")}
Price: ${product.price}

Provide a JSON response with:
{
  "original": "the original description",
  "improved": "the improved description",
  "reasoning": "explanation of the changes and why they improve the copy"
}

Make the improved description natural, benefit-focused, and optimized for conversions.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");

      return JSON.parse(content) as CopySuggestion;
    } catch (error) {
      console.error("Error improving product copy:", error);
      return {
        original: product.description,
        improved: product.description,
        reasoning: "Failed to generate improvement",
      };
    }
  }

  async generateProductAltText(
    productName: string,
    imageDescription = ""
  ): Promise<string> {
    try {
      const prompt = `
Generate concise, descriptive alt text for a product image.

Product: ${productName}
${imageDescription ? `Image description: ${imageDescription}` : ""}

Create alt text that:
- Is descriptive but concise (under 125 characters)
- Includes the product name
- Describes key visual elements
- Is accessible for screen readers

Just return the alt text, nothing else.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 50,
      });

      const content = response.choices[0]?.message?.content?.trim();
      return content || productName;
    } catch (error) {
      console.error("Error generating alt text:", error);
      return productName;
    }
  }

  async analyzeProductCategories(
    productName: string,
    description: string
  ): Promise<string[]> {
    try {
      const prompt = `
Analyze this product and suggest appropriate e-commerce categories/tags.

Product: ${productName}
Description: ${description}

Return a JSON array of category/tag suggestions. Focus on standard e-commerce categories like:
- Clothing & Accessories
- Electronics
- Home & Garden
- Sports & Outdoors
- Beauty & Personal Care
- Books & Media
- etc.

Limit to 3-5 most relevant categories.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");

      return JSON.parse(content) as string[];
    } catch (error) {
      console.error("Error analyzing product categories:", error);
      return [];
    }
  }
}

export const aiService = new AIService();
