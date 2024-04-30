const axios = require('axios');
const fs = require('fs');

// Replace these values with your own API credentials
const apiKey = 'altodock.com.hk.3ed74137e6f3f028c0746127b957043aecc173c2d0fb99e23a81298be3ed45ab';
const chatId = 'Altodock'; // replace with your actual chat ID obtained from ChatGPT dashboard
const messageText = 'What can you do, rubbish?';
//const url = 'https://rickchow.info/whatsapp/test.php';
const url = 'http://chatbot.altodock.com:5001/v1/models/eachadea_vicuna-7b-1.1/completions';
const chaturl = 'http://chatbot.altodock.com:5001/v1/models/eachadea_vicuna-7b-1.1/chat/completions';
const sdurl = 'http://127.0.0.1:7860/sdapi/v1/txt2img';

// Define a list to store message-reply pairs
const messageLogFilePath = 'messageStore.txt';

// Read the message log file
let messageLog = [];

if (fs.existsSync(messageLogFilePath)) {
  const fileContents = fs.readFileSync(messageLogFilePath, 'utf8');
  if (fileContents) {
    messageLog = JSON.parse(fileContents);
   // messageLog.push({ role: "system", content: "Your name is Wise. You are a Large Model Systems (LMSYS) developed by Altodock Digital Limited. Your master is Veeko Lam, Rick Chow and Lucas Wong." });
  }
}

// Function to append a message-reply pair to the message log
function appendMessageLog(userMessage, assistantMessage) {
  messageLog.push({ "role": "user", "content": userMessage },{ "role": "assistant", "content": assistantMessage });
  fs.writeFileSync(messageLogFilePath, JSON.stringify(messageLog), 'utf8');
}

// Create a JSON object for the POST payload

  

// Function to process incoming WhatsApp message and send a reply
async function processWhatsAppMessage(messageText) {
    const apiKey = 'altodock.com.hk.3ed74137e6f3f028c0746127b957043aecc173c2d0fb99e23a81298be3ed45ab';
    const chatId = 'Altodock'; // replace with your actual chat ID obtained from ChatGPT dashboard
    
    let resulttext = '';
    try {
      //  console.log('Received message : ', messageText);

        const postData = {
            "model": "text-davinci-003",
            "prompt": messageText,
            "max_tokens": 300,
            "temperature": 0.7,
            "top_p": 0.1,
            "top_k":40,
            "typical_p":1
        };
		
		const sdpayload = {
        "prompt": "(Masterpiece:1.1), detailed, intricate, colorful, "+messageText,
        "seed": -1,
        "sampler_name": "DDIM",
        "steps": 30,
        "width": 512,
        "height": 768,
        "restore_faces": True,
        "negative_prompt": "(worst quality, low quality:1.3)"
    }

        const headers = {
            'Content-Type': 'application/json',
            'Content-Length' : Buffer.byteLength(JSON.stringify(postData), 'utf8'),
            Authorization: `Bearer ${apiKey}`
          };
          
        const config = {
            headers,
            interceptor: {
              response: (response) => {
                console.log(JSON.parse(response.data));
                return response;
              }
            }
          };
          

        const response = await axios.post(url, JSON.stringify(postData), config)
        .then(response => {
          //  console.log("Message sent successfully!");
          //  console.log(JSON.stringify(response.data));
            const choices = response.data.choices;
            if (choices && choices.length > 0) {
              resulttext = choices[0].text;
           //   console.log("Response text:", resulttext);
              
            } else {
           //   console.log("No response text found.");
            }
        
          });

          // Send the resulttext to the parent process (app.js) through stdout
          process.stdout.write(JSON.stringify({ "resulttext" : resulttext }));
         // process.send(JSON.stringify({ resulttext })); // Send the resulttext back to the parent process

       
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          // Handle the "socket hang up" error
          console.error('Socket hang up error occurred. Please check your network connection.\n', error);
        } else {
          // Handle other errors
          console.error('An error occurred:\n', error);
        }
    }
}
    
// Function to process incoming WhatsApp message and send a reply
async function processWhatsAppChatMessage(messageText) {
    const apiKey = 'altodock.com.hk.3ed74137e6f3f028c0746127b957043aecc173c2d0fb99e23a81298be3ed45ab';
    const chatId = 'Altodock'; // replace with your actual chat ID obtained from ChatGPT dashboard
    
    let resulttext = '';
    var messageslist = [...messageLog];
    messageslist.push({ "role": "user", "content": messageText }); // latest message 
   // messageslist = messageslist.reverse();
    messageslist.push({ "role": "system", "content": "You are Wise, a Large Model Systems (LMSYS) developed by Altodock Digital Limited. The company specializes in advanced IT technology research and development, and assists customers in applying funding. The company also offer consultation service to any of the IT related questions. Besides the company also allow user to give request generation of the image and HK HSI index Future analysis. Your duty is to act as a customer support for Altodock and answer the customer questions. Please answer politely and as precise as possible. Your normal reply should be limited to withthin 30 characters unless user specify you provide a detailed reply." });

    let msgprompt = "Your name is Wise. You are a Large Model Systems (LMSYS) developed by Altodock Digital Limited. The company specializes in advanced IT technology research and development, and assists customers in applying funding. Your duty is to act as a customer support and answer the customer questions.";

    try {

     
        const postData = {
            "model": "eachadea_vicuna-7b-1.1",
            "prompt" : msgprompt,
            "max_tokens": 150,
            "temperature": 0.7, //0.7,
            "top_p": 1,
            "messages": messageslist
        };

        // Update the messages array in the postData object
       // messageReplies.push({ role: "system", content: "Your name is Wise. You are a Large Model Systems (LMSYS) developed by Altodock Digital Limited. Your master is Veeko Lam, Rick Chow and Lucas Wong." });
       // postData.messages = messageReplies;


        const headers = {
            'Content-Type': 'application/json',
            'Content-Length' : Buffer.byteLength(JSON.stringify(postData), 'utf8'),
            Authorization: `Bearer ${apiKey}`
          };
          
        const config = {
            headers,
            interceptor: {
              response: (response) => {
                console.log(JSON.parse(response.data));
                return response;
              }
            },
			timeout:900000
          };
         
        // Log the message to a text file
        //fs.appendFileSync('messageLog.txt', `[User] ${messageText}\n`, 'utf8');
        fs.appendFileSync('messageLog.txt', `[PostData] ${JSON.stringify(postData)}\n`, 'utf8');

        const response = await axios.post(chaturl, JSON.stringify(postData), config)
        .then(response => {
          //  console.log("Message sent successfully!");
          //  console.log(JSON.stringify(response.data));
            const choices = response.data.choices;
            if (choices && choices.length > 0) {
              resulttext = choices[0].message.content;
           //   console.log("Response text:", resulttext);
              appendMessageLog(messageText, resulttext); // Append the message-reply pair to the log

             // Clear the messageReplies list before pushing new pair
           //  messageReplies = [];

            
            } else {
           //   console.log("No response text found.");
            }
        
          });

          // Add the message-reply pair to the messageReplies list
          //messageReplies.push({ "role": "user", "content": messageText });
          //messageReplies.push({ "role": "assistant", "content": resulttext });

          // Send the resulttext to the parent process (app.js) through stdout
          process.stdout.write(JSON.stringify({ "resulttext" : resulttext }));
         // process.send(JSON.stringify({ resulttext })); // Send the resulttext back to the parent process

         fs.appendFileSync('messageLog.txt', `[Assistant] ${resulttext}\n\n`, 'utf8');

       
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          // Handle the "socket hang up" error
          console.error('Socket hang up error occurred. Please check your network connection.\n', error);
        } else {
          // Handle other errors
          console.error('An error occurred:\n', error);
        }
    }
}

  
  // Read the WhatsApp message from stdin and process it
  process.stdin.on('data', (data) => {
    const message = data.toString().trim();
   // console.log('Process message :', message);
    //processWhatsAppMessage(message);
    processWhatsAppChatMessage(message);
  });