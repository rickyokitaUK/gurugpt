<?php
header("Content-Type: application/json");

// Get the current date in the specified format
$logDate = date("Ymd");

// Log the POST message
$logFilename = "log-{$logDate}.txt";
$logData = json_encode($_POST) . PHP_EOL;

file_put_contents($logFilename, $logData, FILE_APPEND);

$HTML=<<<HTML
	{"id": "eachadea_vicuna-7b-1.1/completions", "object": "model", "owned_by": "user", "permission": []}
HTML;

echo $HTML;
	
?>