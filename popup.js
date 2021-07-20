// set up logic once DOM loads
document.addEventListener('DOMContentLoaded', function() {
  var bigDiv = document.getElementById('bigDiv');
  var loginHTML = `<form id='loginForm'>
                   <input type='email' name='email' id='email' placeholder='Email' autocomplete='username email'>
	           <input type='password' name='password' id='password' placeholder='Password' autocomplete='new-password'>
	           <button id='loginButton'>Sign In</button>
	         </form>`;
  var shareHTML = `<button id="addLink">add link</button>
		  <p id='message'>So far, you've shared {{numLinks}} links</p>`;

  function addLink(e) {  
    console.log("clicked button");
    chrome.tabs.getSelected(null, function(tab) {
      var url = tab.url;
      get_saved_user_cred()
        .then(cred => {
          const requestData = {email: cred.loopd_email, hash: cred.loopd_hash, link: url};
	  fetch('http://scriber.tech/loopd/add_user_link', {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json',
	    },
	    body: JSON.stringify(requestData),
	  })
          .then(res => {
            if (res.status == 200) {
	      console.log('LOOKIN GOOOOOOOD');
	      
	      document.getElementById('addLink').remove();
	      document.getElementById('message').innerHTML = 'Link has been loopd!';
	    } else {
	      return Promise.reject('Failure on Loopd Server');
	    }
	  })
	  .catch(err =>{ 
	    console.log('bubbling up error: '+err);
	  });
	})
	.catch(err => { console.log('add link failed: '+err);
	});
    });
  }

  function login(e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var salt = 'SquirrelPilotMango';
    var hash = md5(salt+password);
    const requestData = { email: email, hash: hash };
    return make_login_request(requestData)
	  .then(res => {
	    change_page(shareHTML.replace(/{{numLinks}}/g, res.total_link_count));
	    chrome.storage.local.remove('loopd_email');
            chrome.storage.local.remove('loopd_hash');
	    chrome.storage.local.set({loopd_email: email, loopd_hash: hash});
	  })
	  .catch(error => {console.log('Login failed: ', error);
	  });
  }
   
  function change_page(html) {
    bigDiv.innerHTML = html;
    var addLinkButton = document.getElementById('addLink');
    var loginForm = document.getElementById('loginForm');
    if (addLinkButton) {
      addLinkButton.addEventListener('click', addLink);
    } else if (loginButton) {
      loginForm.addEventListener('submit', login);
    }
  }

  function make_login_request(requestData) {
    return new Promise((resolve, reject) => {
      fetch('http://scriber.tech/loopd/login', {
        method: 'POST',
        headers: {
	  'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      .then(res => {
	console.log('login response received');
        if (res.status == 200) {
          resolve(res.json());
	} else {
	  reject('Login Failed');
        } 
      })
      .catch(error => { 
        console.error('Error:', error); 
        reject(error);
      });
    });
  }

  function get_saved_user_cred() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['loopd_email', 'loopd_hash'], function (response) {
        if (chrome.runtime.lastError || response.loopd_email === undefined || response.loopd_hash === undefined)
	  reject('no saved user credential');
	resolve(response);
      });
    });
  }

  get_saved_user_cred()  
    .then(cred => {
      return make_login_request({email: cred.loopd_email, hash: cred.loopd_hash});
    })
    .then(res => {
      change_page(shareHTML.replace(/{{numLinks}}/g, res.total_link_count));
    })
    .catch(err => {
      console.log('Auto-login failed with: '+err);
      change_page(loginHTML);
    });
});

