// LOCAL_ONLY_TOGGLE: revert to production when told
const urlBase = 'http://localhost:8000/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	// let tmp = {login:login,password:password};
	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function createAccount()
{
	let firstName = document.getElementById("newAccountFirstName").value;
	let lastName = document.getElementById("newAccountLastName").value;
	let login = document.getElementById("newAccountUsername").value;
	let password = document.getElementById("newAccountPassword").value;
	var hash = md5( password );
	var tmp = {firstName: firstName, lastName: lastName, login: login, password: hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Signup.' + extension;

	document.getElementById("loginResult").innerHTML = "";

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse( xhr.responseText );
				if( jsonObject.error && jsonObject.error.length > 0 )
				{
					document.getElementById("loginResult").innerHTML = jsonObject.error;
					return;
				}
				document.getElementById("loginResult").innerHTML = "Account created. Redirecting...";
				setTimeout(function() { window.location.href = "login.html"; }, 800);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	// LOCAL_PREVIEW_BYPASS_START (revert for production)
	let host = window.location.hostname;
	let isLocal = window.location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1";
	// LOCAL_PREVIEW_BYPASS_END (revert for production)
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		// LOCAL_PREVIEW_BYPASS_START (revert for production)
		if( isLocal )
		{
			userId = 1;
			firstName = "Local";
			lastName = "Preview";
		}
		else
		{
			window.location.href = "index.html";
		}
		// LOCAL_PREVIEW_BYPASS_END (revert for production)
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact()
{
	let firstName = document.getElementById("addContactFirstName").value;
	let lastName = document.getElementById("addContactLastName").value;
	let phoneNumber = document.getElementById("addContactPhone").value;
	let email = document.getElementById("addContactEmail").value;

	let tmp = {firstName:firstName, lastName:lastName, email:email, phoneNumber:phoneNumber,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("contactAddResult").innerHTML = "Contact has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
	
}

function deleteContact(contactId)
{
	let tmp = {userId:userId, contactId:contactId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/DeleteContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("contactDeleteResult").innerHTML = "Contact has been deleted";
				searchContact();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactDeleteResult").innerHTML = err.message;
	}
}

function toggleAddContactDiv(){
	let addContactDiv = document.getElementById("addContactDiv");
	if (addContactDiv.style.display === "none" || addContactDiv.style.display === "") {
		addContactDiv.style.display = "flex";
	} else {
		addContactDiv.style.display = "none";
	}
}

function searchContact()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let contactList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("contactSearchResult").innerHTML = "Contact(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					let contact = jsonObject.results[i];
					contactList += contact.firstName + " " + contact.lastName +
						" | " + contact.phone + " | " + contact.email +
						" <button type=\"button\" class=\"deleteContactButton\" data-contact-id=\"" + contact.id + "\" onclick=\"deleteContact(" + contact.id + ");\">" +
						"<img src=\"images/managerButtons/oceanXButton.png\" alt=\"Delete Contact\" /></button>" +
						" <button type=\"button\" class=\"editContactButton\" data-contact-id=\"" + contact.id + "\" onclick=\"editContact(" + contact.id + ");\">" + /*!!!!IMPORTANT!!!! needs to be replaced with a function that will use add and delete to effectivly edit a contact*/
						"<img src=\"images/managerButtons/oceanEditButton.png\" alt=\"Edit Contact\" /></button>";
					if( i < jsonObject.results.length - 1 )
					{
						contactList += "<br />\r\n";
					}
				}
				
				document.getElementById("contactList").innerHTML = contactList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
	
}
