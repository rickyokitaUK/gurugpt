const fs = require('fs');
const axios = require('axios');
const config = require('./config'); // Import the config.js file

const qrcode = require('qrcode-terminal');
const { MessageMedia } = require('whatsapp-web.js');

const { Client } = require('whatsapp-web.js');
const client = new Client({
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

// broadcast js
const schedule = require('node-schedule');
const broadcast = require('./broadcast'); // Import your broadcast module
const broadcastScheduleConfigFile = "broadcastSchedule.json";
 

// Require child_process module for spawning chat.js as a separate process
const { spawn } = require('child_process');

// Define a whitelist to store the chat names or message.from values
const whitelist = new Set();

const timeoutMax = 180000; // Adjust the timeout value as needed


/** MAIN **/
// Assuming client.initialize() needs to be awaited
async function startClient() {
  try {
    await client.initialize();
  } catch (error) {
    console.error(error);
    // Optionally add more detailed logging here
  }
}

startClient();

async function testingSendMessageToChatbot(message) {
  const apiKey = '-- SECRET KEY --'; // Replace with your OpenAI API key
  const url = config.chatUrl; //'https://api.openai.com/v1/chat/completions';
  const messagePromptPath = config.messagePromptPath;
  let messagePrompt = config.messagePrompt;


  if (fs.existsSync(messagePromptPath)) {
    messagePrompt = fs.readFileSync(messagePromptPath, 'utf8');
  }

  try {

    var messageslist = [];

    messageslist.push({ role: "system", content: messagePrompt}); // latest message 
    messageslist.push({ role: "user", content: message}); // latest message 

      const postData = {
        model: "gpt-3.5-turbo",
     //   prompt : messagePrompt,
        max_tokens: 150,
        temperature: 0.7, //0.7,
        top_p: 1,
        messages: messageslist
    };

      const response = await axios.post(url,postData, {
          headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
          }
      });

      console.log("Chatbot response:", response.data.choices[0].message.content);
  } catch (error) {
      console.error("Error communicating with chatbot:", error.response?.data || error.message);
  }
}

// Replace 'Hello, chatbot!' with the message you want to send
//testingSendMessageToChatbot('Hello, Guru!');

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});


client.on('ready', () => {
    console.log('Client is ready!');

   broadcast.init(client); // Pass the client instance to the init function
    
    // Fetch subscribed chat IDs and populate the whitelist
    broadcast.fetchSubscribedChatIdsFromDatabase().then((subscribedChatIds) => {
        subscribedChatIds.forEach((subscriber) => {
            whitelist.add(subscriber.chatId); // Add the chatId to the whitelist
        });
    }).catch((error) => {
        console.error('Error fetching subscribed chat IDs:', error);
    });
   // sendBroadcastMessage(broadcastMessage);


    // Read the broadcast schedule from the configuration file
    const broadcastScheduledTimes = JSON.parse(fs.readFileSync(broadcastScheduleConfigFile));
    updateBroadcastJobs(broadcastScheduledTimes);

    
});


// Function to update the broadcast jobs based on the updated schedule times
function updateBroadcastJobs(updatedScheduleTimes) {
  // Clear all existing broadcast jobs
  for (const job in schedule.scheduledJobs) schedule.scheduledJobs[job].cancel();
 // schedule.clear(job => job.name.startsWith('broadcast'));

  // Loop through the updated scheduled times and create new broadcast jobs
  updatedScheduleTimes.forEach((scheduledTime, index) => {
      const [hour, minute, second] = scheduledTime.split(':');

      // Create a Recurrence object for the updated scheduled time
      const jobTime = new schedule.RecurrenceRule();
      jobTime.hour = Number(hour);
      jobTime.minute = Number(minute);
      jobTime.second = Number(second);

    //  console.log(jobTime);

      // Schedule the updated broadcast
      const job = schedule.scheduleJob('broadcast_${index}', jobTime, async () => {
          
          await broadcast.sendBroadcastMessageToSubscribed(config.broadcastMessage);

          // You can add logging or other actions here if needed
      });
  });
}

// Watch for changes in the configuration file
fs.watchFile(broadcastScheduleConfigFile, (curr, prev) => {
  console.log('Configuration file has changed.');

  // Read the updated schedule times from the configuration file
  fs.readFile(broadcastScheduleConfigFile, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading configuration file:', err);
          return;
      }

      try {
          const updatedScheduleTimes = JSON.parse(data);
          updateBroadcastJobs(updatedScheduleTimes);

          console.log('Broadcast scheduler updated with new schedule times.');
      } catch (error) {
          console.error('Error parsing updated schedule times:', error);
      }
  });
});



// Function to send message to chat.js process
/*function sendMessageToChatJS(message) {
  const chatJSProcess = spawn('node', ['chat.js']);
  chatJSProcess.stdin.write(message);
  chatJSProcess.stdin.end();
}*/



async function sendMessageToChatJS(messageBody, messageFrom, chatName, messageAuthor)  {
    return new Promise((resolve, reject) => {
      const chatJSProcess = spawn('node', ['chat.js']);
    
      // Get the chat object based on the messageFrom (chat ID)
      client.getChatById(messageFrom).then(chat => {
      // Get the chat object based on the messageFrom (chat ID)
      // const chat =  client.getChatById(messageFrom);

      //  console.log(chat);

        const chatId = chat.id._serialized; // Add this line
        const userId = messageFrom.split('@')[0]; // Add this line
        const groupChat = client.getChatById(chatId);
    
        // Listen for stdout data from chat.js
        chatJSProcess.stdout.on('data', data => {
          const output = data.toString().trim();
          try {
            const { resulttext } = JSON.parse(output);
            console.log("chat.js resulttxt:", resulttext);
            // Process the resulttext as needed
            resolve(resulttext); // Resolve the promise with the resulttext
          } catch (error) {
            console.log("chat.js output:", output);
            // Handle non-resulttext output if needed
            resolve(output); // Resolve the promise with the resulttext
          }
        });
    
        // Listen for stderr data from chat.js
        chatJSProcess.stderr.on('data', data => {
          console.error(`chat.js error: ${data}`);
          reject(data.toString().trim()); // Reject the promise with the error message
        });
    
        // Listen for the 'close' event from chat.js
        chatJSProcess.on('close', code => {
          console.log(`chat.js process exited with code ${code}`);
        });

        // Create the object with message data
        const messageData = {
          messageBody: messageBody,
          messageFrom: messageFrom,
          chatName: chatName,
          messageAuthor: messageAuthor,
          chatId:chatId,
          userId:userId,
          groupChat:groupChat
          
        };

        const jsonString = JSON.stringify(messageData);
    
        console.log(`chat.js write message: ${jsonString}`);
        chatJSProcess.stdin.write(jsonString);
        chatJSProcess.stdin.end();
    
        // Handle the case when no resulttext is received
        setTimeout(() => {
          reject('No resulttext received within the specified timeout.'); // Reject the promise with an error message
        }, timeoutMax); // Adjust the timeout value as needed

      });

    });
}

async function sendMessageWithMedia(chat) {
    try {
      const media = await MessageMedia.fromUrl('https://rickchow.info/blog/wp-content/uploads/2023/06/logo01.png');
      chat.sendMessage(media);
    } catch (error) {
      console.error(error);
    }
}


async function sendMessageWithSD(chat, promptMsg) {
 
		try {    
		
        const postData = {
          "prompt": "(Masterpiece:1.1), detailed, intricate, colorful, "+promptMsg,
          "seed": -1,
          "sampler_name": "DDIM",
          "steps": 30,
          "width": 512,
          "height": 512,
          "restore_faces": true,
          "negative_prompt": "(worst quality, low quality:1.3, NSFW:2)"
        }

        const headers = {
          'Content-Type': 'application/json',
          'Content-Length' : Buffer.byteLength(JSON.stringify(postData), 'utf8')
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
          
        const sdurl = config.sdurl;
        const response = await axios.post(sdurl, JSON.stringify(postData), config)
        .then(response => {
          //console.log(response);
          const base64Image = response.data.images[0];
          const media = new MessageMedia('image/png', base64Image);
          chat.sendMessage(media);
        
          });

		   
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
  
 
client.on('message', async message => {
	console.log(message.body);
    let chat = await message.getChat(); // Obtain the chat object from the incoming message

    if(message.hasMedia) {
        try{
            const media = await msg.downloadMedia();
            // do something with the media data here
            console.log(media.message.body);
        } catch (error) {
            console.log("Unidentified media - Sticker detected");
            console.error(error);
        }
    }

    if(message.body === '!ping') {
		message.reply('pong');
        //client.sendMessage(message.from, 'pong');
	}
    if(message.body === '!image'){
         // Call the async function
         sendMessageWithMedia(chat);
    }

     // Check if the user wants to enable AI mode
    const lowercaseBody = message.body.toLowerCase();
    if (lowercaseBody === 'ai on' || lowercaseBody === 'hey wise!') {
        // Add the chat name or message.from value to the whitelist
        whitelist.add(chat.name.trim() || message.from.trim());
        message.reply('AI mode enabled.');
    }

    // Check if the user wants to disable AI mode
    if (lowercaseBody === 'ai off' || lowercaseBody === 'thanks wise!') {
        // Remove the chat name or message.from value from the whitelist
        whitelist.delete(chat.name.trim() || message.from.trim());
        message.reply('AI mode disabled.');
    }

      // get the author from contact group
      const contact =  await message.getContact();
      const messageAuthor = contact.pushname
     

      // Log the message to a text file
    console.log("message.from : ", message.from, " author:", messageAuthor);
    console.log("Chat Name :" ,chat.name);

    console.log("Whitelist" , whitelist);

    //if (chat.isGroup && chat.name.includes('Trade28') || message.from.includes('60319421') || message.from.includes('51912505')) {
    // Check if the chat is whitelisted (AI mode enabled)
    if ((whitelist.has( chat.name.trim()) || whitelist.has(message.from.trim())) 
        && lowercaseBody !== 'ai on' && lowercaseBody !== 'hey wise!' 
        && lowercaseBody !== 'ai off' && lowercaseBody !== 'thanks wise!') {
        try {            
              console.log("WhiteList Accepted. Ready for chat");
              fs.appendFileSync('messageLog.txt', `[User] ${message.from} ${chat.name} : ${message.body}\n`, 'utf8');

                // Send the WhatsApp message to chat.js process and get the resulttext
           		let resulttext = "";
              if(message.body.match(/draw.*of/)){
                const prompttxt = message.body.split('of')[1].trim();
                const messageDrawContent = "please provide details and vivid description of " +prompttxt+" and limit the reply less than 150 words";
                resulttext = await sendMessageToChatJS(messageDrawContent, message.from, chat.name, messageAuthor);
                sendMessageWithSD(chat,resulttext);
              }else{
                resulttext = await sendMessageToChatJS(message.body, message.from, chat.name, messageAuthor);
              }
					
                const finalResulttext = resulttext.startsWith('?') ? resulttext.substring(1) : resulttext;
                const trimmedResulttext = finalResulttext.trim(); // Remove leading/trailing whitespace
                console.log("message.reply = ", trimmedResulttext);
                client.sendMessage(message.from, trimmedResulttext);
                // Process the resulttext as needed
            } catch (error) {
                console.error("An error occurred:", error);
                // Handle the error
            }
    }else{
      console.log("Permission Denied. AI chatting blocked");
    }

});
 