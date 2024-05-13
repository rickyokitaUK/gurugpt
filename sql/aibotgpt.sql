-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-05-13 23:43:45
-- 伺服器版本： 10.4.28-MariaDB
-- PHP 版本： 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `aibotgpt`
--

-- --------------------------------------------------------

--
-- 資料表結構 `message_log`
--

CREATE TABLE `message_log` (
  `msg_id` int(11) NOT NULL,
  `user_message` text DEFAULT NULL,
  `assistant_message` text DEFAULT NULL,
  `message_from` varchar(255) DEFAULT NULL,
  `chat_name` varchar(255) DEFAULT NULL,
  `message_author` varchar(255) DEFAULT NULL,
  `chatbot_name` varchar(255) DEFAULT NULL,
  `modified_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `message_log`
--

INSERT INTO `message_log` (`msg_id`, `user_message`, `assistant_message`, `message_from`, `chat_name`, `message_author`, `chatbot_name`, `modified_date`) VALUES
(1, 'Hi Guru', 'Hello Rick! How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:11:54'),
(2, 'What is your name?', 'I am Wise, a Large Model Systems developed by Altodock Digital Limited. How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:12:08'),
(3, 'Yes, I want to make a quotation about a e-commerce project', 'Sure, I can assist you with that. Please provide me with the details of your e-commerce project so I can help you create a quotation.', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:13:07'),
(4, 'I need a salon website, and need a ecommmerce shopping cart, there is about 10 pages for viewing, an admin system for manage the employees, how much will the site be?', 'For a custom website with your requirements, the cost can vary depending on the complexity and features you need. I recommend contacting our sales team for a detailed quote tailored to your specific needs.', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:14:58'),
(5, 'What is the cost in average?', 'Hi Rick, the average cost varies depending on the specific services or solutions you are interested in. Could you please provide more details so I can give you a more accurate estimate?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:15:19'),
(6, 'Do you know what site I need?', 'Please provide more details so I can assist you better.', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:15:40'),
(7, 'What is my name?', 'Your name is Rick Chow. How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:16:04'),
(8, 'What do I need?', 'Hello, Rick! Could you please provide more details or let me know how I can assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:16:20'),
(9, 'Please show my previous chat', 'I\'m sorry, Rick. I can\'t display your previous chat as I don\'t have access to chat history. How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 21:29:22'),
(10, 'Hi, what is your name', 'Hello Rick, my name is Wise. How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:01:38'),
(11, 'I want to do a website quotation', 'Sure, Rick! I can assist you with that. Could you please provide me with more details about the website you have in mind? This will help me give you a more accurate quotation.', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:02:08'),
(12, 'I have told u about salon website, what will be the price?', 'Hello Rick! The cost of developing a salon website can vary depending on the specific requirements and features you are looking to implement. Factors such as design complexity, functionality, e-commerce capabilities, and integrations can all impact the overall cost. \n\nTo provide you with an accurate price estimate, I would need more details about the scope of the project. Could you please provide more information about the features you would like to include in your salon website? This will help me give you a more precise estimate.', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:02:36'),
(13, 'How many pages for viewing in my website?', 'Hello Rick! To determine the number of pages on your website, you can typically count the number of individual pages or posts that are accessible to visitors. This can include home pages, about pages, product or service pages, blog posts, contact pages, etc. If you have a content management system (CMS) like WordPress, you can usually see a list of all your pages/posts within the admin dashboard. If you need further assistance or have a specific question, feel free to ask!', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:03:18'),
(14, 'I will do 10 pages', 'Hello Rick! It looks like your message might have been cut off. Could you provide more context or let me know how I can assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:03:35'),
(15, 'Do you have chat history?', 'As an AI assistant, I don\'t have the ability to retain personal data or chat history. I\'m here to provide assistance with any questions you have to the best of my abilities. How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:03:55'),
(16, 'Hi, what is your name', 'Hello! My name is Wise. How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:10:09'),
(17, 'Hi wise', 'Hello Rick! How can I assist you today?', '', 'Rick Chow Ying Kit', 'Rick Chow', 'Guru', '2024-05-13 22:37:59');

-- --------------------------------------------------------

--
-- 資料表結構 `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `chatId` varchar(255) NOT NULL,
  `message_author` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `type` enum('user','group') DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `message_log`
--
ALTER TABLE `message_log`
  ADD PRIMARY KEY (`msg_id`);

--
-- 資料表索引 `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chatId` (`chatId`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `message_log`
--
ALTER TABLE `message_log`
  MODIFY `msg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
