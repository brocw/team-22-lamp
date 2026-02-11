<?php
	#error_reporting(E_ALL);
	#ini_set('display_errors', 1);
	
	$inData = getRequestInfo();
	
	// Validate required fields
	if (!isset($inData["id"]) || !isset($inData["userId"]) || 
	    !isset($inData["firstName"]) || !isset($inData["lastName"]) || 
	    !isset($inData["phone"]) || !isset($inData["email"])) {
		returnWithError("Missing required fields");
		exit;
	}
	
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError($conn->connect_error);
		exit;
	} 
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, PhoneNumber=?, Email=? WHERE ID=? AND UserID=?");
		
		if (!$stmt) {
			returnWithError($conn->error);
			exit;
		}
		
		$stmt->bind_param("ssssii", $inData["firstName"], $inData["lastName"], $inData["phone"], $inData["email"], $inData["id"], $inData["userId"]);
		$stmt->execute();
		
		if ($stmt->affected_rows > 0)
		{
			returnWithInfo("Contact updated successfully");
		}
		else
		{
			returnWithError("No contact found to update or no changes made");
		}
		
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError($err)
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	function returnWithInfo($msg)
	{
		$retValue = '{"message":"' . $msg . '","error":""}';
		sendResultInfoAsJson($retValue);
	}
?>