  // Schedule the broadcast message at a specific time or interval
  // For example, using a scheduler library like 'node-schedule'
const mysql = require('mysql');
const config = require('./config'); // Import the config.js file

const chatbotName = config.chatbotName;
const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});
let whatsappClient; // Define a variable to store the client instance


// Function to initialize the client instance in this module
function init(client) {
  whatsappClient = client;
}

// Define an array to store subscribed chat IDs (users or groups)
//const subscribedChatIds = ["user1_id", "group1_id", "user2_id"];

async function fetchSubscribedChatIdsFromDatabase() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT chatId, first_name, last_updated, type FROM subscriptions';
        
        connection.query(query, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const chatIds = rows; //rows.map(row => row.chatId);
            resolve(chatIds);
        });
    });
}


// Function to broadcast a message to subscribed users/groups
/*async function broadcastMessageToSubscribed(messageBody) {
    try {
        const subscribedChatIds = await fetchSubscribedChatIdsFromDatabase();

        const promises = [];

        for (const chatId of subscribedChatIds) {
            const promise = sendMessageToChatJS(messageBody, chatId, "ChatName", "MessageAuthor");
            promises.push(promise);
        }

        return Promise.all(promises);
    } catch (error) {
        throw error;
    }
}
*/


// Load necessary modules and setup database connection

// Define a function to send broadcast messages
async function sendBroadcastMessageToSubscribed(message) {
    try {
      // Retrieve the list of subscribed users from the database
      const subscribers = await fetchSubscribedChatIdsFromDatabase();

      // Check if subscribers is an array
      if (!Array.isArray(subscribers)) {
          console.error('No Subscribers');
          return;
      }
  
      // Iterate through subscribers and send the message
      subscribers.forEach(async (subscriber) => {
        const chatId = subscriber.chatId;

        let username = subscriber.first_name;
        if (subscriber.type === "group"){
          username = subscriber.first_name !== "" ? username + " Group" : "All";
        }
        const outputmsg = message.replace(/{__USER__}/g, username);
        
        //check time difference
        const currentTime = new Date();
        const lastUpdatedTime = new Date(subscriber.last_updated); // Convert last_updated to Date object

        // Calculate the time difference in milliseconds
        const timeDifference = currentTime - lastUpdatedTime;
        const minTimeDifference = config.minTimeDifference * 60 * 60 * 1000;

        //console.log(subscriber);
        if (timeDifference >= minTimeDifference || config.debug) {

          if (isGoodTimeToSend(chatId) || config.debug) {
            await sendMessageToUser(chatId, outputmsg);

            // Update the last sent timestamp for this user
            await updateLastSentTime(chatId);
          }else{
            console.log("No boardcast message sent out of office hours")
          }
        }else{
           console.log(`Not sending broadcast to user ${subscriber.first_name} (${chatId}) due to time difference.(Within ${config.minTimeDifference} hours)`); 
        }
       
      });
    } catch (error) {
      console.error('Error sending broadcast message:', error);
    }
}

  // Define a function to get user's timezone from the database
async function getUserTimezoneFromDatabase(chatId) {
  return new Promise((resolve, reject) => {
      const query = 'SELECT timezone FROM subscriptions WHERE chatId = ?';

      connection.query(query, [chatId], (err, rows) => {
          if (err) {
              console.error('Error fetching user timezone from the database:', err);
              reject(err);
              return;
          }

          if (rows.length > 0) {
              const timezone = rows[0].timezone;
              resolve(timezone);
          } else {
              resolve(null); // Return null if no timezone information found
          }
      });
  });
}
  
  // Define a function to determine if it's a good time to send a message
  function isGoodTimeToSend(chatId) {
    // Implement your logic here
    // For example, you can check the local time of the user and their preferences

    // Get the current time
    const currentTime = new Date();
    
    // Initialize userLocalTime as null
    let userLocalTime = null;
    
    // Implement your logic to get user's timezone and local time
    // For example, you might have this information in your database
    const userTimezone = getUserTimezoneFromDatabase(chatId); // Replace with your database query

    console.log(userTimezone);
    if (!userTimezone || typeof userTimezone !== 'string' || userTimezone.trim() === '') {
        console.log(`User with chatId ${chatId} has no timezone information. Setting default to Hong Kong.`);
        userLocalTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
    } else {
        // Calculate the user's local time based on their timezone
        userLocalTime = new Date().toLocaleString('en-US', { timeZone: userTimezone });
    }

    // Check if the user's local time is within the defined time window
    userLocalTime = new Date(userLocalTime);
    return userLocalTime.getHours() >= config.startHour && userLocalTime.getHours() <= config.endHour;
  }

  // Define a function to get a list of subscribed users
  async function getSubscribedUsers() {
    // Implement your database query here to fetch subscribed users
    // Return an array of user objects containing chatId and other info
  }
  
// Define a function to send a message to a user
async function sendMessageToUser(chatId, message) {
  try {

    if (!whatsappClient) {
      console.error('WhatsApp client is not initialized.');
      return;
    }

    // Get the chat object based on the chatId
    console.log(chatId, message);
    const chat = await whatsappClient.getChatById(chatId);

    // Send the message using the chat object
    await chat.sendMessage(message);

    console.log(`Message sent successfully to chat ${chatId}`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
  
  // Define a function to update the last sent timestamp for a user
// Define a function to update the last sent timestamp for a user
async function updateLastSentTime(chatId) {
  return new Promise((resolve, reject) => {
      const query = 'UPDATE subscriptions SET last_updated = NOW() WHERE chatId = ?';

      connection.query(query, [chatId], (err, result) => {
          if (err) {
              console.error('Error updating last sent timestamp:', err);
              reject(err);
          } else {
              console.log(`Last sent timestamp updated for user with chatId ${chatId}`);
              resolve();
          }
      });
  });
}
  

  
 
  
module.exports = {
    init,
    sendBroadcastMessageToSubscribed,
    fetchSubscribedChatIdsFromDatabase
    // Other exported functions or variables
};
  
  
  
  