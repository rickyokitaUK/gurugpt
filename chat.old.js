const axios = require('axios');

// Replace these values with your own API credentials
const apiKey = 'altodock.com.hk.3ed74137e6f3f028c0746127b957043aecc173c2d0fb99e23a81298be3ed45ab';
const chatId = 'Altodock'; // replace with your actual chat ID obtained from ChatGPT dashboard
const messageText = 'What can you do, rubbish?';
//const url = 'https://rickchow.info/whatsapp/test.php';
const url = 'http://chatbot.altodock.com:5001/v1/models/eachadea_vicuna-7b-1.1/completions';
//const url = 'http://chatbot.altodock.com:5001/v1/models/eachadea_vicuna-7b-1.1/chat/completions';

// Create a JSON object for the POST payload
/*const postData = {
    access_token: apiKey,
    chat_id: chatId,
    content: messageText
  };*/

  
 /* const postData = {
    "model": "text-davinci-003",
    "prompt": messageText,
    "max_tokens": 20,
    "temperature": 0,
    "top_p": 1
   
};


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
  };*/
  

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
            "max_tokens": 1000,
            "temperature": 0.7,
            "top_p": 0.1,
            "top_k":40,
            "typical_p":1
        };

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
    

  
  // Read the WhatsApp message from stdin and process it
  process.stdin.on('data', (data) => {
    const message = data.toString().trim();
   // console.log('Process message :', message);
    processWhatsAppMessage(message);
  });