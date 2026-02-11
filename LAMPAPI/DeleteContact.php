<?php
    #{
        #"contactId": "1",
        #"userId": "1"
    #}
        error_reporting(E_ALL);
        ini_set('display_errors', 1);

        $inData = getRequestInfo();

        // Validate required fields
        if (!isset($inData["id"]) || !isset($inData["userId"])) {
                returnWithError("Missing required fields");
                exit;
        }

        $contactId = $inData["id"];
        $userId = $inData["userId"];

        $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
        if ($conn->connect_error) 
        {
                returnWithError($conn->connect_error);
                exit;
        } 
        else
        {
                $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");

                if (!$stmt) {
                        returnWithError($conn->error);
                        exit;
                }

                $stmt->bind_param("ii", $contactId, $userId);
                $stmt->execute();

                if ($stmt->affected_rows > 0)
                {
                        returnWithInfo("Contact deleted successfully");
                }
                else
                {
                        returnWithError("No contact found to delete or you don't have permission");
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