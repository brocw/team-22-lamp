const urlBase = 'http://cop-4331-22.com/LAMPAPI';
const extension = 'php';



let userId = 0;
let firstName = "";
let lastName = "";
let editingId = null;

function showStatus(message)
{
	const toast = document.getElementById("statusToast");
	toast.textContent = message;
	toast.classList.add("visible");
	clearTimeout(toast._hideTimer);
	toast._hideTimer = setTimeout(function() {
		toast.classList.remove("visible");
	}, 2500);
}

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

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
	var tmp = {firstName: firstName, lastName: lastName, login: login, password: password};
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
		window.location.href = "index.html";
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

function clearFieldErrors()
{
	document.getElementById("phoneError").innerHTML = "";
	document.getElementById("emailError").innerHTML = "";
}

function validateContactFields(phone, email)
{
	let valid = true;

	const phoneRegex = /^\+?[\d\s\-().]{7,15}$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!phoneRegex.test(phone))
	{
		document.getElementById("phoneError").innerHTML = "&#9888; Please enter a valid phone number";
		valid = false;
	}

	if (!emailRegex.test(email))
	{
		document.getElementById("emailError").innerHTML = "&#9888; Please enter a valid email";
		valid = false;
	}

	return valid;
}

function addContact()
{
    let firstName = document.getElementById("addContactFirstName").value;
    let lastName = document.getElementById("addContactLastName").value;
    let phoneNumber = document.getElementById("addContactPhone").value;
    let email = document.getElementById("addContactEmail").value;

    clearFieldErrors();

    if (!validateContactFields(phoneNumber, email))
    {
        return;
    }

    let tmp;
    let url;

    if (editingId !== null)
    {
        // EDIT MODE
        tmp = {
            firstName:firstName,
            lastName:lastName,
            email:email,
            phone:phoneNumber,
            id: editingId,
            userId:userId
        };

        url = urlBase + '/UpdateContact.' + extension;
    }
    else
    {
        // ADD MODE
        tmp = {
            firstName:firstName,
            lastName:lastName,
            email:email,
            phoneNumber:phoneNumber,
            userId:userId
        };

        url = urlBase + '/AddContact.' + extension;
    }

    let jsonPayload = JSON.stringify(tmp);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            let jsonObject = JSON.parse(xhr.responseText);

            // Handle backend duplicate errors
            if (jsonObject.error && jsonObject.error.length > 0)
            {
                if (jsonObject.error === "emailExists")
                {
                    document.getElementById("emailError").innerHTML = "&#9888; Contact with that email already exists";
                }
                else if (jsonObject.error === "phoneExists")
                {
                    document.getElementById("phoneError").innerHTML = "&#9888; Contact with that phone number already exists";
                }
                return;
            }

            let statusMsg;
            if (editingId !== null)
            {
                statusMsg = "Contact has been edited";
            }
            else
            {
                statusMsg = "Contact has been added";
            }

            // Reset mode
            editingId = null;

            // Reset UI
            document.getElementById("addContactTitle").innerHTML = "NEW CONTACT";
            document.getElementById("commitContactButton").innerHTML = "Add Contact";
            document.getElementById("addContactDiv").style.display = "none";

            searchContact(statusMsg);
        }
    };

    xhr.send(jsonPayload);
}


function deleteContact(contactId)
{
	if (!confirm("Are you sure you want to delete this contact?")) return;

	let tmp = {id: contactId, userId:userId};
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
				searchContact("Contact has been deleted");
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		showStatus(err.message);
	}
}

function editContact(contactId, firstName, lastName, phoneNumber, email)
{
    editingId = contactId;

    // Hide contact list
    document.getElementById("contactList").style.display = "none";

    // Show addContactDiv
    document.getElementById("addContactDiv").style.display = "flex";

    // Change title + button text
    document.getElementById("addContactTitle").innerHTML = "EDIT CONTACT";
    document.getElementById("commitContactButton").innerHTML = "Edit Contact";

    // Pre-fill fields
    document.getElementById("addContactFirstName").value = firstName;
    document.getElementById("addContactLastName").value = lastName;
    document.getElementById("addContactPhone").value = phoneNumber;
    document.getElementById("addContactEmail").value = email;
}


function toggleAddContactDiv()
{
    editingId = null;

    document.getElementById("contactList").style.display = "none";
    document.getElementById("addContactDiv").style.display = "flex";

    document.getElementById("addContactTitle").innerHTML = "NEW CONTACT";
    document.getElementById("commitContactButton").innerHTML = "Add Contact";

    // Clear inputs
    document.getElementById("addContactFirstName").value = "";
    document.getElementById("addContactLastName").value = "";
    document.getElementById("addContactPhone").value = "";
    document.getElementById("addContactEmail").value = "";
    clearFieldErrors();
}



function cancelContactForm()
{
    editingId = null;
    clearFieldErrors();
    document.getElementById("addContactDiv").style.display = "none";
    document.getElementById("contactList").style.display = "block";
}



let currentPage = 1;
let pageSize = 10;

function toggleCard(id)
{
	const body = document.getElementById('card-body-' + id);
	const arrow = document.getElementById('card-arrow-' + id);
	const card = document.getElementById('card-' + id);
	if (!body) return;
	const isOpen = body.classList.toggle('card-body-open');
	card.classList.toggle('card-open', isOpen);
	if (arrow) arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
}

function renderContactTable()
{
	const start = (currentPage - 1) * pageSize;
	const end = start + pageSize;
	const pageContacts = allContacts.slice(start, end);
	const totalPages = Math.ceil(allContacts.length / pageSize);

	let html = '<div class="contact-table">';

	// Page size selector
	html += '<div class="pagination-controls">';
	html += '<label for="pageSizeSelect">Show: </label>';
	html += '<select id="pageSizeSelect" onchange="changePageSize(this.value)">';
	html += '<option value="5"' + (pageSize === 5 ? ' selected' : '') + '>5</option>';
	html += '<option value="10"' + (pageSize === 10 ? ' selected' : '') + '>10</option>';
	html += '<option value="25"' + (pageSize === 25 ? ' selected' : '') + '>25</option>';
	html += '</select>';
	html += '<span class="pagination-info"> Showing ' + (start + 1) + '&ndash;' + Math.min(end, allContacts.length) + ' of ' + allContacts.length + ' contacts</span>';
	html += '</div>';

	// Cards grid
	html += '<div class="contact-cards-grid">';
	for (let i = 0; i < pageContacts.length; i++)
	{
		let contact = pageContacts[i];
		// Build safe inline-edit args (escape single quotes)
		let safeFirst = contact.firstName.replace(/'/g, "\\'");
		let safeLast  = contact.lastName.replace(/'/g, "\\'");
		let safePhone = contact.phone.replace(/'/g, "\\'");
		let safeEmail = contact.email.replace(/'/g, "\\'");

		// Initials for avatar
		let initials = (contact.firstName.charAt(0) + contact.lastName.charAt(0)).toUpperCase();

		html += '<div class="contact-card" id="card-' + contact.id + '">' +

			// Card header (always visible, click to open)
			'<div class="card-header" onclick="toggleCard(' + contact.id + ')">' +
				'<div class="card-avatar">' + initials + '</div>' +
				'<div class="card-header-name">' +
					'<span class="card-full-name">' + contact.firstName + ' ' + contact.lastName + '</span>' +
					'<span class="card-preview-email">' + contact.email + '</span>' +
				'</div>' +
				'<span class="card-arrow" id="card-arrow-' + contact.id + '">&#9660;</span>' +
			'</div>' +

			// Card body (expanded details)
			'<div class="card-body" id="card-body-' + contact.id + '">' +
				'<div class="card-detail-row">' +
					'<span class="card-detail-label">&#128222; Phone</span>' +
					'<span class="card-detail-value">' + contact.phone + '</span>' +
				'</div>' +
				'<div class="card-detail-row">' +
					'<span class="card-detail-label">&#9993; Email</span>' +
					'<span class="card-detail-value">' + contact.email + '</span>' +
				'</div>' +
				'<div class="card-actions">' +
					'<button type="button" class="card-action-btn card-edit-btn" onclick="editContact(' + contact.id + ', \'' + safeFirst + '\', \'' + safeLast + '\', \'' + safePhone + '\', \'' + safeEmail + '\')">&#9998; Edit</button>' +
					'<button type="button" class="card-action-btn card-delete-btn" onclick="deleteContact(' + contact.id + ')">&#10005; Delete</button>' +
				'</div>' +
			'</div>' +

		'</div>';
	}
	html += '</div>'; // end contact-cards-grid

	// Pagination buttons
	if (totalPages > 1)
	{
		html += '<div class="pagination-buttons">';
		html += '<button class="page-btn" onclick="changePage(' + (currentPage - 1) + ')" ' + (currentPage === 1 ? 'disabled' : '') + '>&#8592; Prev</button>';
		for (let p = 1; p <= totalPages; p++)
		{
			html += '<button class="page-btn' + (p === currentPage ? ' page-btn-active' : '') + '" onclick="changePage(' + p + ')">' + p + '</button>';
		}
		html += '<button class="page-btn" onclick="changePage(' + (currentPage + 1) + ')" ' + (currentPage === totalPages ? 'disabled' : '') + '>Next &#8594;</button>';
		html += '</div>';
	}

	html += '</div>';
	document.getElementById("contactList").innerHTML = html;
}

function changePage(page)
{
	const totalPages = Math.ceil(allContacts.length / pageSize);
	if (page < 1 || page > totalPages) return;
	currentPage = page;
	renderContactTable();
}

function changePageSize(size)
{
	pageSize = parseInt(size);
	currentPage = 1;
	renderContactTable();
}

function searchContact(statusOverride)
{	
	document.getElementById("addContactDiv").style.display = "none";
	document.getElementById("contactList").style.display = "block";

	let srch = document.getElementById("searchText").value;

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
				let jsonObject = JSON.parse( xhr.responseText );

				if (jsonObject.error && jsonObject.error.length > 0)
				{
					allContacts = [];
					document.getElementById("contactList").innerHTML = "";
					return;
				}

				if (statusOverride)
				{
					showStatus(statusOverride);
				}
				else
				{
					showStatus("Contact(s) has been retrieved");
				}

				allContacts = jsonObject.results;
				currentPage = 1;
				renderContactTable();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		showStatus(err.message);
	}
}
