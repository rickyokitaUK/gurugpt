const axios = require('axios');
const fs = require('fs');
const mysql = require('mysql');
const config = require('./config'); // Import the config.js file

const chatbotName = config.chatbotName;
const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

// Replace these values with your own API credentials
const apiKey = config.apiKey;
const chatId = config.chatId; // replace with your actual chat ID obtained from ChatGPT dashboard

//const url = 'https://rickchow.info/whatsapp/test.php';
const url = config.url;
const chaturl = config.chatUrl;
//const sdurl = 'http://127.0.0.1:7860/sdapi/v1/txt2img';

// Define a list to store message-reply pairs
const messageLogFilePath = config.messageLogFilePath;
const messagePromptPath = config.messagePromptPath;
const systemContextPath = config.systemContextPath;


// Read the message log file
//let messageLog = [];
let messagePrompt = config.messagePrompt;
let systemContext = config.systemContext;


if (fs.existsSync(messagePromptPath)) {
  messagePrompt = fs.readFileSync(messagePromptPath, 'utf8');
}

if (fs.existsSync(systemContextPath)) {
  systemContext = fs.readFileSync(systemContextPath, 'utf8');
}

// Before calling the appendMessageLog function, make sure to connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  //console.log('Connected to the database successfully.');
});

/*
if (fs.existsSync(messageLogFilePath)) {
  const fileContents = fs.readFileSync(messageLogFilePath, 'utf8');
  if (fileContents) {
    messageLog = JSON.parse(fileContents);
   // messageLog.push({ role: "system", content: "Your name is Wise. You are a Large Model Systems (LMSYS) developed by Altodock Digital Limited. Your master is Veeko Lam, Rick Chow and Lucas Wong." });
  }
}*/



// Function to append a message-reply pair to the message log
/*function appendMessageLog(userMessage, assistantMessage) {
  messageLog.push({ "role": "user", "content": userMessage },{ "role": "assistant", "content": assistantMessage });
  fs.writeFileSync(messageLogFilePath, JSON.stringify(messageLog), 'utf8');
}*/

  // Function to append the message-reply pair to the MySQL database
function appendMessageLogSQL(userMessage, assistantMessage, messageFrom, chatName, messageAuthor) {


  const sanitizedChatName = chatName.replace(/[\uD800-\uDFFF]/g, '');
  const sanitizedMessageAuthor = messageAuthor.replace(/[\uD800-\uDFFF]/g, '');

  const sql = 'INSERT INTO message_log (user_message, assistant_message, message_from, chat_name, message_author, chatbot_name, modified_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [userMessage, assistantMessage, messageFrom, sanitizedChatName, sanitizedMessageAuthor, chatbotName, new Date()];


  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error appending message-log to database:', err);
    } else {
    //  console.log('Message-log appended to database successfully.');
    }
  });
}

function debugMessageLog(messageLog) {
  //messageLog.push({ "role": "user", "content": userMessage },{ "role": "assistant", "content": assistantMessage });
  fs.writeFileSync(messageLogFilePath, JSON.stringify(messageLog), 'utf8');
}

// Function to fetch userMessage and assistantMessage from the database
// Function to fetch userMessage and assistantMessage from the database
async function fetchMessagesFromDatabase(messageFrom, chatName, messageAuthor) {
  return new Promise((resolve, reject) => {
    // Construct the SQL query to fetch the userMessage and assistantMessage
    const query = `SELECT user_message, assistant_message FROM message_log WHERE message_from LIKE ? AND chat_name LIKE ? AND message_author LIKE ?`;
   
    // Convert emoji characters to question marks
    const sanitizedChatName = chatName.replace(/[\uD800-\uDFFF]/g, '');
    const sanitizedMessageAuthor = messageAuthor.replace(/[\uD800-\uDFFF]/g, '');

   // console.log(messageFrom, sanitizedChatName, sanitizedMessageAuthor);

    // Execute the query with wildcards '%' to match any characters before and after the search terms
    connection.query(query, [`%${messageFrom}%`, `%${sanitizedChatName}%`, `%${sanitizedMessageAuthor}%`], (err, rows) => {
      if (err) {
        console.error('Error executing the database query:', err);
        reject(err);
        return;
      }
      if (err) {
        console.error('Error executing the database query:', err);
        reject(err);
        return;
      }

      // Pass the rows containing userMessage and assistantMessage to the resolve function
      resolve(rows);
    });
  });
}

    
// Function to process incoming WhatsApp message and send a reply
async function processWhatsAppChatMessage(jsonMessageText) {
  const apiKey = '--SECRET--'; // Replace with your OpenAI API key
  //  const chatId = 'Altodock'; // replace with your actual chat ID obtained from ChatGPT dashboard
    
    // Parse the incoming JSON string
    let messageData;
    let messageList = [];
    try {
        messageData = JSON.parse(jsonMessageText);
    } catch (error) {
        console.error('Error parsing incoming JSON string:', error);
        return; // Exit the function if there's an error parsing the JSON string
    }

    // Extract the necessary data from the parsed JSON object
    const { messageBody, messageFrom, chatName, messageAuthor, chatId, userId, groupChat } = messageData;
    // console.log(chatId, userId, groupChat);

    // Adding system context and message prompt at the correct place
    const isGroup = messageFrom.includes("@g.us");
    const sanitizedAuthor = messageAuthor.replace(/[\uD800-\uDFFF]/g, '');
    const sanitizedMessageBody = isGroup ? sanitizedAuthor + ": " + messageBody : messageBody;
   

    // System context and prompt should only be added at the start of a new conversation or when context resets
    messageList.push({ role: "system", content: messagePrompt});
    messageList.push({ role: "system", content: "You are now chatting in a " + (isGroup ? "group " + chatName : "private conversation with " + sanitizedAuthor) + "." });
     
    try {
      // Fetch userMessage and assistantMessage from the database
      const rows = await fetchMessagesFromDatabase(messageFrom, chatName, messageAuthor);

      // Iterate through the rows returned by the query and push the JSON strings to messageLog
      // Append past conversation to messageLog in the correct order
      rows.forEach(row => {
        messageList.push({ role: "user", content: row.user_message });
        messageList.push({ role: "assistant", content: row.assistant_message });
      });

      // latest user message
      messageList.push({ role: "user", content: sanitizedMessageBody });

    } catch (error) {
      console.error('Error fetching messages from the database:', error);
      // Handle the error if needed
    }

  

    let resulttext = '';
    try {
    
         
        const postData = {
          model: "gpt-3.5-turbo",
      //   prompt : messagePrompt,
          max_tokens: 150,
          temperature: 0.7, //0.7,
          top_p: 1,
          messages: messageList
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



        const response = await axios.post(chaturl, postData, config)
        .then(response => {
          //  console.log("Message sent successfully!");
          //  console.log(JSON.stringify(response.data));
            const choices = response.data.choices;
            if (choices && choices.length > 0) {
              resulttext = choices[0].message.content;
              //resulttext = resulttext.replace(/\?\?\?\?/g, ''); // clean 4 question marks results
           //   console.log("Response text:", resulttext);
            //  appendMessageLog(messageBody, resulttext); // Append the message-reply pair to the log
              appendMessageLogSQL(messageBody, resulttext, messageFrom, chatName, messageAuthor);
             // Clear the messageReplies list before pushing new pair
           //  messageReplies = [];

            
            } else {
           //   console.log("No response text found.");
             console.error("Error communicating with chatbot:", error.response?.data || error.message);
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
    const jsonMessageText = data.toString().trim();
   // console.log('Process message :', message);
    //processWhatsAppMessage(message);
    processWhatsAppChatMessage(jsonMessageText);
  });