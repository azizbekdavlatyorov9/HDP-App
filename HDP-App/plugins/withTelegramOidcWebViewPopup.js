const fs = require('node:fs')
const path = require('node:path')
const { withDangerousMod } = require('@expo/config-plugins')

const PACKAGE_VERSION = '14.0.1'
const SOURCE_RELATIVE_PATH = path.join(
  'node_modules',
  'react-native-webview',
  'android',
  'src',
  'main',
  'java',
  'com',
  'reactnativecommunity',
  'webview',
  'RNCWebChromeClient.java',
)

const POPUP_METHOD = `    private WebView mTelegramOidcPopup;

    private boolean isTelegramOidcUrl(String url) {
        Uri uri = Uri.parse(url);
        return "https".equalsIgnoreCase(uri.getScheme())
                && "oauth.telegram.org".equalsIgnoreCase(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443)
                && uri.getUserInfo() == null;
    }

    private void closeTelegramOidcPopup(WebView popup) {
        if (popup == null || popup != mTelegramOidcPopup) return;
        ViewGroup root = getRootView();
        if (root != null) root.removeView(popup);
        popup.stopLoading();
        popup.destroy();
        mTelegramOidcPopup = null;
    }

    @Override
    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
        if (!isUserGesture || mTelegramOidcPopup != null) return false;

        final WebView popup = new WebView(view.getContext());
        popup.getSettings().setJavaScriptEnabled(true);
        popup.getSettings().setDomStorageEnabled(true);
        popup.getSettings().setSupportMultipleWindows(false);
        android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(popup, true);
        popup.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onCloseWindow(WebView window) {
                closeTelegramOidcPopup(window);
            }
        });
        popup.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView child, android.webkit.WebResourceRequest request) {
                return !isTelegramOidcUrl(request.getUrl().toString());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView child, String url) {
                return !isTelegramOidcUrl(url);
            }
        });

        ViewGroup root = getRootView();
        if (root == null) {
            popup.destroy();
            return false;
        }
        root.addView(popup, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        popup.bringToFront();
        mTelegramOidcPopup = popup;

        WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
        transport.setWebView(popup);
        resultMsg.sendToTarget();
        return true;
    }

    @Override
    public void onCloseWindow(WebView window) {
        closeTelegramOidcPopup(window);
    }
`

function patchWebViewPopup(projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'node_modules', 'react-native-webview', 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('Telegram OIDC popup patch requires react-native-webview to be installed.')
  }
  const installedVersion = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version
  if (installedVersion !== PACKAGE_VERSION) {
    throw new Error(`Telegram OIDC popup patch expects react-native-webview ${PACKAGE_VERSION}; found ${installedVersion}.`)
  }

  const sourcePath = path.join(projectRoot, SOURCE_RELATIVE_PATH)
  const source = fs.readFileSync(sourcePath, 'utf8')
  if (source.includes('mTelegramOidcPopup')) return

  const start = source.indexOf('    @Override\n    public boolean onCreateWindow(')
  const endMarker = '    @Override\n    public boolean onConsoleMessage('
  const end = source.indexOf(endMarker, start)
  if (start < 0 || end < 0) {
    throw new Error('Could not safely patch the expected react-native-webview Android popup implementation.')
  }

  let patched = `${source.slice(0, start)}${POPUP_METHOD}\n${source.slice(end)}`
  const destroyMarker = '    @Override\n    public void onHostDestroy() { }'
  if (!patched.includes(destroyMarker)) {
    throw new Error('Could not safely patch react-native-webview popup cleanup.')
  }
  patched = patched.replace(
    destroyMarker,
    '    @Override\n    public void onHostDestroy() {\n        closeTelegramOidcPopup(mTelegramOidcPopup);\n    }',
  )
  fs.writeFileSync(sourcePath, patched, 'utf8')
}

module.exports = function withTelegramOidcWebViewPopup(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      patchWebViewPopup(modConfig.modRequest.projectRoot)
      return modConfig
    },
  ])
}

module.exports.patchWebViewPopup = patchWebViewPopup
