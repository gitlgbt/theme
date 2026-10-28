(function () {
  'use strict';
  function substituteRepoOpenWithUrl(tmpl, url) {
    var pos = tmpl.indexOf('{url}');
    if (pos === -1) return tmpl;
    var posQuestionMark = tmpl.indexOf('?');
    var needEncode = posQuestionMark >= 0 && posQuestionMark < pos;
    return tmpl.replace('{url}', needEncode ? encodeURIComponent(url) : url);
  }
  function getScheme() { try { return localStorage.getItem('repo-clone-protocol'); } catch (e) { return null; } }
  function setScheme(v) { try { localStorage.setItem('repo-clone-protocol', v); } catch (e) {  } }
  function initCloneSchemeUrlSelection(parent) {
    var elCloneUrlInput = parent.querySelector('.repo-clone-url');
    if (!elCloneUrlInput) return;
    var tabHttps = parent.querySelector('.repo-clone-https');
    var tabSsh = parent.querySelector('.repo-clone-ssh');
    function update() {
      var scheme = getScheme();
      if (['https', 'ssh'].indexOf(scheme) === -1) scheme = 'https';
      if (scheme === 'https' && !tabHttps) scheme = 'ssh';
      else if (scheme === 'ssh' && !tabSsh) scheme = 'https';
      var isHttps = scheme === 'https', isSsh = scheme === 'ssh';
      if (tabHttps) {
        tabHttps.textContent = tabHttps.getAttribute('data-link').split(':')[0].toUpperCase();        tabHttps.classList.toggle('active', isHttps);
      }
      if (tabSsh) tabSsh.classList.toggle('active', isSsh);
      var tab = isHttps ? tabHttps : (isSsh ? tabSsh : null);
      if (!tab) return;
      var link = tab.getAttribute('data-link');
      document.querySelectorAll('.js-clone-url').forEach(function (el) {
        if (el.nodeName === 'INPUT') el.value = link; else el.textContent = link;
      });
      parent.querySelectorAll('.js-clone-url-editor').forEach(function (el) {
        el.href = substituteRepoOpenWithUrl(el.getAttribute('data-href-template'), link);
      });
    }
    update();
    if (tabHttps) tabHttps.addEventListener('click', function () { setScheme('https'); update(); });
    if (tabSsh) tabSsh.addEventListener('click', function () { setScheme('ssh'); update(); });
    elCloneUrlInput.addEventListener('focus', function () { elCloneUrlInput.select(); });
  }
  function initClonePanelButton(btn) {
    var panel = btn.nextElementSibling;
    if (!panel) return;
    initCloneSchemeUrlSelection(panel);
    var wrapper = btn.parentElement;
    function setOpen(open) {
      panel.classList.toggle('clone-panel-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!panel.classList.contains('clone-panel-open'));
    });
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) setOpen(false);    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }
  function init() {
    document.querySelectorAll('[data-global-init="initRepoClonePanel"]').forEach(initClonePanelButton);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();