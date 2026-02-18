<?php
        error_reporting(E_ALL);
        ini_set('display_errors', 1);

        $inData = getRequestInfo();

        $firstName = $inData["firstName"];
        $lastName = $inData["lastName"];
        $email = $inData["email"];
        $phoneNumber = $inData["phoneNumber"];
        $userId = $inData["userId"];

        $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
        if ($conn->connect_error) 
        {
                returnWithError( $conn->connect_error );
                exit;
        } 
        else
        {
                // Check for duplicate email
                $stmtCheck = $conn->prepare("SELECT ID FROM Contacts WHERE Email=? AND UserID=?");
                $stmtCheck->bind_param("si", $email, $userId);
                $stmtCheck->execute();
                $stmtCheck->store_result();
                if ($stmtCheck->num_rows > 0)
                {
                        $stmtCheck->close();
                        $conn->close();
                        returnWithError("emailExists");
                        exit;
                }
                $stmtCheck->close();

                // Check for duplicate phone
                $stmtCheck2 = $conn->prepare("SELECT ID FROM Contacts WHERE PhoneNumber=? AND UserID=?");
                $stmtCheck2->bind_param("si", $phoneNumber, $userId);
                $stmtCheck2->execute();
                $stmtCheck2->store_result();
                if ($stmtCheck2->num_rows > 0)
                {
                        $stmtCheck2->close();
                        $conn->close();
                        returnWithError("phoneExists");
                        exit;
                }
                $stmtCheck2->close();

                $stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Email, PhoneNumber, UserID) VALUES(?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssi", $firstName, $lastName, $email, $phoneNumber, $userId);
                $stmt->execute();
                $stmt->close();
                $conn->close();
                returnWithInfo( "Contact has been added" );
        }

        function getRequestInfo()
        {
                return json_decode(file_get_contents('php://input'), true);
        }

        function sendResultInfoAsJson( $obj )
        {
                header('Content-type: application/json');
                echo $obj;
        }

        function returnWithError( $err )
        {
                $retValue = '{"error":"' . $err . '"}';
                sendResultInfoAsJson( $retValue );
        }

        function returnWithInfo( $msg )
        {
                $retValue = '{"message":"' . $msg . '","error":""}';
                sendResultInfoAsJson( $retValue );
        }
?>
