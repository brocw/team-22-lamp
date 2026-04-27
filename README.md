# team-22-lamp

A LAMP stack Contact Manager web application built for COP4331C.

## Members
- Isabella Cassitta
- Lawson Gober
- Ana Clara Machado Goncalves
- Christian Reyes
- Broc Weselmann

## Description

This web application allows users to register, log in, and manage contacts and colors. The front end is built with HTML, CSS, and JavaScript; the back end consists of PHP scripts that communicate with a MySQL database via `mysqli`.

## Features

- **User registration** (`LAMPAPI/Signup.php`): Creates a new account after checking for duplicate usernames. Passwords are MD5-hashed before storage.
- **User login** (`LAMPAPI/Login.php`): Authenticates against the `Users` table and returns the user's first name, last name, and ID as JSON.
- **Contact management** (`LAMPAPI/AddContact.php`, `LAMPAPI/DeleteContact.php`, `LAMPAPI/SearchContact.php`): Adds, deletes, and searches contacts stored in the `Contacts` table for the logged-in user.
- **Color management** (`LAMPAPI/AddColor.php`, `LAMPAPI/SearchColors.php`): Adds and searches color entries in the `Colors` table per user.
- **Session handling** (`js/code.js`): Manages login state via browser cookies with a 20-minute expiry. Redirects unauthenticated users to the login page.
- **Client-side password hashing** (`js/md5.js`): Passwords are MD5-hashed on the client side before being sent to the server, using the [blueimp JavaScript-MD5](https://github.com/blueimp/JavaScript-MD5) library.

## Tech Stack

- **PHP** — server-side API endpoints (`LAMPAPI/`)
- **MySQL** — database (tables: `Users`, `Contacts`, `Colors`)
- **JavaScript** — client-side logic and XHR calls to the PHP API
- **HTML / CSS** — page structure and styling
