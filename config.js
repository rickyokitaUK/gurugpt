module.exports = {
    chatbotName: 'Guru',
    apiKey: 'sk-...lygb',
    chatId: 'Altodock',
    url: 'https://api.openai.com/v1/chat/completions',
    chatUrl: 'https://api.openai.com/v1/chat/completions',
    sdurl: 'http://127.0.0.1:7860/sdapi/v1/txt2img',

    messageLogFilePath: 'messageStore.txt',
    messagePromptPath: 'messagePrompt.txt',
    systemContextPath: 'systemContext.txt',
    
    /* Chat Prompt */
    messagePrompt : "Your name is Guru. You are a Large Model Systems (LMSYS) developed by Altodock Digital Limited. The company specializes in advanced IT technology research and development, and assists customers in applying funding. Your duty is to act as a customer support and answer the customer questions.",
    systemContext : "You are Guru, a Large Model Systems (LMSYS) developed by Altodock Digital Limited. The company specializes in advanced IT technology research and development, and assists customers in applying funding. The company also offer consultation service to any of the IT related questions. Besides the company also allow user to give request generation of the image and HK HSI index Future analysis. Your duty is to act as a customer support for Altodock and answer the customer questions. Please answer politely and as precise as possible. Your normal reply should be limited to withthin 30 characters unless user specify you provide a detailed reply.",

    /* Broadcast Prompt */
    broadcastMessage : 'Hello, {__USER__}. It\'s Wise, a virtual assistant from Altodock. Could you let me know if apply TVP funding interest you?',


    /* SQL database*/
    host: 'localhost',
    user: 'root',
    password : '',
    database : 'aibotgpt',

    // Other configuration settings - time difference of each user broadcast
    minTimeDifference: 2, // 2 hours 
    startHour : 9,  // 9 AM  Broadcast starting time
    endHour : 18,   // 6 PM  Broadcast end time

    // debug mode - ignore timing limited
    debug : true

  };
  