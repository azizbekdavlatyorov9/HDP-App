const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { patchWebViewPopup } = require('./withTelegramOidcWebViewPopup')

const makeProject = (version = '14.0.1') => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hdp-telegram-popup-'))
  const packagePath = path.join(root, 'node_modules/react-native-webview')
  const javaPath = path.join(
    packagePath,
    'android/src/main/java/com/reactnativecommunity/webview/RNCWebChromeClient.java',
  )
  fs.mkdirSync(path.dirname(javaPath), { recursive: true })
  fs.writeFileSync(path.join(packagePath, 'package.json'), JSON.stringify({ version }))
  fs.writeFileSync(javaPath, `package com.reactnativecommunity.webview;
class RNCWebChromeClient {
    @Override
    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
        return false;
    }
    @Override
    public boolean onConsoleMessage(ConsoleMessage message) {
        return true;
    }
    @Override
    public void onHostDestroy() { }
}
`)
  return { root, javaPath }
}

test('patches popup with Telegram HTTPS allowlist and idempotently attaches it', (t) => {
  const fixture = makeProject()
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))

  patchWebViewPopup(fixture.root)
  const first = fs.readFileSync(fixture.javaPath, 'utf8')
  assert.match(first, /oauth\.telegram\.org/)
  assert.match(first, /uri\.getScheme\(\)/)
  assert.match(first, /transport\.setWebView\(popup\)/)
  assert.match(first, /closeTelegramOidcPopup\(mTelegramOidcPopup\)/)
  assert.doesNotMatch(first, /dispatchEvent\(/)

  patchWebViewPopup(fixture.root)
  assert.equal(fs.readFileSync(fixture.javaPath, 'utf8'), first)
})

test('refuses to patch an unexpected react-native-webview version', (t) => {
  const fixture = makeProject('14.0.2')
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }))

  assert.throws(() => patchWebViewPopup(fixture.root), /expects react-native-webview 14\.0\.1/)
})
