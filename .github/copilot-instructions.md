# Copilot Instructions for LAMP Stack API

## Project Overview
This is a PHP backend API for a color contact management application built on the LAMP stack. Three endpoint files handle user authentication, contact management, and color searching.

## Architecture Pattern
- **Single-File Endpoints**: Each PHP file is a standalone API endpoint (`AddColor.php`, `Login.php`, `SearchColors.php`)
- **Direct Database Queries**: Each file manages its own MySQL connection using procedural MySQLi (not ORM)
- **JSON API**: All endpoints accept JSON via `php://input` and return JSON responses

## Database Connection
All files use identical connection credentials hardcoded:
```php
$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
```
**Database**: `COP4331` on localhost. When modifying queries, ensure table and column names match (e.g., `Contacts`, `Users`, `Colors`, `UserId`, `Login`).

## Common Response Pattern
Every endpoint follows this pattern:
1. Parse JSON input via `getRequestInfo()`
2. Connect to MySQL
3. Prepare and execute statement with parameterized queries (always use `bind_param()`)
4. Return either `returnWithError()` or endpoint-specific info function with JSON header

Example from `Login.php`:
```php
function returnWithInfo( $firstName, $lastName, $id ) {
    $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
    sendResultInfoAsJson( $retValue );
}
```

## Key Patterns

### Input Handling
All endpoints extract data from JSON body:
```php
$inData = getRequestInfo();
// Access via: $inData["fieldName"]
```

### Prepared Statements (Required)
Always use parameterized queries to prevent SQL injection:
```php
$stmt = $conn->prepare("SELECT ... WHERE Login=? AND Password=?");
$stmt->bind_param("ss", $inData["login"], $inData["password"]);
```
The type string (first param to `bind_param`) follows: `s`=string, `i`=integer, `d`=double

### Error Responses
All errors return with error field set and appropriate empty default values:
```json
{"id":0,"firstName":"","lastName":"","error":"No Records Found"}
```

### Successful Responses
Include relevant data plus `"error":""`. Response structure varies by endpoint:
- **Login**: `{id, firstName, lastName, error}`
- **SearchColors**: `{results: [...], error}`
- **AddColor**: `{error}` (no data returned)

## File-Specific Notes

### `Login.php`
- Fetches user by login/password credentials
- Returns user ID, first name, last name
- Common failure: "No Records Found" when credentials don't match

### `SearchColors.php`
- Searches colors by partial name match (`LIKE` with wildcards)
- Filters by userId (user-scoped results)
- Returns array of color names in results field
- Returns error if count is 0

### `AddColor.php`
- Inserts new color contact for user
- Requires contact name and userId
- Only returns error field (success = `"error":""`)

## Conventions to Maintain
- Use `mysqli` prepared statements for all queries
- Always call `$stmt->close()` and `$conn->close()` in else blocks
- Return JSON with `header('Content-type: application/json')`
- Include helper functions in every file (getRequestInfo, sendResultInfoAsJson, returnWithError, + endpoint-specific return functions)
- Use string concatenation (not interpolation) for JSON construction
- Parameter binding type string format: `"ss"` for two strings, `"is"` for int+string, etc.

## When Adding New Endpoints
1. Create new `.php` file with same structure: input parsing → DB connection → query → response
2. Include all four helper functions
3. Use prepared statements with `bind_param()`
4. Ensure response JSON includes error field
5. Test with client passing correct JSON schema
