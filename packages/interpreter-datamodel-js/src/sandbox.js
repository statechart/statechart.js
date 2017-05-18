import uuid from 'uuid/v4';
import createFetch from 'fetch-ponyfill';

const SCRIPT = `
<script>_window=window,_event;
function __(window,document,history,context) {
  var self = window;
  return {
    global: _window,
    sessionid: _sessionid,
    exec: function(script) {
      with (context) {
        return eval(script);
      }
    },
    dump: function() {
      // TODO
      return {};
    },
    load: function(data) {
      // TODO
    },
  };
};</script>
`;

const readyState = 'readyState';
const onreadystatechange = 'onreadystatechange';

export default function createIframe(context) {
  var sessionid = uuid();
  var iframe = document.createElement('iframe');
  iframe.style.visibility = 'hidden';
  iframe.style.display = 'none';
  iframe.style.height = 0;
  iframe.style.width = 0;
  iframe.style.position = 'fixed';
  iframe.name = `scxml ${sessionid}`;
  document.body.parentElement.appendChild(iframe);
  var contentWindow = iframe.contentWindow;

  var doc = contentWindow.document;
  doc.open();
  doc.write(SCRIPT);
  doc.close();

  contentWindow._sessionid = sessionid;
  contentWindow.__load = initLoad(contentWindow);
  contentWindow.fetch = createFetch().fetch;

  return contentWindow.__(window, document, history, context);
}

function initLoad(window) {
  var document = window.document;
  var head = document.head;

  return function load(src) {
    return new Promise(function(resolve, reject) {
      var el = document.createElement('script');
      var loaded;
      el.onload = el[onreadystatechange] = function () {
        if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
        el.onload = el[onreadystatechange] = null;
        loaded = 1;
        resolve();
      }
      el.onerror = reject;
      el.async = true;
      el.src = src;
      head.insertBefore(el, head.lastChild);
    });
  };
}
