<?php
        #error_reporting(E_ALL);
        #ini_set('display_errors', 1);

        $inData = getRequestInfo();

        // Validate required fields
        if (!isset($inData["search"]) || !isset($inData["userId"])) {
                returnWithError("Missing required fields");
                exit;
        }

        $searchResults = "";
        $searchCount = 0;

        $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
        if ($conn->connect_error) 
        {
                returnWithError($conn->connect_error);
                exit;
        } 
        else
        {
                // Search across FirstName, LastName, Email, PhoneNumber, or combined full name
                $stmt = $conn->prepare("SELECT ID, FirstName, LastName, PhoneNumber, Email FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ? OR CONCAT(FirstName, ' ', LastName) LIKE ? OR Email LIKE ? OR PhoneNumber LIKE ?) AND UserID=?");

                if (!$stmt) {
                        returnWithError($conn->error);
                        exit;
                }

                $searchTerm = "%" . $inData["search"] . "%";
                $stmt->bind_param("sssssi", $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $inData["userId"]);
                $stmt->execute();

                $result = $stmt->get_result();

                while($row = $result->fetch_assoc())
                {
                        if($searchCount > 0)
                        {
                                $searchResults .= ",";
                        }
                        $searchCount++;
                        $searchResults .= '{"id":' . $row["ID"] . ',"firstName":"' . $row["FirstName"] . '","lastName":"' . $row["LastName"] . '","phone":"' . $row["PhoneNumber"] . '","email":"' . $row["Email"] . '"}';
                }

                if($searchCount == 0)
                {
                        returnWithError("No Records Found");
                }
                else
                {
                        returnWithInfo($searchResults);
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
                $retValue = '{"results":[],"error":"' . $err . '"}';
                sendResultInfoAsJson($retValue);
        }

        function returnWithInfo($searchResults)
        {
                $retValue = '{"results":[' . $searchResults . '],"error":""}';
                sendResultInfoAsJson($retValue);
        }
?>