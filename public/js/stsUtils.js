var stsUtils = (function stsUtils()  {
  'use strict';
  var messages = [];
  /**
   * Traverse all children of the specified node and fun the function
   * @param  {HTMLElement} node The top level node from which to cascade down
   * @param  {Funcion} f The function to run on each iteration
   * @return {String} The field value
   */
  function walkTheDom(node, f) {
    f(node);
    node = node.firstChild;
    while (node) {
      walkTheDom(node, f);
      node = node.nextSibling;
    }
  }
  /**
   * Climb the DOM to get a specified element/node type.  Note that this doesn't work in <IE10
   * @param  {HTMLElement} node The bottom level node from which to cascade up
   * @param  {String} tagName The name of the HTML tag to look for or  of the node to look for (DIV, FORM, SECTION...).  Tag upper case.
   * @param  {String} className Optopmal - The name of a class to search for, the first class or tag matching will be returned.
   * @return {HTMLElement} The forst matched node.
   */
  function closest (node, tagName, className, classExclusion) {
    if (tagName === undefined) { tagName = 'fiewpeif74haoanchls083hfure88w'; }
    if (className === undefined) {className = 'fiewpeif74haoanchls083hfure88w'; }
    if (classExclusion === undefined) {classExclusion = 'fiewpeif74haoanchls083hfure88w'; }

    tagName = tagName.toUpperCase();

    do {
      if((node.classList && node.classList.contains(className) && node.classList.contains(classExclusion) === false) || 
        (node.nodeName === tagName && node.classList.contains(classExclusion) === false)) {

        return node;
      }
      node = node.parentNode;
    } while (node);

    return null;
  }
  /** Send errors to the server */
  /**
   * Send errors to the server
   * @param  {String} message The error message
   * @param  {String} location  Wherre the problem occurred, to aid debugging
   */
  function sendError(message, location) {
    var error = {type: 'error', message: message, location: location};
    window.fetch('/event', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(error)
    })
      .catch(function (ex) {
        console.log(ex);
      });
  }
  /**
   * If using showMessage then this might be needed
   */
  (function showMessageSetup() {
    if (document.getElementById('systemMessages') !== null) {return;}
    var div = document.createElement('div');
    div.id = 'systemMessages';
    div.style.border ='medium #ea5d1c solid';
    div.style.borderRadius = '5px';
    div.style.padding = '4px 10px';
    div.style.position = 'fixed';
    div.style.top = '25px';
    div.style.marginRight = 'auto';
    div.style.marginLeft = 'auto';
    div.style.background = '#c5c4c6';
    div.style.color = 'black';
    div.style.left = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.display = 'none';
    div.style.fontSize = '0.9em';
    div.style.lineHeight = '1.1em';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
  })();

  /**
   * Show a message on screen, usually an error
   * @param  {String} message What to display on screen
   * @param  {String} location  Where did the problem occur, this helps debugging.  
   * @param  {Number} timeout Seconds to display message for
   * @param  {Boolean} sendToServer If implemented the page can send messages back to a server
   */
  function showMessage(message, location, timeout, sendToServer) {
    var i, origTimeout, minTimeout = 90000000000000, frag, messageElement, messageElements, msg, br, err = {}; // minTimeout is an epoch date in 4821
    origTimeout = timeout;
    messageElements = document.getElementById('systemMessages');
    
    if (timeout === undefined) {
      timeout = 10;
    }
    if (typeof message === 'object' && message.message !== undefined) { /// an error object was passed in.
      message = message.message;
    }
    if (message !== undefined && window.console !== undefined) {
      window.console.log((new Date()).toUTCString() + ' :: ' + location + ' :: ' + message);
    }
    if (message !== undefined && message.indexOf('<') === 0 && message.length > 90) {
      message = 'Unexpected error from server.';
    }
    if (message) {
      timeout = Date.now() + (timeout * 1000);
      err.message = message;
      err.timeout = timeout;
      messages.push(err);
    }
    frag = document.createDocumentFragment();
    messages.forEach(function (err, i) {
      if (err.timeout <= Date.now()) {
        messages.splice(i, 1);
      } else {
        msg = document.createTextNode(err.message);
        br = document.createElement('br');
        frag.appendChild(msg);
        frag.appendChild(br);
        if (err.timeout < minTimeout) {
            minTimeout = err.timeout;
        }
      }
    });
    
    if (messages.length === 0) {
      messageElements.style.display = 'none';
    } else {
      messageElements.innerHTML = '';
      messageElements.appendChild(frag);

      if (window.getComputedStyle(messageElements).display === 'none') {
        messageElements.style.display = 'block';
      }

    }
    if (minTimeout < 90000000000000) {
      timeout = minTimeout - Date.now();
      setTimeout(function () { showMessage(); }, timeout);
    }
    if (message !== undefined && sendToServer) {
      sendError(message, location);
    }
  }

  /**
   * Traverse all children of the specified node and fun the function
   * Reminder: identical event listeners are ignored so no need to worry about removing duplicates.  https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Multiple_identical_event_listeners
   * @param  {HTMLElement} element The element to add the listener to, can be a string (an element ID) or a collection
   * @param  {String} eventType What to listen for (click, mouseover... )
   * @param  {Boolean} track Fire Google Analytics events
   * @param  {Function} callback The function to run when the event is fired.  Takes parameter event
   */
  function addListener(element, eventType, track, callback) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (element === null) { return; }

    /// If it's array like.  For example grtElementsByClassName
    if (Array.isArray(element) || (element.nodeName !== 'SELECT' && typeof element.length != 'undefined' &&   typeof element.item != 'undefined')) {
      for (var i = 0; i < element.length; i++) {
        addListener(element[i], eventType, track, callback);
      }
      return;
    }
    if (element.addEventListener) {
      element.addEventListener(eventType, callback, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + eventType, callback);
    }
    if (track && typeof ga !== 'undefined') {
      var elementType = element.type || 'button';
      addListener(element, eventType, false, function () {
        ga('send', 'event', elementType, eventType, element.id || 'nav-buttons');
      });
    }
  }

  /**
   * Test if a string is JSON
   * @param  {String} str The top level node from which to cascade down
   * @return {Bookean} f it's JSON then return true
   */
  function isJSON(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  /**
   * Asynchronously connect to a server and run a function
   * @param  {String} url The URL to fire the request to
   * @param  {Object} payload String or Object with server query parameters
   * @param  {String} method GET, POST, PUT or DELETE
   * @param  {Boolean} isJson true or false for what to expect from server
   * @param  {Function} callback Function which received err and the returned server object
   */
  function ajax(url, payload, method, isJson, callback) {

    try {
      var err, r = new window.XMLHttpRequest();

      r.open(method, url, true);
      if (isJson) {
        if (typeof payload === 'object') {
          payload = JSON.stringify(payload);
        }
        r.setRequestHeader('Content-Type', 'application/json');
        r.setRequestHeader('Accept', 'application/json');
      }
      r.setRequestHeader('x-requested-with', 'XMLHttpRequest');
      
      r.onreadystatechange = function () {
        /// responseURL and so the following doesn't work in IE/Edge as of May 2016.
        /// Handle cookie timeouts/delete + redirect
        if (r.readyState === 4 && r.status === 200 && r.responseURL && r.responseURL !== window.location.origin + url && r.responseURL.indexOf('?redirect=') > 0) {
          console.log(r.responseURL,  window.location.origin + url);
          window.location.href = r.responseURL.split('=')[0] + '=' + window.location.pathname;
          return;
        }
        if (r.readyState === 4 && r.status !== 200) {
          if (r.responseText && isJSON(r.responseText)) {
            err = new Error(JSON.parse(r.responseText).error);
          } else {
            err = new Error(r.responseText);
          }
          
          err.status = r.status;
          callback(err, undefined);
          return;
        }
        if (r.readyState !== 4 || r.status !== 200) { return; }
        if (isJson && typeof JSON.parse !== undefined && isJSON(r.responseText) === false) {
          callback(new Error('Unexpected server respose (expected JSON)'));
        } else if (isJson && typeof JSON.parse !== undefined) {
          callback(undefined, JSON.parse(r.responseText));
        } else {
          callback(undefined, r.responseText);
        }
        
      };
      r.send(payload);
      r.onerror = function (err) { callback('Network error.' + err, undefined); };
    } catch (ex) {
        callback(ex.message, undefined);
    }
  }
  /**
   * Run an AJAX funciton with GET methos and expecting JSON
   * @param  {String} url The URL to fire the request to
   * @param  {Object} payload Parameters to send to the server
   * @param  {Function} callback Function which received err and the returned server object
   */
  function getJSON(url, callback) {
    ajax(url, {}, 'GET', true, function (err, json) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, json);
      }
    });
  }

  /**
   * Get radio button values as some browsers don't support getting by value.
   * @param  {String} name The name of theradio button set
   * @return {String} The selected radio value
   */
  function getValueFromRadioButton(name) {
     //Get all elements with the name
     var buttons = document.getElementsByName(name);
     for(var i = 0; i < buttons.length; i++) {
        //Check if button is checked
        var button = buttons[i];
        if(button.checked) {
           //Return value
           return button.value;
        }
     }
     //No radio button is selected. 
     return undefined;
  }


  /* Check validity of an email address
   * @param  {String} email The string to be tested
   * @return {Boolean} Does it match or not
   */
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  /**
  * Take a form element and return the values in an object.
  * @param  {HTMLElement} form - Form element
  * @return {Object} Object representation of the form
  */
  function populateObjectFromForm(form) {
    var msg ={};
    walkTheDom(form, function (el) {
      if (el.name === undefined) {
        return;
      }
      try {
        if (el.nodeName === 'INPUT' &&  (el.type === 'text' || el.type === 'password' || el.type === 'hidden' || el.type === 'email')) {
          msg[el.name] = el.value;
        } else if (el.nodeName === 'INPUT' && el.type === 'checkbox') {
          msg[el.name] = el.checked;
        } else if (el.nodeName === 'SELECT' && el.type === 'select-one') {
          msg[el.name] = el.options[el.selectedIndex].value;
        } else if (el.nodeName === 'INPUT' && el.type === 'radio') {
          msg[el.name] = getValueFromRadioButton(el.name);
        } else if (el.nodeName === 'TEXTAREA') {
          msg[el.name] = el.value;
        }
      } catch (err) {
        /// Softish fail
        console.log('populateObjectFromForm: ' + err.message);
      }
    });
    return msg;
  }

  /**
   * Get the value of a querystring parameter
   * @param  {String} param The field to get the value of
   * @return {String} The field value
   */
  function getQueryParameter(param)
  {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
       var pair = vars[i].split("=");
       if (pair[0] == param) {return pair[1];}
    }
    return(false);
  }

  /**
   * Get a cookie value
   * @param  {string} k The cookie name to get
   * @return {String} The cookie value
   */
  function getCookie(k) { return (document.cookie.match('(^|; )' + k + '=([^;]*)') || 0)[2]; }
  /**
   * Set a cookie
   * @param  {String} n The cookie name
   * @param  {String} v The cookie value
   * @param  {String} d Optional Days until the cookie expires, if undefined then expires now.
   */
  function setCookie(n, v, d) {
    var e, dd;
    if (d) {
      dd = new Date();
      dd.setTime(dd.getTime() + (d * 24 * 60 * 60 * 1000));
      e = '; expires=' + dd.toGMTString();
    } else { e = ''; }
    document.cookie = n + '=' + v + e + '; path=/';
  }
  /**
  * Add a banner for cookie consent.  Adds it unless a tag IDd cookieBanner is on the page in chich cas it uses that.  
  * This requires a page called /privacy to be available.
  */
  (function addCookieBanner() {
    var div, info, txt, accept, cookieName = 'cookieConsent';
    div = document.getElementById('cookieBanner');
    if (getCookie(cookieName) === 'true' && div === null) {
      return;
    } else if (getCookie(cookieName) === 'true') { 
      div.style.display = 'none';
    } else if (div !== null) {
      accept = div.querySelector('input');
    } else {
      div = document.createElement('div');
      info = document.createElement('a');
      txt = document.createTextNode('We use cookies.  If you don\'t like cookies (the electronic kind) please don\'t continue.  If you are happy to continue please ');
      accept = document.createElement('input');
      div.id = 'cookieBanner';
      div.style.padding = '5px 0';
      div.style.position = 'fixed';
      div.style.top = '0px';
      div.style.background = '#dce7ea';
      div.style.borderBottom = 'medium solid #767b7c';
      div.style.color = 'black';
      div.style.left = '0';
      div.style.margin = '0';
      div.style.width = '100%';
      div.style.boxSizing = 'border-box';
      div.style.lineHeight = '1.5em';
      div.style.textAlign = 'center';
      div.style.zIndex = '9998';
      accept.type = 'button';
      accept.value = 'Accept and contnue';
      info.href = '/privacy';
      info.textContent = '. More info.';
      info.style.color = 'black';
      info.style.textSize = 'black';
      info.style.fontSize = '0.8em';
      div.appendChild(txt);
      div.appendChild(accept);
      div.appendChild(info);
      document.body.appendChild(div);
    }
    addListener(accept, 'click', true, function () {
      div.style.display = 'none';
      setCookie(cookieName, 'true', 365);
    });
  })();

  return {
    walkTheDom: walkTheDom,
    showMessage: showMessage,
    isJSON: isJSON,
    addListener: addListener,
    closest: closest,
    ajax: ajax,
    getJSON: getJSON,
    getValueFromRadioButton: getValueFromRadioButton,
    populateObjectFromForm: populateObjectFromForm,
    validateEmail: validateEmail,
    getQueryParameter: getQueryParameter,
    getCookie: getCookie,
    setCookie: setCookie
  };
})();