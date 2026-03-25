const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(messages, model = 'gpt-3.5-turbo') {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new Error('AI service error: ' + error.message);
    }
  }

  async summarize(text, maxLength = 200) {
    const messages = [
      {
        role: 'system',
        content: 'You are a summarization assistant. Provide concise summaries.'
      },
      {
        role: 'user',
        content: `Please summarize the following text in ${maxLength} words or less:\n\n${text}`
      }
    ];
    
    return await this.chat(messages);
  }

  async assessTask(task, submission) {
    const messages = [
      {
        role: 'system',
        content: 'You are an AI assessor for task submissions. Provide constructive feedback and evaluation.'
      },
      {
        role: 'user',
        content: `Task: ${task.title}\nDescription: ${task.description}\n\nSubmission: ${submission.content}\n\nPlease assess this submission.`
      }
    ];
    
    return await this.chat(messages);
  }

  async monetizationAdvice(content) {
    const messages = [
      {
        role: 'system',
        content: 'You are a monetization expert. Provide practical monetization strategies.'
      },
      {
        role: 'user',
        content: `Please provide monetization advice for: ${content}`
      }
    ];
    
    return await this.chat(messages);
  }
}

module.exports = new AIService();