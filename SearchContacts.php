<?php

$inData = getRequestInfo();

$searchResults = "";
$searchCount = 0;

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    returnWithError($conn->connect_error);
}
else
{
    $stmt = $conn->prepare("") #check to search First Name, Last Name, phone number, and email
    me = "%" . $inData["search"] . "%";
    $stmt->bind_param("sssss", $firstName, $lastName, $email, $phoneNumber );
    $stmt->execute();

    $result = $stmt->get_result();

    while($row = $result->fetch_assoc())
    {
        if($searchCount > 0) $searchResults .= ",";
        $searchCount++;
        $searchResults .= "" . $row["Name"] . "";
    }
    $searchCount++;
}
?>