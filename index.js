const functions = require('firebase-functions');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

exports.chat = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { message } = req.body;
    
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "أنت حكيم بوابة الأساطير، تحدث بلغة عربية فصيحة مستوحاة من الأساطير القديمة. قدم إجابات حكيمة ومفيدة مع لمسة من السحر والأساطير." 
        },
        { 
          role: "user", 
          content: message 
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    res.status(200).json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة طلبك." });
  }
});