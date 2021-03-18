console.log('testing123');

document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function() {
    
    console.log("clicked button");

    chrome.tabs.getSelected(null, function(tab) {
      d = document;

      console.log("clicked button 2");
      /*
      var f = d.createElement('form');
      f.action = 'http://gtmetrix.com/analyze.html?bm';
      f.method = 'post';
      var i = d.createElement('input');
      i.type = 'hidden';
      i.name = 'url';
      i.value = tab.url;
      f.appendChild(i);
      d.body.appendChild(f);
      f.submit();
      */
      var f = d.createElement('form');
      f.action = 'http://scriber.tech/loopd/add_link';
      f.method = 'post';
      var input0 = d.createElement('input');
      input0.type = 'hidden';
      input0.name = 'user_id';
      input0.value = 1;
      var input1 = d.createElement('input');
      input1.type = 'hidden';
      input1.name = 'link';
      input1.value = tab.url;
      f.appendChild(input0);
      f.appendChild(input1);
      d.body.appendChild(f);
      f.submit();
    });
  }, false);
}, false);
