var _a;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useSubmit, useNavigation, Link, useRouteError } from "@remix-run/react";
import * as isbotModule from "isbot";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import React, { useState, useCallback, createContext } from "react";
import { Button, Page, Layout, Card, BlockStack, Text, InlineGrid, Select, InlineStack, Spinner, DataTable, Box, Banner, Modal, TextField, Badge, DropZone, Icon, List, AppProvider as AppProvider$1 } from "@shopify/polaris";
import crypto from "crypto";
import { setCrypto, setAbstractRuntimeString } from "@shopify/shopify-api/runtime";
import "@shopify/shopify-api/adapters/web-api";
import { HttpResponseError, ShopifyError, WebhookValidationErrorReason, FeatureDeprecatedError, CookieNotFound, InvalidHmacError, InvalidOAuthError, GraphqlQueryError, InvalidJwtError, RequestedTokenType, ShopifyHeader, shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import semver from "semver";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { redirect } from "@remix-run/server-runtime";
import { NoteIcon } from "@shopify/polaris-icons";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const polarisStyles = "/assets/styles-BeiPL2RV.css";
const links = () => [
  { rel: "stylesheet", href: polarisStyles }
];
const headers$1 = () => ({
  "ngrok-skip-browser-warning": "true"
});
function App$1() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1,
  headers: headers$1,
  links
}, Symbol.toStringTag, { value: "Module" }));
const APP_BRIDGE_URL$1 = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
const REAUTH_URL_HEADER = "X-Shopify-API-Request-Failure-Reauthorize-Url";
const RETRY_INVALID_SESSION_HEADER = {
  "X-Shopify-Retry-Invalid-Session-Request": "1"
};
let appBridgeUrlOverride;
function setAppBridgeUrlOverride(url) {
  appBridgeUrlOverride = url;
}
function appBridgeUrl() {
  return appBridgeUrlOverride || APP_BRIDGE_URL$1;
}
setCrypto(crypto);
setAbstractRuntimeString(() => {
  return `Remix (Node)`;
});
if (process.env.APP_BRIDGE_URL) {
  setAppBridgeUrlOverride(process.env.APP_BRIDGE_URL);
}
var AppDistribution;
(function(AppDistribution2) {
  AppDistribution2["AppStore"] = "app_store";
  AppDistribution2["SingleMerchant"] = "single_merchant";
  AppDistribution2["ShopifyAdmin"] = "shopify_admin";
})(AppDistribution || (AppDistribution = {}));
var LoginErrorType;
(function(LoginErrorType2) {
  LoginErrorType2["MissingShop"] = "MISSING_SHOP";
  LoginErrorType2["InvalidShop"] = "INVALID_SHOP";
})(LoginErrorType || (LoginErrorType = {}));
function headersBoundary(headers2) {
  const { parentHeaders, loaderHeaders, actionHeaders, errorHeaders } = headers2;
  if (errorHeaders && Array.from(errorHeaders.entries()).length > 0) {
    return errorHeaders;
  }
  return new Headers([
    ...parentHeaders ? Array.from(parentHeaders.entries()) : [],
    ...loaderHeaders ? Array.from(loaderHeaders.entries()) : [],
    ...actionHeaders ? Array.from(actionHeaders.entries()) : []
  ]);
}
function errorBoundary(error) {
  if (error.constructor.name === "ErrorResponse" || error.constructor.name === "ErrorResponseImpl") {
    return jsx("div", { dangerouslySetInnerHTML: { __html: error.data || "Handling response" } });
  }
  throw error;
}
const boundary = {
  /**
   * A function that handles errors or thrown responses.
   *
   * @example
   * <caption>Catching errors in a route</caption>
   * ```ts
   * // /app/routes/admin/widgets.ts
   * import { boundary } from "@shopify/shopify-app-remix/server";
   *
   * export function ErrorBoundary() {
   *   return boundary.error(useRouteError());
   * }
   * ```
   */
  error: errorBoundary,
  /**
   * A function that sets the appropriate document response headers.
   *
   * @example
   * <caption>Catching errors in a route</caption>
   * ```ts
   * // /app/routes/admin/widgets.ts
   * import { boundary } from "@shopify/shopify-app-remix/server";
   *
   * export const headers = (headersArgs) => {
   *   return boundary.headers(headersArgs);
   * };
   * ```
   */
  headers: headersBoundary
};
const SHOPIFY_REMIX_LIBRARY_VERSION = "2.8.2";
function registerWebhooksFactory({ api, logger }) {
  return async function registerWebhooks({ session }) {
    return api.webhooks.register({ session }).then((response) => {
      Object.entries(response).forEach(([topic, topicResults]) => {
        topicResults.forEach(({ success, ...rest }) => {
          if (success) {
            logger.debug("Registered webhook", {
              topic,
              shop: session.shop,
              operation: rest.operation
            });
          } else {
            logger.error("Failed to register webhook", {
              topic,
              shop: session.shop,
              result: JSON.stringify(rest.result)
            });
          }
        });
      });
      return response;
    }).catch((error) => {
      var _a2, _b;
      const graphQLErrors = ((_b = (_a2 = error.body) == null ? void 0 : _a2.errors) == null ? void 0 : _b.graphQLErrors) || [];
      const throttled = graphQLErrors.find(({ extensions: { code } }) => code === "THROTTLED");
      if (throttled) {
        logger.error("Failed to register webhooks", {
          shop: session.shop,
          error: JSON.stringify(error)
        });
      } else {
        throw error;
      }
    });
  };
}
function ensureCORSHeadersFactory(params, request, corsHeaders2 = []) {
  const { logger, config } = params;
  return function ensureCORSHeaders(response) {
    const origin = request.headers.get("Origin");
    if (origin && origin !== config.appUrl) {
      logger.debug("Request comes from a different origin, adding CORS headers");
      const corsHeadersSet = /* @__PURE__ */ new Set([
        "Authorization",
        "Content-Type",
        ...corsHeaders2
      ]);
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("Access-Control-Allow-Headers", [...corsHeadersSet].join(", "));
      response.headers.set("Access-Control-Expose-Headers", REAUTH_URL_HEADER);
    }
    return response;
  };
}
const redirectToBouncePage = (params, url) => {
  const { config } = params;
  const searchParams = url.searchParams;
  searchParams.delete("id_token");
  searchParams.set("shopify-reload", `${config.appUrl}${url.pathname}?${searchParams.toString()}`);
  throw redirect(`${config.auth.patchSessionTokenPath}?${searchParams.toString()}`);
};
function respondToInvalidSessionToken({ params, request, retryRequest = false }) {
  const { api, logger, config } = params;
  const isDocumentRequest = !request.headers.get("authorization");
  if (isDocumentRequest) {
    return redirectToBouncePage({ config }, new URL(request.url));
  }
  throw new Response(void 0, {
    status: 401,
    statusText: "Unauthorized",
    headers: retryRequest ? RETRY_INVALID_SESSION_HEADER : {}
  });
}
async function validateSessionToken(params, request, token, { checkAudience = true } = {}) {
  const { api, logger } = params;
  logger.debug("Validating session token");
  try {
    const payload = await api.session.decodeSessionToken(token, {
      checkAudience
    });
    logger.debug("Session token is valid", {
      payload: JSON.stringify(payload)
    });
    return payload;
  } catch (error) {
    logger.debug(`Failed to validate session token: ${error.message}`);
    throw respondToInvalidSessionToken({ params, request, retryRequest: true });
  }
}
const SESSION_TOKEN_PARAM$1 = "id_token";
function getSessionTokenHeader(request) {
  var _a2;
  return (_a2 = request.headers.get("authorization")) == null ? void 0 : _a2.replace("Bearer ", "");
}
function getSessionTokenFromUrlParam(request) {
  const url = new URL(request.url);
  return url.searchParams.get(SESSION_TOKEN_PARAM$1);
}
const SHOPIFY_POS_USER_AGENT = /Shopify POS\//;
const SHOPIFY_MOBILE_USER_AGENT = /Shopify Mobile\//;
const SHOPIFY_USER_AGENTS = [SHOPIFY_POS_USER_AGENT, SHOPIFY_MOBILE_USER_AGENT];
function respondToBotRequest({ logger }, request) {
  const userAgent = request.headers.get("User-Agent") ?? "";
  if (SHOPIFY_USER_AGENTS.some((agent) => agent.test(userAgent))) {
    logger.debug("Request is from a Shopify agent, allow");
    return;
  }
  if (isbot(userAgent)) {
    logger.debug("Request is from a bot, skipping auth");
    throw new Response(void 0, { status: 410, statusText: "Gone" });
  }
}
function respondToOptionsRequest(params, request, corsHeaders2) {
  if (request.method === "OPTIONS") {
    const ensureCORSHeaders = ensureCORSHeadersFactory(params, request, corsHeaders2);
    throw ensureCORSHeaders(new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Max-Age": "7200"
      }
    }));
  }
}
async function beginAuth(params, request, isOnline, shop) {
  const { api, config } = params;
  throw await api.auth.begin({
    shop,
    callbackPath: config.auth.callbackPath,
    isOnline,
    rawRequest: request
  });
}
function redirectWithExitIframe(params, request, shop) {
  const { api, config } = params;
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const host = api.utils.sanitizeHost(queryParams.get("host"));
  queryParams.set("shop", shop);
  let destination = `${config.auth.path}?shop=${shop}`;
  if (host) {
    queryParams.set("host", host);
    destination = `${destination}&host=${host}`;
  }
  queryParams.set("exitIframe", destination);
  throw redirect(`${config.auth.exitIframePath}?${queryParams.toString()}`);
}
function redirectWithAppBridgeHeaders(redirectUri) {
  throw new Response(void 0, {
    status: 401,
    statusText: "Unauthorized",
    headers: getAppBridgeHeaders(redirectUri)
  });
}
function getAppBridgeHeaders(url) {
  return new Headers({ [REAUTH_URL_HEADER]: url });
}
async function redirectToAuthPage(params, request, shop, isOnline = false) {
  const { config } = params;
  const url = new URL(request.url);
  const isEmbeddedRequest2 = url.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");
  if (isXhrRequest) {
    const redirectUri = new URL(config.auth.path, config.appUrl);
    redirectUri.searchParams.set("shop", shop);
    redirectWithAppBridgeHeaders(redirectUri.toString());
  } else if (isEmbeddedRequest2) {
    redirectWithExitIframe(params, request, shop);
  } else {
    throw await beginAuth(params, request, isOnline, shop);
  }
}
function cancelBillingFactory(params, request, session) {
  return async function cancelBilling(options) {
    const { api, logger, config } = params;
    logger.debug("Cancelling billing", { shop: session.shop, ...options });
    try {
      return await api.billing.cancel({
        session,
        subscriptionId: options.subscriptionId,
        isTest: options.isTest,
        prorate: options.prorate
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug("API token was invalid, redirecting to OAuth", {
          shop: session.shop
        });
        await config.sessionStorage.deleteSession(session.id);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }
  };
}
function requireBillingFactory(params, request, session) {
  const { api, logger, config } = params;
  return async function requireBilling(options) {
    const logContext = {
      shop: session.shop,
      plans: options.plans,
      isTest: options.isTest
    };
    logger.debug("Checking billing for the shop", logContext);
    let data;
    try {
      data = await api.billing.check({
        session,
        plans: options.plans,
        isTest: options.isTest,
        returnObject: true
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug("API token was invalid, redirecting to OAuth", logContext);
        await config.sessionStorage.deleteSession(session.id);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }
    if (!data.hasActivePayment) {
      logger.debug("Billing check failed", logContext);
      throw await options.onFailure(new Error("Billing check failed"));
    }
    logger.debug("Billing check succeeded", logContext);
    return data;
  };
}
function requestBillingFactory(params, request, session) {
  return async function requestBilling({ plan, isTest, returnUrl, ...overrides }) {
    const { api, logger, config } = params;
    logger.info("Requesting billing", {
      shop: session.shop,
      plan,
      isTest,
      returnUrl
    });
    let result;
    try {
      result = await api.billing.request({
        plan,
        session,
        isTest,
        returnUrl,
        returnObject: true,
        ...overrides
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug("API token was invalid, redirecting to OAuth", {
          shop: session.shop
        });
        await config.sessionStorage.deleteSession(session.id);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }
    throw redirectOutOfApp(params, request, result.confirmationUrl, session.shop);
  };
}
function redirectOutOfApp(params, request, url, shop) {
  const { config, logger } = params;
  logger.debug("Redirecting out of app", { url });
  const requestUrl = new URL(request.url);
  const isEmbeddedRequest2 = requestUrl.searchParams.get("embedded") === "1";
  const isXhrRequest = request.headers.get("authorization");
  if (isXhrRequest) {
    throw new Response(void 0, {
      status: 401,
      statusText: "Unauthorized",
      headers: getAppBridgeHeaders(url)
    });
  } else if (isEmbeddedRequest2) {
    const params2 = new URLSearchParams({
      shop,
      host: requestUrl.searchParams.get("host"),
      exitIframe: url
    });
    throw redirect(`${config.auth.exitIframePath}?${params2.toString()}`);
  } else {
    throw redirect(url);
  }
}
function checkBillingFactory(params, request, session) {
  return async function checkBilling(options) {
    const { api, logger, config } = params;
    logger.debug("Checking billing plans", { shop: session.shop, ...options });
    try {
      return await api.billing.check({
        session,
        plans: options.plans,
        isTest: options.isTest,
        returnObject: true
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug("API token was invalid, redirecting to OAuth", {
          shop: session.shop
        });
        await config.sessionStorage.deleteSession(session.id);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }
  };
}
function graphqlClientFactory({ params, handleClientError, session }) {
  return async function query(operation, options) {
    const client = new params.api.clients.Graphql({
      session,
      apiVersion: options == null ? void 0 : options.apiVersion
    });
    try {
      const apiResponse = await client.request(operation, {
        variables: options == null ? void 0 : options.variables,
        retries: (options == null ? void 0 : options.tries) ? options.tries - 1 : 0,
        headers: options == null ? void 0 : options.headers
      });
      return new Response(JSON.stringify(apiResponse));
    } catch (error) {
      if (handleClientError) {
        throw await handleClientError({ error, params, session });
      }
      throw error;
    }
  };
}
function restClientFactory({ params, handleClientError, session }) {
  const { api } = params;
  const client = new RemixRestClient({
    params,
    handleClientError,
    session
  });
  if (api.rest) {
    client.resources = {};
    const RestResourceClient = restResourceClientFactory({
      params,
      handleClientError,
      session
    });
    Object.entries(api.rest).forEach(([name, resource]) => {
      class RemixResource extends resource {
      }
      RemixResource.Client = RestResourceClient;
      Reflect.defineProperty(RemixResource, "name", {
        value: name
      });
      Reflect.set(client.resources, name, RemixResource);
    });
  }
  return client;
}
class RemixRestClient {
  constructor({ params, session, handleClientError }) {
    this.params = params;
    this.handleClientError = handleClientError;
    this.session = session;
  }
  /**
   * Performs a GET request on the given path.
   */
  async get(params) {
    return this.makeRequest({
      method: "GET",
      ...params
    });
  }
  /**
   * Performs a POST request on the given path.
   */
  async post(params) {
    return this.makeRequest({
      method: "POST",
      ...params
    });
  }
  /**
   * Performs a PUT request on the given path.
   */
  async put(params) {
    return this.makeRequest({
      method: "PUT",
      ...params
    });
  }
  /**
   * Performs a DELETE request on the given path.
   */
  async delete(params) {
    return this.makeRequest({
      method: "DELETE",
      ...params
    });
  }
  async makeRequest(params) {
    const originalClient = new this.params.api.clients.Rest({
      session: this.session
    });
    const originalRequest = Reflect.get(originalClient, "request");
    try {
      const apiResponse = await originalRequest.call(originalClient, params);
      return new Response(JSON.stringify(apiResponse.body), {
        headers: apiResponse.headers
      });
    } catch (error) {
      if (this.handleClientError) {
        throw await this.handleClientError({
          error,
          session: this.session,
          params: this.params
        });
      } else
        throw new Error(error);
    }
  }
}
function restResourceClientFactory({ params, handleClientError, session }) {
  const { api } = params;
  const ApiClient = api.clients.Rest;
  return class RestResourceClient extends ApiClient {
    async request(requestParams) {
      const originalClient = new api.clients.Rest({ session });
      const originalRequest = Reflect.get(originalClient, "request");
      try {
        return await originalRequest.call(originalClient, requestParams);
      } catch (error) {
        if (handleClientError) {
          throw await handleClientError({ error, params, session });
        } else
          throw new Error(error);
      }
    }
  };
}
function adminClientFactory({ params, handleClientError, session }) {
  return {
    rest: restClientFactory({
      params,
      session,
      handleClientError
    }),
    graphql: graphqlClientFactory({ params, session, handleClientError })
  };
}
function createAdminApiContext(session, params, handleClientError) {
  return adminClientFactory({
    session,
    params,
    handleClientError
  });
}
async function redirectToShopifyOrAppRoot(request, params, responseHeaders) {
  const { api } = params;
  const url = new URL(request.url);
  const host = api.utils.sanitizeHost(url.searchParams.get("host"));
  const shop = api.utils.sanitizeShop(url.searchParams.get("shop"));
  const redirectUrl = api.config.isEmbeddedApp ? await api.auth.getEmbeddedAppUrl({ rawRequest: request }) : `/?shop=${shop}&host=${encodeURIComponent(host)}`;
  throw redirect(redirectUrl, { headers: responseHeaders });
}
const ensureAppIsEmbeddedIfRequired = async (params, request) => {
  const { api, logger, config } = params;
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (api.config.isEmbeddedApp && url.searchParams.get("embedded") !== "1") {
    logger.debug("App is not embedded, redirecting to Shopify", { shop });
    await redirectToShopifyOrAppRoot(request, { api });
  }
};
const SESSION_TOKEN_PARAM = "id_token";
const ensureSessionTokenSearchParamIfRequired = async (params, request) => {
  const { api, logger } = params;
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM);
  const isEmbedded = url.searchParams.get("embedded") === "1";
  if (api.config.isEmbeddedApp && isEmbedded && !searchParamSessionToken) {
    logger.debug("Missing session token in search params, going to bounce page", { shop });
    redirectToBouncePage(params, url);
  }
};
function addDocumentResponseHeadersFactory(params) {
  const { api, config } = params;
  return function(request, headers2) {
    const { searchParams } = new URL(request.url);
    const shop = api.utils.sanitizeShop(searchParams.get("shop"));
    addDocumentResponseHeaders(headers2, config.isEmbeddedApp, shop);
  };
}
function addDocumentResponseHeaders(headers2, isEmbeddedApp, shop) {
  if (shop) {
    headers2.set("Link", '<https://cdn.shopify.com/shopifycloud/app-bridge.js>; rel="preload"; as="script";');
  }
  if (isEmbeddedApp) {
    if (shop) {
      headers2.set("Content-Security-Policy", `frame-ancestors https://${shop} https://admin.shopify.com https://*.spin.dev;`);
    }
  } else {
    headers2.set("Content-Security-Policy", `frame-ancestors 'none';`);
  }
}
const FILE_URI_MATCH = /\/\/\//;
const INVALID_RELATIVE_URL = /[/\\][/\\]/;
const WHITESPACE_CHARACTER = /\s/;
const VALID_PROTOCOLS = ["https:", "http:"];
function isSafe(domain, redirectUrl, requireSSL = true) {
  if (typeof redirectUrl !== "string") {
    return false;
  }
  if (FILE_URI_MATCH.test(redirectUrl) || WHITESPACE_CHARACTER.test(redirectUrl)) {
    return false;
  }
  let url;
  try {
    url = new URL(redirectUrl, domain);
  } catch (error) {
    return false;
  }
  if (INVALID_RELATIVE_URL.test(url.pathname)) {
    return false;
  }
  if (!VALID_PROTOCOLS.includes(url.protocol)) {
    return false;
  }
  if (requireSSL && url.protocol !== "https:") {
    return false;
  }
  return true;
}
function sanitizeRedirectUrl(domain, redirectUrl, options = {}) {
  if (isSafe(domain, redirectUrl, options.requireSSL)) {
    return new URL(redirectUrl, domain);
  } else if (options.throwOnInvalid === false) {
    return void 0;
  } else {
    throw new ShopifyError("Invalid URL. Refusing to redirect");
  }
}
function renderAppBridge({ config }, request, redirectTo) {
  let redirectToScript = "";
  if (redirectTo) {
    const destination = sanitizeRedirectUrl(config.appUrl, redirectTo.url);
    const target = redirectTo.target ?? "_top";
    redirectToScript = `<script>window.open(${JSON.stringify(destination.toString())}, ${JSON.stringify(target)})<\/script>`;
  }
  const responseHeaders = new Headers({
    "content-type": "text/html;charset=utf-8"
  });
  addDocumentResponseHeaders(responseHeaders, config.isEmbeddedApp, new URL(request.url).searchParams.get("shop"));
  throw new Response(`
      <script data-api-key="${config.apiKey}" src="${appBridgeUrl()}"><\/script>
      ${redirectToScript}
    `, { headers: responseHeaders });
}
function redirectFactory(params, request) {
  const { config } = params;
  return function redirect$1(url, init) {
    const { searchParams } = new URL(request.url);
    const parsedUrl = new URL(url, config.appUrl);
    const isSameOrigin = parsedUrl.origin === config.appUrl;
    if (isSameOrigin || url.startsWith("/")) {
      searchParams.forEach((value, key) => {
        if (!parsedUrl.searchParams.has(key)) {
          parsedUrl.searchParams.set(key, value);
        }
      });
    }
    const target = typeof init !== "number" && (init == null ? void 0 : init.target) || "_self";
    if (target === "_self") {
      if (isBounceRequest(request)) {
        throw renderAppBridge(params, request, {
          url: parsedUrl.toString(),
          target
        });
      } else {
        return redirect(parsedUrl.toString(), init);
      }
    } else if (isDataRequest(request)) {
      throw redirectWithAppBridgeHeaders(parsedUrl.toString());
    } else if (isEmbeddedRequest(request)) {
      throw renderAppBridge(params, request, {
        url: parsedUrl.toString(),
        target
      });
    }
    return redirect(url, init);
  };
}
function isBounceRequest(request) {
  return Boolean(getSessionTokenHeader(request)) && request.headers.has("X-Shopify-Bounce");
}
function isDataRequest(request) {
  const isGet = request.method === "GET";
  const sessionTokenHeader = Boolean(getSessionTokenHeader(request));
  return sessionTokenHeader && !isBounceRequest(request) && (!isEmbeddedRequest(request) || !isGet);
}
function isEmbeddedRequest(request) {
  const { searchParams } = new URL(request.url);
  return searchParams.get("embedded") === "1";
}
function validateShopAndHostParams(params, request) {
  const { api, config, logger } = params;
  if (config.isEmbeddedApp) {
    const url = new URL(request.url);
    const shop = api.utils.sanitizeShop(url.searchParams.get("shop"));
    if (!shop) {
      logger.debug("Missing or invalid shop, redirecting to login path", {
        shop
      });
      throw redirect(config.auth.loginPath);
    }
    const host = api.utils.sanitizeHost(url.searchParams.get("host"));
    if (!host) {
      logger.debug("Invalid host, redirecting to login path", {
        host: url.searchParams.get("host")
      });
      throw redirect(config.auth.loginPath);
    }
  }
}
function authStrategyFactory({ strategy, ...params }) {
  const { api, logger, config } = params;
  async function respondToBouncePageRequest(request) {
    const url = new URL(request.url);
    if (url.pathname === config.auth.patchSessionTokenPath) {
      logger.debug("Rendering bounce page");
      throw renderAppBridge({ config }, request);
    }
  }
  async function respondToExitIframeRequest(request) {
    const url = new URL(request.url);
    if (url.pathname === config.auth.exitIframePath) {
      const destination = url.searchParams.get("exitIframe");
      logger.debug("Rendering exit iframe page", { destination });
      throw renderAppBridge({ config }, request, { url: destination });
    }
  }
  function createContext2(request, session, authStrategy, sessionToken) {
    const context = {
      admin: createAdminApiContext(session, params, authStrategy.handleClientError(request)),
      billing: {
        require: requireBillingFactory(params, request, session),
        check: checkBillingFactory(params, request, session),
        request: requestBillingFactory(params, request, session),
        cancel: cancelBillingFactory(params, request, session)
      },
      session,
      cors: ensureCORSHeadersFactory(params, request)
    };
    if (config.isEmbeddedApp) {
      return {
        ...context,
        sessionToken,
        redirect: redirectFactory(params, request)
      };
    } else {
      return context;
    }
  }
  return async function authenticateAdmin(request) {
    try {
      respondToBotRequest(params, request);
      respondToOptionsRequest(params, request);
      await respondToBouncePageRequest(request);
      await respondToExitIframeRequest(request);
      await strategy.respondToOAuthRequests(request);
      if (!getSessionTokenHeader(request)) {
        validateShopAndHostParams(params, request);
        await ensureAppIsEmbeddedIfRequired(params, request);
        await ensureSessionTokenSearchParamIfRequired(params, request);
      }
      logger.info("Authenticating admin request");
      const { payload, shop, sessionId, sessionToken } = await getSessionTokenContext(params, request);
      logger.debug("Loading session from storage", { sessionId });
      const existingSession = sessionId ? await config.sessionStorage.loadSession(sessionId) : void 0;
      const session = await strategy.authenticate(request, {
        session: existingSession,
        sessionToken,
        shop
      });
      logger.debug("Request is valid, loaded session from session token", {
        shop: session.shop,
        isOnline: session.isOnline
      });
      return createContext2(request, session, strategy, payload);
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        ensureCORSHeadersFactory(params, request)(errorOrResponse);
      }
      throw errorOrResponse;
    }
  };
}
async function getSessionTokenContext(params, request) {
  const { api, config, logger } = params;
  const headerSessionToken = getSessionTokenHeader(request);
  const searchParamSessionToken = getSessionTokenFromUrlParam(request);
  const sessionToken = headerSessionToken || searchParamSessionToken;
  logger.debug("Attempting to authenticate session token", {
    sessionToken: JSON.stringify({
      header: headerSessionToken,
      search: searchParamSessionToken
    })
  });
  if (config.isEmbeddedApp) {
    const payload = await validateSessionToken(params, request, sessionToken);
    const dest = new URL(payload.dest);
    const shop2 = dest.hostname;
    logger.debug("Session token is valid", { shop: shop2, payload });
    const sessionId2 = config.useOnlineTokens ? api.session.getJwtSessionId(shop2, payload.sub) : api.session.getOfflineId(shop2);
    return { shop: shop2, payload, sessionId: sessionId2, sessionToken };
  }
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const sessionId = await api.session.getCurrentId({
    isOnline: config.useOnlineTokens,
    rawRequest: request
  });
  return { shop, sessionId, payload: void 0, sessionToken };
}
function handleClientErrorFactory({ request, onError }) {
  return async function handleClientError({ error, params, session }) {
    if (error instanceof HttpResponseError !== true) {
      params.logger.debug(`Got a response error from the API: ${error.message}`);
      throw error;
    }
    params.logger.debug(`Got an HTTP response error from the API: ${error.message}`, {
      code: error.response.code,
      statusText: error.response.statusText,
      body: JSON.stringify(error.response.body)
    });
    if (onError) {
      await onError({ request, session, error });
    }
    throw new Response(JSON.stringify(error.response.body), {
      status: error.response.code,
      headers: {
        "Content-Type": error.response.headers["Content-Type"]
      }
    });
  };
}
function authenticateWebhookFactory(params) {
  const { api, config, logger } = params;
  return async function authenticate2(request) {
    if (request.method !== "POST") {
      logger.debug("Received a non-POST request for a webhook. Only POST requests are allowed.", { url: request.url, method: request.method });
      throw new Response(void 0, {
        status: 405,
        statusText: "Method not allowed"
      });
    }
    const rawBody = await request.text();
    const check = await api.webhooks.validate({
      rawBody,
      rawRequest: request
    });
    if (!check.valid) {
      if (check.reason === WebhookValidationErrorReason.InvalidHmac) {
        logger.debug("Webhook HMAC validation failed", check);
        throw new Response(void 0, {
          status: 401,
          statusText: "Unauthorized"
        });
      } else {
        logger.debug("Webhook validation failed", check);
        throw new Response(void 0, { status: 400, statusText: "Bad Request" });
      }
    }
    const sessionId = api.session.getOfflineId(check.domain);
    const session = await config.sessionStorage.loadSession(sessionId);
    const webhookContext = {
      apiVersion: check.apiVersion,
      shop: check.domain,
      topic: check.topic,
      webhookId: check.webhookId,
      payload: JSON.parse(rawBody),
      subTopic: check.subTopic || void 0,
      session: void 0,
      admin: void 0
    };
    if (!session) {
      return webhookContext;
    }
    let admin;
    if (config.future.v3_webhookAdminContext) {
      admin = adminClientFactory({
        params,
        session,
        handleClientError: handleClientErrorFactory({ request })
      });
    } else {
      const restClient = new api.clients.Rest({
        session,
        apiVersion: check.apiVersion
      });
      const graphqlClient = new api.clients.Graphql({
        session,
        apiVersion: check.apiVersion
      });
      Object.entries(api.rest).forEach(([name, resource]) => {
        Reflect.set(restClient, name, resource);
      });
      admin = {
        rest: restClient,
        graphql: graphqlClient
      };
    }
    return {
      ...webhookContext,
      session,
      admin
    };
  };
}
function overrideLogger(logger) {
  const baseContext = { package: "shopify-app" };
  const warningFunction = (message, context = {}) => logger.warning(message, { ...baseContext, ...context });
  function deprecated(warningFunction2) {
    return function(version, message) {
      if (semver.gte(SHOPIFY_REMIX_LIBRARY_VERSION, version)) {
        throw new FeatureDeprecatedError(`Feature was deprecated in version ${version}`);
      }
      return warningFunction2(`[Deprecated | ${version}] ${message}`);
    };
  }
  return {
    ...logger,
    log: (severity, message, context = {}) => logger.log(severity, message, { ...baseContext, ...context }),
    debug: (message, context = {}) => logger.debug(message, { ...baseContext, ...context }),
    info: (message, context = {}) => logger.info(message, { ...baseContext, ...context }),
    warning: warningFunction,
    error: (message, context = {}) => logger.error(message, { ...baseContext, ...context }),
    deprecated: deprecated(warningFunction)
  };
}
function loginFactory(params) {
  const { api, config, logger } = params;
  return async function login(request) {
    const url = new URL(request.url);
    const shopParam = url.searchParams.get("shop");
    if (request.method === "GET" && !shopParam) {
      return {};
    }
    const shop = shopParam || (await request.formData()).get("shop");
    if (!shop) {
      logger.debug("Missing shop parameter", { shop });
      return { shop: LoginErrorType.MissingShop };
    }
    const shopWithoutProtocol = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const shopWithDomain = (shop == null ? void 0 : shop.indexOf(".")) === -1 ? `${shopWithoutProtocol}.myshopify.com` : shopWithoutProtocol;
    const sanitizedShop = api.utils.sanitizeShop(shopWithDomain);
    if (!sanitizedShop) {
      logger.debug("Invalid shop parameter", { shop });
      return { shop: LoginErrorType.InvalidShop };
    }
    const authPath = `${config.appUrl}${config.auth.path}?shop=${sanitizedShop}`;
    const adminPath = api.utils.legacyUrlToShopAdminUrl(sanitizedShop);
    const installPath = `https://${adminPath}/oauth/install?client_id=${config.apiKey}`;
    const shouldInstall = config.isEmbeddedApp && config.future.unstable_newEmbeddedAuthStrategy;
    const redirectUrl = shouldInstall ? installPath : authPath;
    logger.info(`Redirecting login request to ${redirectUrl}`, {
      shop: sanitizedShop
    });
    throw redirect(redirectUrl);
  };
}
class SessionNotFoundError extends ShopifyError {
}
async function getOfflineSession(shop, { api, config }) {
  const offlineSessionId = api.session.getOfflineId(shop);
  const session = await config.sessionStorage.loadSession(offlineSessionId);
  return session;
}
function unauthenticatedAdminContextFactory(params) {
  return async (shop) => {
    const session = await getOfflineSession(shop, params);
    if (!session) {
      throw new SessionNotFoundError(`Could not find a session for shop ${shop} when creating unauthenticated admin context`);
    }
    return {
      session,
      admin: adminClientFactory({ params, session })
    };
  };
}
function authenticateCheckoutFactory(params) {
  return async function authenticateCheckout(request, options = {}) {
    const { logger } = params;
    const corsHeaders2 = options.corsHeaders ?? [];
    respondToBotRequest(params, request);
    respondToOptionsRequest(params, request, corsHeaders2);
    const sessionTokenHeader = getSessionTokenHeader(request);
    logger.info("Authenticating checkout request");
    if (!sessionTokenHeader) {
      logger.debug("Request did not contain a session token");
      throw new Response(void 0, {
        status: 401,
        statusText: "Unauthorized"
      });
    }
    return {
      sessionToken: await validateSessionToken(params, request, sessionTokenHeader, { checkAudience: false }),
      cors: ensureCORSHeadersFactory(params, request, corsHeaders2)
    };
  };
}
function storefrontClientFactory({ params, session }) {
  const { api } = params;
  return {
    graphql: async (query, options = {}) => {
      const client = new api.clients.Storefront({
        session,
        apiVersion: options.apiVersion
      });
      const apiResponse = await client.request(query, {
        variables: options == null ? void 0 : options.variables,
        retries: (options == null ? void 0 : options.tries) ? options.tries - 1 : 0,
        headers: options == null ? void 0 : options.headers
      });
      return new Response(JSON.stringify(apiResponse));
    }
  };
}
function authenticateAppProxyFactory(params) {
  const { api, config, logger } = params;
  return async function authenticate2(request) {
    logger.info("Authenticating app proxy request");
    const url = new URL(request.url);
    if (!await validateAppProxyHmac(params, url)) {
      logger.info("App proxy request has invalid signature");
      throw new Response(void 0, {
        status: 400,
        statusText: "Bad Request"
      });
    }
    const shop = url.searchParams.get("shop");
    const sessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      const context2 = {
        liquid,
        session: void 0,
        admin: void 0,
        storefront: void 0
      };
      return context2;
    }
    const context = {
      liquid,
      session,
      admin: adminClientFactory({ params, session }),
      storefront: storefrontClientFactory({ params, session })
    };
    return context;
  };
}
const liquid = (body, initAndOptions) => {
  const processedBody = processLiquidBody(body);
  if (typeof initAndOptions !== "object") {
    return new Response(processedBody, {
      status: initAndOptions || 200,
      headers: {
        "Content-Type": "application/liquid"
      }
    });
  }
  const { layout, ...responseInit } = initAndOptions || {};
  const responseBody = layout === false ? `{% layout none %} ${processedBody}` : processedBody;
  const headers2 = new Headers(responseInit.headers);
  headers2.set("Content-Type", "application/liquid");
  return new Response(responseBody, {
    ...responseInit,
    headers: headers2
  });
};
async function validateAppProxyHmac(params, url) {
  const { api, logger } = params;
  try {
    let searchParams = new URLSearchParams(url.search);
    if (!searchParams.get("index")) {
      searchParams.delete("index");
    }
    let isValid = await api.utils.validateHmac(Object.fromEntries(searchParams.entries()), { signator: "appProxy" });
    if (!isValid) {
      const cleanPath = url.pathname.replace(/^\//, "").replace(/\/$/, "").replaceAll("/", ".");
      const data = `routes%2F${cleanPath}`;
      searchParams = new URLSearchParams(`?_data=${data}&${searchParams.toString().replace(/^\?/, "")}`);
      isValid = await api.utils.validateHmac(Object.fromEntries(searchParams.entries()), { signator: "appProxy" });
      if (!isValid) {
        const searchParams2 = new URLSearchParams(`?_data=${data}._index&${url.search.replace(/^\?/, "")}`);
        isValid = await api.utils.validateHmac(Object.fromEntries(searchParams2.entries()), { signator: "appProxy" });
      }
    }
    return isValid;
  } catch (error) {
    logger.info(error.message);
    throw new Response(void 0, { status: 400, statusText: "Bad Request" });
  }
}
function processLiquidBody(body) {
  return body.replaceAll(/<(form[^>]+)action="(\/[^"?]+)(\?[^"]+)?">/g, '<$1action="$2/$3">').replaceAll(/<(a[^>]+)href="(\/[^"?]+)(\?[^"]+)?">/g, '<$1href="$2/$3">');
}
function authenticatePublicFactory(params) {
  const { logger, config } = params;
  const authenticateCheckout = authenticateCheckoutFactory(params);
  const authenticateAppProxy = authenticateAppProxyFactory(params);
  if (config.future.v3_authenticatePublic) {
    const context = {
      checkout: authenticateCheckout,
      appProxy: authenticateAppProxy
    };
    return context;
  }
  const authenticatePublic = (request, options) => {
    logger.deprecated("3.0.0", "authenticate.public() will be deprecated in v3. Use authenticate.public.checkout() instead.");
    return authenticateCheckout(request, options);
  };
  authenticatePublic.checkout = authenticateCheckout;
  authenticatePublic.appProxy = authenticateAppProxy;
  return authenticatePublic;
}
function unauthenticatedStorefrontContextFactory(params) {
  return async (shop) => {
    const session = await getOfflineSession(shop, params);
    if (!session) {
      throw new SessionNotFoundError(`Could not find a session for shop ${shop} when creating unauthenticated storefront context`);
    }
    return {
      session,
      storefront: storefrontClientFactory({ params, session })
    };
  };
}
async function triggerAfterAuthHook(params, session, request, authStrategy) {
  const { config, logger } = params;
  if (config.hooks.afterAuth) {
    logger.info("Running afterAuth hook");
    await config.hooks.afterAuth({
      session,
      admin: createAdminApiContext(session, params, authStrategy.handleClientError(request))
    });
  }
}
class AuthCodeFlowStrategy {
  constructor({ api, config, logger }) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }
  async respondToOAuthRequests(request) {
    const { api, config } = this;
    const url = new URL(request.url);
    const isAuthRequest = url.pathname === config.auth.path;
    const isAuthCallbackRequest = url.pathname === config.auth.callbackPath;
    if (isAuthRequest || isAuthCallbackRequest) {
      const shop = api.utils.sanitizeShop(url.searchParams.get("shop"));
      if (!shop)
        throw new Response("Shop param is invalid", { status: 400 });
      if (isAuthRequest) {
        throw await this.handleAuthBeginRequest(request, shop);
      } else {
        throw await this.handleAuthCallbackRequest(request, shop);
      }
    }
    if (!getSessionTokenHeader(request)) {
      await this.ensureInstalledOnShop(request);
    }
  }
  async authenticate(request, sessionContext) {
    const { api, config, logger } = this;
    const { shop, session } = sessionContext;
    if (!session) {
      logger.debug("No session found, redirecting to OAuth", { shop });
      await redirectToAuthPage({ config, api }, request, shop);
    } else if (!session.isActive(config.scopes)) {
      logger.debug("Found a session, but it has expired, redirecting to OAuth", { shop });
      await redirectToAuthPage({ config, api }, request, shop);
    }
    logger.debug("Found a valid session", { shop });
    return session;
  }
  handleClientError(request) {
    const { api, config, logger } = this;
    return handleClientErrorFactory({
      request,
      onError: async ({ session, error }) => {
        if (error.response.code === 401) {
          throw await redirectToAuthPage({ api, config }, request, session.shop);
        }
      }
    });
  }
  async ensureInstalledOnShop(request) {
    const { api, config, logger } = this;
    validateShopAndHostParams({ api, config, logger }, request);
    const url = new URL(request.url);
    let shop = url.searchParams.get("shop");
    logger.debug("Ensuring app is installed on shop", { shop });
    if (!await this.hasValidOfflineId(request)) {
      logger.info("Could not find a shop, can't authenticate request");
      throw new Response(void 0, {
        status: 400,
        statusText: "Bad Request"
      });
    }
    const offlineSession = await this.getOfflineSession(request);
    const isEmbedded = url.searchParams.get("embedded") === "1";
    if (!offlineSession) {
      logger.info("Shop hasn't installed app yet, redirecting to OAuth", {
        shop
      });
      if (isEmbedded) {
        redirectWithExitIframe({ api, config }, request, shop);
      } else {
        throw await beginAuth({ api, config }, request, false, shop);
      }
    }
    shop = shop || offlineSession.shop;
    if (config.isEmbeddedApp && !isEmbedded) {
      try {
        logger.debug("Ensuring offline session is valid before embedding", {
          shop
        });
        await this.testSession(offlineSession);
        logger.debug("Offline session is still valid, embedding app", { shop });
      } catch (error) {
        await this.handleInvalidOfflineSession(error, request, shop);
      }
    }
  }
  async handleAuthBeginRequest(request, shop) {
    const { api, config, logger } = this;
    logger.info("Handling OAuth begin request", { shop });
    if (config.isEmbeddedApp && request.headers.get("Sec-Fetch-Dest") === "iframe") {
      logger.debug("Auth request in iframe detected, exiting iframe", { shop });
      throw redirectWithExitIframe({ api, config }, request, shop);
    } else {
      throw await beginAuth({ api, config }, request, false, shop);
    }
  }
  async handleAuthCallbackRequest(request, shop) {
    const { api, config, logger } = this;
    logger.info("Handling OAuth callback request");
    try {
      const { session, headers: responseHeaders } = await api.auth.callback({
        rawRequest: request
      });
      await config.sessionStorage.storeSession(session);
      if (config.useOnlineTokens && !session.isOnline) {
        logger.info("Requesting online access token for offline session");
        await beginAuth({ api, config, logger }, request, true, shop);
      }
      await triggerAfterAuthHook({ api, config, logger }, session, request, this);
      throw await redirectToShopifyOrAppRoot(request, { api, config, logger }, responseHeaders);
    } catch (error) {
      if (error instanceof Response)
        throw error;
      throw await this.oauthCallbackError(error, request, shop);
    }
  }
  async getOfflineSession(request) {
    const offlineId = await this.getOfflineSessionId(request);
    return this.config.sessionStorage.loadSession(offlineId);
  }
  async hasValidOfflineId(request) {
    return Boolean(await this.getOfflineSessionId(request));
  }
  async getOfflineSessionId(request) {
    const { api } = this;
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    return shop ? api.session.getOfflineId(shop) : api.session.getCurrentId({ isOnline: false, rawRequest: request });
  }
  async testSession(session) {
    const { api } = this;
    const client = new api.clients.Graphql({
      session
    });
    await client.request(`#graphql
      query shopifyAppShopName {
        shop {
          name
        }
      }
    `);
  }
  async oauthCallbackError(error, request, shop) {
    const { logger } = this;
    logger.error("Error during OAuth callback", { error: error.message });
    if (error instanceof CookieNotFound) {
      return this.handleAuthBeginRequest(request, shop);
    }
    if (error instanceof InvalidHmacError || error instanceof InvalidOAuthError) {
      return new Response(void 0, {
        status: 400,
        statusText: "Invalid OAuth Request"
      });
    }
    return new Response(void 0, {
      status: 500,
      statusText: "Internal Server Error"
    });
  }
  async handleInvalidOfflineSession(error, request, shop) {
    const { api, logger, config } = this;
    if (error instanceof HttpResponseError) {
      if (error.response.code === 401) {
        logger.info("Shop session is no longer valid, redirecting to OAuth", {
          shop
        });
        throw await beginAuth({ api, config }, request, false, shop);
      } else {
        const message = JSON.stringify(error.response.body, null, 2);
        logger.error(`Unexpected error during session validation: ${message}`, {
          shop
        });
        throw new Response(void 0, {
          status: error.response.code,
          statusText: error.response.statusText
        });
      }
    } else if (error instanceof GraphqlQueryError) {
      const context = { shop };
      if (error.response) {
        context.response = JSON.stringify(error.body);
      }
      logger.error(`Unexpected error during session validation: ${error.message}`, context);
      throw new Response(void 0, {
        status: 500,
        statusText: "Internal Server Error"
      });
    }
  }
}
class TokenExchangeStrategy {
  constructor({ api, config, logger }) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }
  async respondToOAuthRequests(_request) {
  }
  async authenticate(request, sessionContext) {
    const { api, config, logger } = this;
    const { shop, session, sessionToken } = sessionContext;
    if (!sessionToken)
      throw new InvalidJwtError();
    if (!session || session.isExpired()) {
      logger.info("No valid session found");
      logger.info("Requesting offline access token");
      const { session: offlineSession } = await this.exchangeToken({
        request,
        sessionToken,
        shop,
        requestedTokenType: RequestedTokenType.OfflineAccessToken
      });
      await config.sessionStorage.storeSession(offlineSession);
      let newSession = offlineSession;
      if (config.useOnlineTokens) {
        logger.info("Requesting online access token");
        const { session: onlineSession } = await this.exchangeToken({
          request,
          sessionToken,
          shop,
          requestedTokenType: RequestedTokenType.OnlineAccessToken
        });
        await config.sessionStorage.storeSession(onlineSession);
        newSession = onlineSession;
      }
      try {
        await this.handleAfterAuthHook({ api, config, logger }, newSession, request, sessionToken);
      } catch (error) {
        throw new Response(void 0, {
          status: 500,
          statusText: "Internal Server Error"
        });
      }
      return newSession;
    }
    return session;
  }
  handleClientError(request) {
    const { api, config, logger } = this;
    return handleClientErrorFactory({
      request,
      onError: async ({ session, error }) => {
        if (error.response.code === 401) {
          config.sessionStorage.deleteSession(session.id);
          respondToInvalidSessionToken({
            params: { config, api, logger },
            request
          });
        }
      }
    });
  }
  async exchangeToken({ request, shop, sessionToken, requestedTokenType }) {
    var _a2;
    const { api, config, logger } = this;
    try {
      return await api.auth.tokenExchange({
        sessionToken,
        shop,
        requestedTokenType
      });
    } catch (error) {
      if (error instanceof InvalidJwtError || error instanceof HttpResponseError && error.response.code === 400 && ((_a2 = error.response.body) == null ? void 0 : _a2.error) === "invalid_subject_token") {
        throw respondToInvalidSessionToken({
          params: { api, config, logger },
          request,
          retryRequest: true
        });
      }
      throw new Response(void 0, {
        status: 500,
        statusText: "Internal Server Error"
      });
    }
  }
  async handleAfterAuthHook(params, session, request, sessionToken) {
    const { config } = params;
    await config.idempotentPromiseHandler.handlePromise({
      promiseFunction: () => {
        return triggerAfterAuthHook(params, session, request, this);
      },
      identifier: sessionToken
    });
  }
}
const IDENTIFIER_TTL_MS = 6e4;
class IdempotentPromiseHandler {
  constructor() {
    this.identifiers = /* @__PURE__ */ new Map();
  }
  async handlePromise({ promiseFunction, identifier }) {
    try {
      if (this.isPromiseRunnable(identifier)) {
        await promiseFunction();
      }
    } finally {
      this.clearStaleIdentifiers();
    }
    return Promise.resolve();
  }
  isPromiseRunnable(identifier) {
    if (!this.identifiers.has(identifier)) {
      this.identifiers.set(identifier, Date.now());
      return true;
    }
    return false;
  }
  async clearStaleIdentifiers() {
    this.identifiers.forEach((date, identifier, map) => {
      if (Date.now() - date > IDENTIFIER_TTL_MS) {
        map.delete(identifier);
      }
    });
  }
}
function authenticateFlowFactory(params) {
  const { api, config, logger } = params;
  return async function authenticate2(request) {
    logger.info("Authenticating flow request");
    if (request.method !== "POST") {
      logger.debug("Received a non-POST request for flow. Only POST requests are allowed.", { url: request.url, method: request.method });
      throw new Response(void 0, {
        status: 405,
        statusText: "Method not allowed"
      });
    }
    const rawBody = await request.text();
    const result = await api.flow.validate({
      rawBody,
      rawRequest: request
    });
    if (!result.valid) {
      logger.error("Received an invalid flow request", { reason: result.reason });
      throw new Response(void 0, {
        status: 400,
        statusText: "Bad Request"
      });
    }
    const payload = JSON.parse(rawBody);
    logger.debug("Flow request is valid, looking for an offline session", {
      shop: payload.shopify_domain
    });
    const sessionId = api.session.getOfflineId(payload.shopify_domain);
    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      logger.info("Flow request could not find session", {
        shop: payload.shopify_domain
      });
      throw new Response(void 0, {
        status: 400,
        statusText: "Bad Request"
      });
    }
    logger.debug("Found a session for the flow request", { shop: session.shop });
    return {
      session,
      payload,
      admin: adminClientFactory({ params, session })
    };
  };
}
function authenticateFulfillmentServiceFactory(params) {
  const { api, config, logger } = params;
  return async function authenticate2(request) {
    logger.info("Authenticating fulfillment service request");
    if (request.method !== "POST") {
      logger.debug("Received a non-POST request for fulfillment service. Only POST requests are allowed.", { url: request.url, method: request.method });
      throw new Response(void 0, {
        status: 405,
        statusText: "Method not allowed"
      });
    }
    const rawBody = await request.text();
    const result = await api.fulfillmentService.validate({
      rawBody,
      rawRequest: request
    });
    if (!result.valid) {
      logger.error("Received an invalid fulfillment service request", {
        reason: result.reason
      });
      throw new Response(void 0, {
        status: 400,
        statusText: "Bad Request"
      });
    }
    const payload = JSON.parse(rawBody);
    const shop = request.headers.get(ShopifyHeader.Domain) || "";
    logger.debug("Fulfillment service request is valid, looking for an offline session", {
      shop
    });
    const sessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      logger.info("Fulfillment service request could not find session", {
        shop
      });
      throw new Response(void 0, {
        status: 400,
        statusText: "Bad Request"
      });
    }
    logger.debug("Found a session for the fulfillment service request", {
      shop
    });
    return {
      session,
      payload,
      admin: adminClientFactory({ params, session })
    };
  };
}
function logDisabledFutureFlags(config, logger) {
  const logFlag = (flag, message) => logger.info(`Future flag ${flag} is disabled.

  ${message}
`);
  if (!config.future.v3_authenticatePublic) {
    logFlag("v3_authenticatePublic", "Enable this flag to allow appProxy and checkout in `shopify.authenticate.public`.");
  }
  if (!config.future.v3_lineItemBilling) {
    logFlag("v3_lineItemBilling", "Enable this flag to allow billing plans with multiple line items.");
  }
  if (!config.future.v3_webhookAdminContext) {
    logFlag("v3_webhookAdminContext", "Enable this flag to use the standard Admin context when calling `shopify.authenticate.webhook`.");
  }
  if (!config.future.unstable_newEmbeddedAuthStrategy) {
    logFlag("unstable_newEmbeddedAuthStrategy", "Enable this to use OAuth token exchange instead of auth code to generate API access tokens.\n  Your app must be using Shopify managed install: https://shopify.dev/docs/apps/auth/installation");
  }
}
function shopifyApp(appConfig) {
  const api = deriveApi(appConfig);
  const config = deriveConfig(appConfig, api.config);
  const logger = overrideLogger(api.logger);
  if (appConfig.webhooks) {
    api.webhooks.addHandlers(appConfig.webhooks);
  }
  const params = { api, config, logger };
  const authStrategy = authStrategyFactory({
    ...params,
    strategy: config.future.unstable_newEmbeddedAuthStrategy && config.isEmbeddedApp ? new TokenExchangeStrategy(params) : new AuthCodeFlowStrategy(params)
  });
  const shopify2 = {
    sessionStorage: config.sessionStorage,
    addDocumentResponseHeaders: addDocumentResponseHeadersFactory(params),
    registerWebhooks: registerWebhooksFactory(params),
    authenticate: {
      admin: authStrategy,
      flow: authenticateFlowFactory(params),
      public: authenticatePublicFactory(params),
      fulfillmentService: authenticateFulfillmentServiceFactory(params),
      webhook: authenticateWebhookFactory(params)
    },
    unauthenticated: {
      admin: unauthenticatedAdminContextFactory(params),
      storefront: unauthenticatedStorefrontContextFactory(params)
    }
  };
  if (isAppStoreApp(shopify2, appConfig) || isSingleMerchantApp(shopify2, appConfig)) {
    shopify2.login = loginFactory(params);
  }
  logDisabledFutureFlags(config, logger);
  return shopify2;
}
function isAppStoreApp(_shopify, config) {
  return config.distribution === AppDistribution.AppStore;
}
function isSingleMerchantApp(_shopify, config) {
  return config.distribution === AppDistribution.SingleMerchant;
}
function deriveApi(appConfig) {
  var _a2;
  let appUrl;
  try {
    appUrl = new URL(appConfig.appUrl);
  } catch (error) {
    throw new ShopifyError("Invalid appUrl provided. Please provide a valid URL.");
  }
  if (appUrl.hostname === "localhost" && !appUrl.port && process.env.PORT) {
    appUrl.port = process.env.PORT;
  }
  appConfig.appUrl = appUrl.origin;
  let userAgentPrefix = `Shopify Remix Library v${SHOPIFY_REMIX_LIBRARY_VERSION}`;
  if (appConfig.userAgentPrefix) {
    userAgentPrefix = `${appConfig.userAgentPrefix} | ${userAgentPrefix}`;
  }
  return shopifyApi({
    ...appConfig,
    hostName: appUrl.host,
    hostScheme: appUrl.protocol.replace(":", ""),
    userAgentPrefix,
    isEmbeddedApp: appConfig.isEmbeddedApp ?? true,
    apiVersion: appConfig.apiVersion ?? LATEST_API_VERSION,
    isCustomStoreApp: appConfig.distribution === AppDistribution.ShopifyAdmin,
    future: {
      lineItemBilling: (_a2 = appConfig.future) == null ? void 0 : _a2.v3_lineItemBilling
    },
    _logDisabledFutureFlags: false
  });
}
function deriveConfig(appConfig, apiConfig) {
  if (!appConfig.sessionStorage) {
    throw new ShopifyError("Please provide a valid session storage. Refer to https://github.com/Shopify/shopify-app-js/blob/main/README.md#session-storage-options for options.");
  }
  const authPathPrefix = appConfig.authPathPrefix || "/auth";
  appConfig.distribution = appConfig.distribution ?? AppDistribution.AppStore;
  return {
    ...appConfig,
    ...apiConfig,
    scopes: apiConfig.scopes,
    idempotentPromiseHandler: new IdempotentPromiseHandler(),
    canUseLoginForm: appConfig.distribution !== AppDistribution.ShopifyAdmin,
    useOnlineTokens: appConfig.useOnlineTokens ?? false,
    hooks: appConfig.hooks ?? {},
    sessionStorage: appConfig.sessionStorage,
    future: appConfig.future ?? {},
    auth: {
      path: authPathPrefix,
      callbackPath: `${authPathPrefix}/callback`,
      patchSessionTokenPath: `${authPathPrefix}/session-token`,
      exitIframePath: `${authPathPrefix}/exit-iframe`,
      loginPath: `${authPathPrefix}/login`
    }
  };
}
setAbstractRuntimeString(() => {
  return `Remix`;
});
const prisma = global.prismaClient || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prisma;
}
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  webhooks: {},
  hooks: {},
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    v3_lineItemBilling: true,
    unstable_newEmbeddedAuthStrategy: false
  }
});
shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const loader$7 = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || "";
  const make = url.searchParams.get("make") || "";
  const model = url.searchParams.get("model") || "";
  const years = await prisma.vehicleYear.findMany({ orderBy: { year: "desc" } });
  const makes = year ? await prisma.vehicleMake.findMany({
    where: { year: { year: parseInt(year) } },
    orderBy: { name: "asc" }
  }) : [];
  const models = make && year ? await prisma.vehicleModel.findMany({
    where: { make: { name: make, year: { year: parseInt(year) } } },
    orderBy: { name: "asc" }
  }) : [];
  const compatibilities = model ? await prisma.productCompatibility.findMany({
    where: { model: { name: model, make: { name: make, year: { year: parseInt(year) } } } },
    include: { model: { include: { make: { include: { year: true } } } } },
    orderBy: { createdAt: "desc" }
  }) : [];
  return json({ years, makes, models, compatibilities, filters: { year, make, model } });
};
const action$2 = async ({ request }) => {
  await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "add") {
    const modelId = parseInt(form.get("modelId"));
    const shopifyProductId = form.get("shopifyProductId");
    const productTitle = form.get("productTitle");
    const notes = form.get("notes");
    await prisma.productCompatibility.upsert({
      where: { shopifyProductId_modelId: { shopifyProductId, modelId } },
      update: { productTitle, notes },
      create: { shopifyProductId, productTitle, modelId, notes }
    });
    return json({ success: true });
  }
  if (intent === "delete") {
    const id = parseInt(form.get("id"));
    await prisma.productCompatibility.delete({ where: { id } });
    return json({ success: true });
  }
  return json({ error: "Unknown intent" }, { status: 400 });
};
function Compatibility() {
  var _a2;
  const { years, makes, models, compatibilities, filters } = useLoaderData();
  const submit = useSubmit();
  const nav = useNavigation();
  const loading = nav.state !== "idle";
  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const yearOptions = [{ label: "Select year", value: "" }, ...years.map((y) => ({ label: String(y.year), value: String(y.year) }))];
  const makeOptions = [{ label: "Select make", value: "" }, ...makes.map((m) => ({ label: m.name, value: m.name }))];
  const modelOptions = [{ label: "Select model", value: "" }, ...models.map((m) => ({ label: m.name, value: String(m.id) }))];
  const handleFilterChange = (key, value) => {
    const params = { ...filters };
    params[key] = value;
    if (key === "year") {
      params.make = "";
      params.model = "";
    }
    if (key === "make") {
      params.model = "";
    }
    submit(params, { method: "get" });
  };
  const handleAdd = () => {
    if (!productId || !productTitle || !selectedModelId) return;
    const formData = new FormData();
    formData.append("intent", "add");
    formData.append("modelId", selectedModelId);
    formData.append("shopifyProductId", productId);
    formData.append("productTitle", productTitle);
    formData.append("notes", notes);
    submit(formData, { method: "post" });
    setModalOpen(false);
    setProductId("");
    setProductTitle("");
    setNotes("");
  };
  const handleDelete = (id) => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", String(id));
    submit(formData, { method: "post" });
  };
  const rows = compatibilities.map((c) => [
    c.productTitle,
    `${c.model.make.year.year} ${c.model.make.name} ${c.model.name}`,
    c.notes || "—",
    /* @__PURE__ */ jsx(Button, { tone: "critical", size: "micro", onClick: () => handleDelete(c.id), children: "Remove" })
  ]);
  return /* @__PURE__ */ jsxs(
    Page,
    {
      title: "Compatibility Manager",
      primaryAction: filters.model ? { content: "Add Compatibility Rule", onAction: () => {
        var _a3;
        setSelectedModelId(((_a3 = models.find((m) => m.name === filters.model)) == null ? void 0 : _a3.id.toString()) || "");
        setModalOpen(true);
      } } : void 0,
      children: [
        /* @__PURE__ */ jsxs(Layout, { children: [
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Filter by Vehicle" }),
            /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "300", children: [
              /* @__PURE__ */ jsx(Select, { label: "Year", options: yearOptions, value: filters.year, onChange: (v) => handleFilterChange("year", v) }),
              /* @__PURE__ */ jsx(Select, { label: "Make", options: makeOptions, value: filters.make, onChange: (v) => handleFilterChange("make", v), disabled: !filters.year }),
              /* @__PURE__ */ jsx(Select, { label: "Model", options: modelOptions, value: filters.model ? String(((_a2 = models.find((m) => m.name === filters.model)) == null ? void 0 : _a2.id) || "") : "", onChange: (v) => {
                var _a3;
                const name = ((_a3 = models.find((m) => m.id === parseInt(v))) == null ? void 0 : _a3.name) || "";
                handleFilterChange("model", name);
              }, disabled: !filters.make })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: filters.model ? `Parts compatible with ${filters.year} ${filters.make} ${filters.model}` : "Select a vehicle above to see compatible parts" }),
              loading && /* @__PURE__ */ jsx(Spinner, { size: "small" })
            ] }),
            compatibilities.length > 0 ? /* @__PURE__ */ jsx(
              DataTable,
              {
                columnContentTypes: ["text", "text", "text", "text"],
                headings: ["Product", "Vehicle", "Notes", "Action"],
                rows
              }
            ) : filters.model ? /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Banner, { tone: "warning", children: /* @__PURE__ */ jsx("p", { children: 'No compatible parts found for this vehicle. Click "Add Compatibility Rule" to add one.' }) }) }) : null
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx(
          Modal,
          {
            open: modalOpen,
            onClose: () => setModalOpen(false),
            title: `Add part compatible with ${filters.year} ${filters.make} ${filters.model}`,
            primaryAction: { content: "Add Rule", onAction: handleAdd, disabled: !productId || !productTitle },
            secondaryActions: [{ content: "Cancel", onAction: () => setModalOpen(false) }],
            children: /* @__PURE__ */ jsx(Modal.Section, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
              /* @__PURE__ */ jsx(
                TextField,
                {
                  label: "Shopify Product GID",
                  value: productId,
                  onChange: setProductId,
                  placeholder: "gid://shopify/Product/123456789",
                  helpText: "Find this in your Shopify admin URL when viewing the product",
                  autoComplete: "off"
                }
              ),
              /* @__PURE__ */ jsx(
                TextField,
                {
                  label: "Product Title",
                  value: productTitle,
                  onChange: setProductTitle,
                  placeholder: "e.g. OEM Brake Pad Set Front",
                  autoComplete: "off"
                }
              ),
              /* @__PURE__ */ jsx(
                TextField,
                {
                  label: "Notes (optional)",
                  value: notes,
                  onChange: setNotes,
                  placeholder: "e.g. Fits 4WD only",
                  multiline: 2,
                  autoComplete: "off"
                }
              )
            ] }) })
          }
        )
      ]
    }
  );
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: Compatibility,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({ request }) => {
  var _a2;
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const year = url.searchParams.get("year") || "";
  const make = url.searchParams.get("make") || "";
  const model = url.searchParams.get("model") || "";
  const years = await prisma.vehicleYear.findMany({ orderBy: { year: "desc" } });
  const makes = year ? await prisma.vehicleMake.findMany({ where: { year: { year: parseInt(year) } }, orderBy: { name: "asc" } }) : [];
  const models = make && year ? await prisma.vehicleModel.findMany({ where: { make: { name: make, year: { year: parseInt(year) } } }, orderBy: { name: "asc" } }) : [];
  let inventoryData = [];
  if (model && make && year) {
    const compatibilities = await prisma.productCompatibility.findMany({
      where: { model: { name: model, make: { name: make, year: { year: parseInt(year) } } } }
    });
    if (compatibilities.length > 0) {
      const productIds = compatibilities.map((c) => c.shopifyProductId);
      const query = `
        query getProductInventory($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              status
              totalInventory
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    inventoryQuantity
                    price
                    sku
                  }
                }
              }
            }
          }
        }
      `;
      try {
        const response = await admin.graphql(query, { variables: { ids: productIds } });
        const data = await response.json();
        inventoryData = (((_a2 = data.data) == null ? void 0 : _a2.nodes) || []).filter(Boolean);
      } catch (e) {
        inventoryData = compatibilities.map((c) => ({
          id: c.shopifyProductId,
          title: c.productTitle,
          status: "UNKNOWN",
          totalInventory: null,
          variants: { edges: [] }
        }));
      }
    }
  }
  return json({ years, makes, models, inventoryData, filters: { year, make, model } });
};
function Inventory() {
  const { years, makes, models, inventoryData, filters } = useLoaderData();
  const submit = useSubmit();
  const yearOptions = [{ label: "Select year", value: "" }, ...years.map((y) => ({ label: String(y.year), value: String(y.year) }))];
  const makeOptions = [{ label: "Select make", value: "" }, ...makes.map((m) => ({ label: m.name, value: m.name }))];
  const modelOptions = [{ label: "Select model", value: "" }, ...models.map((m) => ({ label: m.name, value: m.name }))];
  const handleFilterChange = (key, value) => {
    const params = { ...filters };
    params[key] = value;
    if (key === "year") {
      params.make = "";
      params.model = "";
    }
    if (key === "make") {
      params.model = "";
    }
    submit(params, { method: "get" });
  };
  const statusBadge = (status) => {
    if (status === "ACTIVE") return /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" });
    if (status === "DRAFT") return /* @__PURE__ */ jsx(Badge, { tone: "attention", children: "Draft" });
    if (status === "ARCHIVED") return /* @__PURE__ */ jsx(Badge, { tone: "critical", children: "Archived" });
    return /* @__PURE__ */ jsx(Badge, { children: "Unknown" });
  };
  const rows = inventoryData.map((p) => {
    var _a2, _b, _c, _d, _e, _f;
    return [
      p.title,
      statusBadge(p.status),
      p.totalInventory !== null ? /* @__PURE__ */ jsxs(Text, { as: "span", tone: p.totalInventory <= 0 ? "critical" : p.totalInventory < 5 ? "caution" : "success", children: [
        p.totalInventory,
        " units"
      ] }) : "—",
      ((_b = (_a2 = p.variants) == null ? void 0 : _a2.edges) == null ? void 0 : _b.length) || 0,
      ((_f = (_e = (_d = (_c = p.variants) == null ? void 0 : _c.edges) == null ? void 0 : _d[0]) == null ? void 0 : _e.node) == null ? void 0 : _f.sku) || "—"
    ];
  });
  const totalStock = inventoryData.reduce((sum, p) => sum + (p.totalInventory || 0), 0);
  const outOfStock = inventoryData.filter((p) => p.totalInventory <= 0).length;
  const lowStock = inventoryData.filter((p) => p.totalInventory > 0 && p.totalInventory < 5).length;
  return /* @__PURE__ */ jsx(Page, { title: "Inventory by Vehicle", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Select Vehicle" }),
      /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "300", children: [
        /* @__PURE__ */ jsx(Select, { label: "Year", options: yearOptions, value: filters.year, onChange: (v) => handleFilterChange("year", v) }),
        /* @__PURE__ */ jsx(Select, { label: "Make", options: makeOptions, value: filters.make, onChange: (v) => handleFilterChange("make", v), disabled: !filters.year }),
        /* @__PURE__ */ jsx(Select, { label: "Model", options: modelOptions, value: filters.model, onChange: (v) => handleFilterChange("model", v), disabled: !filters.make })
      ] })
    ] }) }) }),
    filters.model && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "400", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Total Stock" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalStock })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Out of Stock" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", tone: outOfStock > 0 ? "critical" : void 0, children: outOfStock })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Low Stock (<5)" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", tone: lowStock > 0 ? "caution" : void 0, children: lowStock })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: filters.model ? `Parts for ${filters.year} ${filters.make} ${filters.model}` : "Select a vehicle to see inventory" }),
      inventoryData.length > 0 ? /* @__PURE__ */ jsx(
        DataTable,
        {
          columnContentTypes: ["text", "text", "numeric", "numeric", "text"],
          headings: ["Product", "Status", "Stock", "Variants", "SKU"],
          rows
        }
      ) : filters.model ? /* @__PURE__ */ jsx(Banner, { tone: "info", children: /* @__PURE__ */ jsx("p", { children: "No parts found for this vehicle. Add compatibility rules in the Compatibility Manager." }) }) : null
    ] }) }) })
  ] }) });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Inventory,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Customer-Token, X-Shop-Domain"
};
function getIdentity(request) {
  const token = request.headers.get("X-Customer-Token");
  const shop = request.headers.get("X-Shop-Domain");
  if (!token || !shop) return null;
  return { customerId: token, shop };
}
const loader$5 = async ({ request }) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const identity = getIdentity(request);
  if (!identity) return json({ error: "Missing identity headers" }, { status: 401, headers: cors });
  const vehicles = await prisma.garageVehicle.findMany({
    where: { customerId: identity.customerId, shop: identity.shop },
    include: { model: { include: { make: { include: { year: true } } } } },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
  });
  return json({
    vehicles: vehicles.map((v) => ({
      id: v.id,
      nickname: v.nickname,
      year: v.model.make.year.year,
      make: v.model.make.name,
      model: v.model.name,
      submodel: v.submodel,
      engine: v.engine,
      isDefault: v.isDefault,
      label: `${v.model.make.year.year} ${v.model.make.name} ${v.model.name}${v.submodel ? " " + v.submodel : ""}`
    }))
  }, { headers: cors });
};
const action$1 = async ({ request }) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const identity = getIdentity(request);
  if (!identity) return json({ error: "Missing identity headers" }, { status: 401, headers: cors });
  const body = await request.json().catch(() => ({}));
  if (request.method === "POST") {
    const { year, make, model, nickname, submodel, engine, setDefault } = body;
    if (!year || !make || !model) return json({ error: "year, make, model required" }, { status: 400, headers: cors });
    const vehicleModel = await prisma.vehicleModel.findFirst({
      where: { name: model, make: { name: make, year: { year: parseInt(year) } } }
    });
    if (!vehicleModel) return json({ error: "Vehicle not found in database" }, { status: 404, headers: cors });
    const count = await prisma.garageVehicle.count({ where: { customerId: identity.customerId, shop: identity.shop } });
    if (count >= 5) return json({ error: "Garage is full (max 5 vehicles). Remove one first." }, { status: 400, headers: cors });
    if (setDefault) {
      await prisma.garageVehicle.updateMany({
        where: { customerId: identity.customerId, shop: identity.shop },
        data: { isDefault: false }
      });
    }
    const vehicle = await prisma.garageVehicle.create({
      data: {
        customerId: identity.customerId,
        shop: identity.shop,
        modelId: vehicleModel.id,
        nickname: nickname || null,
        submodel: submodel || null,
        engine: engine || null,
        isDefault: setDefault || count === 0
        // first vehicle is always default
      },
      include: { model: { include: { make: { include: { year: true } } } } }
    });
    return json({
      success: true,
      vehicle: {
        id: vehicle.id,
        nickname: vehicle.nickname,
        year: vehicle.model.make.year.year,
        make: vehicle.model.make.name,
        model: vehicle.model.name,
        submodel: vehicle.submodel,
        engine: vehicle.engine,
        isDefault: vehicle.isDefault,
        label: `${vehicle.model.make.year.year} ${vehicle.model.make.name} ${vehicle.model.name}`
      }
    }, { headers: cors });
  }
  if (request.method === "DELETE") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, { status: 400, headers: cors });
    const vehicle = await prisma.garageVehicle.findFirst({
      where: { id: parseInt(id), customerId: identity.customerId, shop: identity.shop }
    });
    if (!vehicle) return json({ error: "Vehicle not found" }, { status: 404, headers: cors });
    await prisma.garageVehicle.delete({ where: { id: parseInt(id) } });
    if (vehicle.isDefault) {
      const next = await prisma.garageVehicle.findFirst({
        where: { customerId: identity.customerId, shop: identity.shop },
        orderBy: { createdAt: "desc" }
      });
      if (next) await prisma.garageVehicle.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return json({ success: true }, { headers: cors });
  }
  if (request.method === "PATCH") {
    const { id } = body;
    if (!id) return json({ error: "id required" }, { status: 400, headers: cors });
    await prisma.garageVehicle.updateMany({
      where: { customerId: identity.customerId, shop: identity.shop },
      data: { isDefault: false }
    });
    await prisma.garageVehicle.update({ where: { id: parseInt(id) }, data: { isDefault: true } });
    return json({ success: true }, { headers: cors });
  }
  return json({ error: "Method not allowed" }, { status: 405, headers: cors });
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const jobs = await prisma.importJob.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 10
  });
  return json({ jobs });
};
const action = async ({ request }) => {
  var _a2, _b;
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "import") {
    const csvText = form.get("csv");
    const filename = form.get("filename") || "upload.csv";
    if (!csvText) return json({ error: "No CSV data provided" }, { status: 400 });
    const lines = csvText.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
    const job = await prisma.importJob.create({
      data: { shop: session.shop, filename, status: "processing", totalRows: lines.length - 1 }
    });
    const errors = [];
    let imported = 0;
    let skipped = 0;
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
    const idx = {
      year: header.indexOf("year"),
      make: header.indexOf("make"),
      model: header.indexOf("model"),
      product_id: header.indexOf("product_id"),
      product_title: header.indexOf("product_title"),
      notes: header.indexOf("notes")
    };
    if (idx.year === -1 || idx.make === -1 || idx.model === -1) {
      await prisma.importJob.update({
        where: { id: job.id },
        data: { status: "failed", errors: JSON.stringify(["Missing required columns: year, make, model"]) }
      });
      return json({ error: "Missing required columns: year, make, model" }, { status: 400 });
    }
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const year = parseInt(cols[idx.year]);
      const make = (_a2 = cols[idx.make]) == null ? void 0 : _a2.toUpperCase();
      const model = (_b = cols[idx.model]) == null ? void 0 : _b.toUpperCase();
      const productId = idx.product_id !== -1 ? cols[idx.product_id] : null;
      const productTitle = idx.product_title !== -1 ? cols[idx.product_title] : null;
      const notes = idx.notes !== -1 ? cols[idx.notes] : null;
      if (!year || !make || !model) {
        errors.push(`Row ${i + 1}: Missing year, make, or model`);
        skipped++;
        continue;
      }
      try {
        let yearRecord = await prisma.year.findFirst({ where: { year } });
        if (!yearRecord) yearRecord = await prisma.year.create({ data: { year } });
        let makeRecord = await prisma.make.findFirst({ where: { name: make, yearId: yearRecord.id } });
        if (!makeRecord) makeRecord = await prisma.make.create({ data: { name: make, yearId: yearRecord.id } });
        let vehicleModel = await prisma.vehicleModel.findFirst({ where: { name: model, makeId: makeRecord.id } });
        if (!vehicleModel) vehicleModel = await prisma.vehicleModel.create({ data: { name: model, makeId: makeRecord.id } });
        if (productId && productTitle) {
          await prisma.productCompatibility.upsert({
            where: { shopifyProductId_modelId: { shopifyProductId: productId, modelId: vehicleModel.id } },
            update: { productTitle, notes: notes || null },
            create: { shopifyProductId: productId, productTitle, modelId: vehicleModel.id, notes: notes || null }
          });
        }
        imported++;
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e.message}`);
        skipped++;
      }
    }
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: errors.length > 0 && imported === 0 ? "failed" : "done",
        imported,
        skipped,
        errors: errors.length ? JSON.stringify(errors.slice(0, 50)) : null
      }
    });
    return json({ success: true, imported, skipped, errors: errors.slice(0, 10) });
  }
  return json({ error: "Unknown intent" }, { status: 400 });
};
function Import() {
  const { jobs } = useLoaderData();
  const submit = useSubmit();
  const nav = useNavigation();
  const isSubmitting = nav.state !== "idle";
  const [csvText, setCsvText] = useState("");
  const [filename, setFilename] = useState("");
  const [preview, setPreview] = useState([]);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState(null);
  const handleDrop = useCallback((_, accepted) => {
    const file = accepted[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a2;
      const text = (_a2 = e.target) == null ? void 0 : _a2.result;
      setCsvText(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  }, []);
  function parsePreview(text) {
    setParseError("");
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) {
      setParseError("File must have a header + at least one row.");
      return;
    }
    const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const required = ["year", "make", "model"];
    const missing = required.filter((r) => !header.map((h) => h.toLowerCase()).includes(r));
    if (missing.length) {
      setParseError(`Missing columns: ${missing.join(", ")}`);
      return;
    }
    const rows = lines.slice(1, 6).map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
    setPreview([header, ...rows]);
  }
  function handleImport() {
    if (!csvText) return;
    const fd = new FormData();
    fd.append("intent", "import");
    fd.append("csv", csvText);
    fd.append("filename", filename);
    submit(fd, { method: "post" });
  }
  const statusBadge = (s) => {
    if (s === "done") return /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Done" });
    if (s === "failed") return /* @__PURE__ */ jsx(Badge, { tone: "critical", children: "Failed" });
    if (s === "processing") return /* @__PURE__ */ jsx(Badge, { tone: "attention", children: "Processing" });
    return /* @__PURE__ */ jsx(Badge, { children: "Pending" });
  };
  const jobRows = jobs.map((j) => [
    j.filename,
    new Date(j.createdAt).toLocaleString(),
    statusBadge(j.status),
    j.imported,
    j.skipped
  ]);
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: "Bulk CSV Import",
      secondaryActions: [{
        content: "Download Template",
        onAction: () => {
          const csv = "year,make,model,product_id,product_title,notes\n2023,TOYOTA,LAND CRUISER,,\n2023,JEEP,WRANGLER JK,,\n";
          const blob = new Blob([csv], { type: "text/csv" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "ymm-vehicles-template.csv";
          a.click();
        }
      }],
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { title: "CSV Format", tone: "info", children: /* @__PURE__ */ jsxs("p", { children: [
          "Required columns: ",
          /* @__PURE__ */ jsx("strong", { children: "year, make, model" }),
          ". Optional: ",
          /* @__PURE__ */ jsx("strong", { children: "product_id, product_title, notes" }),
          ". Vehicles will be created automatically. You can assign products later via the Compatibility page."
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Upload CSV File" }),
          /* @__PURE__ */ jsx(DropZone, { onDrop: handleDrop, accept: ".csv,text/csv", type: "file", allowMultiple: false, children: csvText ? /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", align: "center", children: [
            /* @__PURE__ */ jsx(Icon, { source: NoteIcon }),
            /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
              filename,
              " — ",
              csvText.split("\n").length - 1,
              " rows loaded"
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "micro", onClick: () => {
              setCsvText("");
              setFilename("");
              setPreview([]);
              setParseError("");
              setResult(null);
            }, children: "Remove" })
          ] }) }) : /* @__PURE__ */ jsx(DropZone.FileUpload, { actionTitle: "Upload CSV", actionHint: "or drag and drop your .csv file here" }) }),
          parseError && /* @__PURE__ */ jsx(Banner, { tone: "critical", children: /* @__PURE__ */ jsx("p", { children: parseError }) }),
          preview.length > 1 && !parseError && /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Preview (first 5 rows):" }),
            /* @__PURE__ */ jsx(
              DataTable,
              {
                columnContentTypes: preview[0].map(() => "text"),
                headings: preview[0],
                rows: preview.slice(1)
              }
            )
          ] }),
          result && /* @__PURE__ */ jsx(Banner, { tone: result.errors.length > 0 ? "warning" : "success", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "Import complete — ",
              /* @__PURE__ */ jsxs("strong", { children: [
                result.imported,
                " imported"
              ] }),
              ", ",
              result.skipped,
              " skipped."
            ] }),
            result.errors.length > 0 && /* @__PURE__ */ jsx(List, { children: result.errors.map((e, i) => /* @__PURE__ */ jsx(List.Item, { children: e }, i)) })
          ] }) }),
          /* @__PURE__ */ jsx(InlineStack, { gap: "200", children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "primary",
              onClick: handleImport,
              disabled: !csvText || !!parseError || isSubmitting,
              loading: isSubmitting,
              children: isSubmitting ? "Importing..." : `Import ${csvText ? csvText.split("\n").length - 1 : 0} rows`
            }
          ) })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Import History" }),
          jobs.length > 0 ? /* @__PURE__ */ jsx(
            DataTable,
            {
              columnContentTypes: ["text", "text", "text", "numeric", "numeric"],
              headings: ["File", "Date", "Status", "Imported", "Skipped"],
              rows: jobRows
            }
          ) : /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "subdued", children: "No imports yet." }) })
        ] }) }) })
      ] })
    }
  );
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Import,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const loader$3 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const [totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities] = await Promise.all([
    prisma.productCompatibility.count(),
    prisma.vehicleModel.count(),
    prisma.garageVehicle.count({ where: { shop: session.shop } }),
    prisma.importJob.findFirst({ where: { shop: session.shop }, orderBy: { createdAt: "desc" } }),
    prisma.productCompatibility.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { model: { include: { make: { include: { year: true } } } } }
    })
  ]);
  return json({ totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities });
};
function Index() {
  const { totalCompatibilities, totalVehicles, totalGarage, lastImport, recentCompatibilities } = useLoaderData();
  const rows = recentCompatibilities.map((c) => [
    c.productTitle,
    `${c.model.make.year.year} ${c.model.make.name} ${c.model.name}`,
    /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" })
  ]);
  return /* @__PURE__ */ jsx(Page, { title: "YMM Parts Finder — Dashboard", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { title: "Welcome to YMM Parts Finder", tone: "info", children: /* @__PURE__ */ jsx("p", { children: "Manage vehicle compatibility, bulk import data, and view customer garage activity." }) }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineGrid, { columns: 4, gap: "400", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Vehicles in DB" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalVehicles.toLocaleString() }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Cars & trucks" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Compatibility Rules" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalCompatibilities.toLocaleString() }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Product-vehicle mappings" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Garage Vehicles" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "heading2xl", children: totalGarage.toLocaleString() }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Saved by customers" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", tone: "subdued", children: "Last Import" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", children: lastImport ? `${lastImport.imported} rows` : "—" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: lastImport ? new Date(lastImport.createdAt).toLocaleDateString() : "No imports yet" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(InlineGrid, { columns: 3, gap: "400", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Compatibility" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Add or remove which products fit which vehicles." }),
        /* @__PURE__ */ jsx(Button, { url: "/app/compatibility", variant: "primary", children: "Manage Compatibility" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Bulk CSV Import" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Upload a CSV to import thousands of rules at once." }),
        /* @__PURE__ */ jsx(Button, { url: "/app/import", children: "Import CSV" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "300", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Inventory by Vehicle" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", tone: "subdued", children: "Check live stock levels filtered by vehicle." }),
        /* @__PURE__ */ jsx(Button, { url: "/app/inventory", children: "View Inventory" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Recent Compatibility Rules" }),
      rows.length > 0 ? /* @__PURE__ */ jsx(DataTable, { columnContentTypes: ["text", "text", "text"], headings: ["Product", "Vehicle", "Status"], rows }) : /* @__PURE__ */ jsx(Box, { padding: "400", children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "subdued", children: "No rules yet. Use Bulk Import or add manually." }) }),
      /* @__PURE__ */ jsx(Button, { url: "/app/compatibility", variant: "plain", children: "View all →" })
    ] }) }) })
  ] }) });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=3600"
};
const loader$2 = async ({ request }) => {
  const url = new URL(request.url);
  const action2 = url.searchParams.get("action");
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    if (action2 === "years") {
      const years = await prisma.vehicleYear.findMany({
        orderBy: { year: "desc" },
        select: { year: true }
      });
      return json({ years: years.map((y) => y.year) }, { headers: corsHeaders });
    }
    if (action2 === "makes") {
      const year = parseInt(url.searchParams.get("year") || "");
      if (!year) return json({ error: "year required" }, { status: 400, headers: corsHeaders });
      const makes = await prisma.vehicleMake.findMany({
        where: { year: { year } },
        orderBy: { name: "asc" },
        select: { name: true }
      });
      return json({ makes: makes.map((m) => m.name) }, { headers: corsHeaders });
    }
    if (action2 === "models") {
      const year = parseInt(url.searchParams.get("year") || "");
      const make = url.searchParams.get("make") || "";
      if (!year || !make) return json({ error: "year and make required" }, { status: 400, headers: corsHeaders });
      const models = await prisma.vehicleModel.findMany({
        where: { make: { name: make, year: { year } } },
        orderBy: { name: "asc" },
        select: { id: true, name: true }
      });
      return json({ models: models.map((m) => m.name) }, { headers: corsHeaders });
    }
    if (action2 === "parts") {
      const year = parseInt(url.searchParams.get("year") || "");
      const make = url.searchParams.get("make") || "";
      const model = url.searchParams.get("model") || "";
      if (!year || !make || !model) {
        return json({ error: "year, make and model required" }, { status: 400, headers: corsHeaders });
      }
      const compatibilities = await prisma.productCompatibility.findMany({
        where: { model: { name: model, make: { name: make, year: { year } } } },
        select: { shopifyProductId: true, productTitle: true, notes: true }
      });
      return json({
        vehicle: `${year} ${make} ${model}`,
        count: compatibilities.length,
        products: compatibilities
      }, { headers: corsHeaders });
    }
    return json({ error: "Invalid action. Use: years, makes, models, parts" }, { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error("YMM API error:", error);
    return json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = {
  ActionMenu: {
    Actions: {
      moreActions: "More actions"
    },
    RollupActions: {
      rollupButton: "View actions"
    }
  },
  ActionList: {
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search",
      placeholder: "Search actions"
    }
  },
  Avatar: {
    label: "Avatar",
    labelWithInitials: "Avatar with initials {initials}"
  },
  Autocomplete: {
    spinnerAccessibilityLabel: "Loading",
    ellipsis: "{content}…"
  },
  Badge: {
    PROGRESS_LABELS: {
      incomplete: "Incomplete",
      partiallyComplete: "Partially complete",
      complete: "Complete"
    },
    TONE_LABELS: {
      info: "Info",
      success: "Success",
      warning: "Warning",
      critical: "Critical",
      attention: "Attention",
      "new": "New",
      readOnly: "Read-only",
      enabled: "Enabled"
    },
    progressAndTone: "{toneLabel} {progressLabel}"
  },
  Banner: {
    dismissButton: "Dismiss notification"
  },
  Button: {
    spinnerAccessibilityLabel: "Loading"
  },
  Common: {
    checkbox: "checkbox",
    undo: "Undo",
    cancel: "Cancel",
    clear: "Clear",
    close: "Close",
    submit: "Submit",
    more: "More"
  },
  ContextualSaveBar: {
    save: "Save",
    discard: "Discard"
  },
  DataTable: {
    sortAccessibilityLabel: "sort {direction} by",
    navAccessibilityLabel: "Scroll table {direction} one column",
    totalsRowHeading: "Totals",
    totalRowHeading: "Total"
  },
  DatePicker: {
    previousMonth: "Show previous month, {previousMonthName} {showPreviousYear}",
    nextMonth: "Show next month, {nextMonth} {nextYear}",
    today: "Today ",
    start: "Start of range",
    end: "End of range",
    months: {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December"
    },
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    daysAbbreviated: {
      monday: "Mo",
      tuesday: "Tu",
      wednesday: "We",
      thursday: "Th",
      friday: "Fr",
      saturday: "Sa",
      sunday: "Su"
    }
  },
  DiscardConfirmationModal: {
    title: "Discard all unsaved changes",
    message: "If you discard changes, you’ll delete any edits you made since you last saved.",
    primaryAction: "Discard changes",
    secondaryAction: "Continue editing"
  },
  DropZone: {
    single: {
      overlayTextFile: "Drop file to upload",
      overlayTextImage: "Drop image to upload",
      overlayTextVideo: "Drop video to upload",
      actionTitleFile: "Add file",
      actionTitleImage: "Add image",
      actionTitleVideo: "Add video",
      actionHintFile: "or drop file to upload",
      actionHintImage: "or drop image to upload",
      actionHintVideo: "or drop video to upload",
      labelFile: "Upload file",
      labelImage: "Upload image",
      labelVideo: "Upload video"
    },
    allowMultiple: {
      overlayTextFile: "Drop files to upload",
      overlayTextImage: "Drop images to upload",
      overlayTextVideo: "Drop videos to upload",
      actionTitleFile: "Add files",
      actionTitleImage: "Add images",
      actionTitleVideo: "Add videos",
      actionHintFile: "or drop files to upload",
      actionHintImage: "or drop images to upload",
      actionHintVideo: "or drop videos to upload",
      labelFile: "Upload files",
      labelImage: "Upload images",
      labelVideo: "Upload videos"
    },
    errorOverlayTextFile: "File type is not valid",
    errorOverlayTextImage: "Image type is not valid",
    errorOverlayTextVideo: "Video type is not valid"
  },
  EmptySearchResult: {
    altText: "Empty search results"
  },
  Frame: {
    skipToContent: "Skip to content",
    navigationLabel: "Navigation",
    Navigation: {
      closeMobileNavigationLabel: "Close navigation"
    }
  },
  FullscreenBar: {
    back: "Back",
    accessibilityLabel: "Exit fullscreen mode"
  },
  Filters: {
    moreFilters: "More filters",
    moreFiltersWithCount: "More filters ({count})",
    filter: "Filter {resourceName}",
    noFiltersApplied: "No filters applied",
    cancel: "Cancel",
    done: "Done",
    clearAllFilters: "Clear all filters",
    clear: "Clear",
    clearLabel: "Clear {filterName}",
    addFilter: "Add filter",
    clearFilters: "Clear all",
    searchInView: "in:{viewName}"
  },
  FilterPill: {
    clear: "Clear",
    unsavedChanges: "Unsaved changes - {label}"
  },
  IndexFilters: {
    searchFilterTooltip: "Search and filter",
    searchFilterTooltipWithShortcut: "Search and filter (F)",
    searchFilterAccessibilityLabel: "Search and filter results",
    sort: "Sort your results",
    addView: "Add a new view",
    newView: "Custom search",
    SortButton: {
      ariaLabel: "Sort the results",
      tooltip: "Sort",
      title: "Sort by",
      sorting: {
        asc: "Ascending",
        desc: "Descending",
        az: "A-Z",
        za: "Z-A"
      }
    },
    EditColumnsButton: {
      tooltip: "Edit columns",
      accessibilityLabel: "Customize table column order and visibility"
    },
    UpdateButtons: {
      cancel: "Cancel",
      update: "Update",
      save: "Save",
      saveAs: "Save as",
      modal: {
        title: "Save view as",
        label: "Name",
        sameName: "A view with this name already exists. Please choose a different name.",
        save: "Save",
        cancel: "Cancel"
      }
    }
  },
  IndexProvider: {
    defaultItemSingular: "Item",
    defaultItemPlural: "Items",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} are selected",
    selected: "{selectedItemsCount} selected",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}"
  },
  IndexTable: {
    emptySearchTitle: "No {resourceNamePlural} found",
    emptySearchDescription: "Try changing the filters or search term",
    onboardingBadgeText: "New",
    resourceLoadingAccessibilityLabel: "Loading {resourceNamePlural}…",
    selectAllLabel: "Select all {resourceNamePlural}",
    selected: "{selectedItemsCount} selected",
    undo: "Undo",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural}",
    selectItem: "Select {resourceName}",
    selectButtonText: "Select",
    sortAccessibilityLabel: "sort {direction} by"
  },
  Loading: {
    label: "Page loading bar"
  },
  Modal: {
    iFrameTitle: "body markup",
    modalWarning: "These required properties are missing from Modal: {missingProps}"
  },
  Page: {
    Header: {
      rollupActionsLabel: "View actions for {title}",
      pageReadyAccessibilityLabel: "{title}. This page is ready"
    }
  },
  Pagination: {
    previous: "Previous",
    next: "Next",
    pagination: "Pagination"
  },
  ProgressBar: {
    negativeWarningMessage: "Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.",
    exceedWarningMessage: "Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."
  },
  ResourceList: {
    sortingLabel: "Sort by",
    defaultItemSingular: "item",
    defaultItemPlural: "items",
    showing: "Showing {itemsCount} {resource}",
    showingTotalCount: "Showing {itemsCount} of {totalItemsCount} {resource}",
    loading: "Loading {resource}",
    selected: "{selectedItemsCount} selected",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} in your store are selected",
    allFilteredItemsSelected: "All {itemsLength}+ {resourceNamePlural} in this filter are selected",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural} in your store",
    selectAllFilteredItems: "Select all {itemsLength}+ {resourceNamePlural} in this filter",
    emptySearchResultTitle: "No {resourceNamePlural} found",
    emptySearchResultDescription: "Try changing the filters or search term",
    selectButtonText: "Select",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}",
    Item: {
      actionsDropdownLabel: "Actions for {accessibilityLabel}",
      actionsDropdown: "Actions dropdown",
      viewItem: "View details for {itemName}"
    },
    BulkActions: {
      actionsActivatorLabel: "Actions",
      moreActionsActivatorLabel: "More actions"
    }
  },
  SkeletonPage: {
    loadingLabel: "Page loading"
  },
  Tabs: {
    newViewAccessibilityLabel: "Create new view",
    newViewTooltip: "Create view",
    toggleTabsLabel: "More views",
    Tab: {
      rename: "Rename view",
      duplicate: "Duplicate view",
      edit: "Edit view",
      editColumns: "Edit columns",
      "delete": "Delete view",
      copy: "Copy of {name}",
      deleteModal: {
        title: "Delete view?",
        description: "This can’t be undone. {viewName} view will no longer be available in your admin.",
        cancel: "Cancel",
        "delete": "Delete view"
      }
    },
    RenameModal: {
      title: "Rename view",
      label: "Name",
      cancel: "Cancel",
      create: "Save",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    DuplicateModal: {
      title: "Duplicate view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    CreateViewModal: {
      title: "Create new view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    }
  },
  Tag: {
    ariaLabel: "Remove {children}"
  },
  TextField: {
    characterCount: "{count} characters",
    characterCountWithMaxLength: "{count} of {limit} characters used"
  },
  TooltipOverlay: {
    accessibilityLabel: "Tooltip: {label}"
  },
  TopBar: {
    toggleMenuLabel: "Toggle menu",
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search"
    }
  },
  MediaCard: {
    dismissButton: "Dismiss",
    popoverButton: "Actions"
  },
  VideoThumbnail: {
    playButtonA11yLabel: {
      "default": "Play video",
      defaultWithDuration: "Play video of length {duration}",
      duration: {
        hours: {
          other: {
            only: "{hourCount} hours",
            andMinutes: "{hourCount} hours and {minuteCount} minutes",
            andMinute: "{hourCount} hours and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hours, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hours, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hours, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hours and {secondCount} seconds",
            andSecond: "{hourCount} hours and {secondCount} second"
          },
          one: {
            only: "{hourCount} hour",
            andMinutes: "{hourCount} hour and {minuteCount} minutes",
            andMinute: "{hourCount} hour and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hour, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hour, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hour, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hour and {secondCount} seconds",
            andSecond: "{hourCount} hour and {secondCount} second"
          }
        },
        minutes: {
          other: {
            only: "{minuteCount} minutes",
            andSeconds: "{minuteCount} minutes and {secondCount} seconds",
            andSecond: "{minuteCount} minutes and {secondCount} second"
          },
          one: {
            only: "{minuteCount} minute",
            andSeconds: "{minuteCount} minute and {secondCount} seconds",
            andSecond: "{minuteCount} minute and {secondCount} second"
          }
        },
        seconds: {
          other: "{secondCount} seconds",
          one: "{secondCount} second"
        }
      }
    }
  }
};
const englishI18n = {
  Polaris
};
const APP_BRIDGE_URL = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
const RemixPolarisLink = React.forwardRef((props, ref) => jsx(Link, { ...props, to: props.url ?? props.to, ref }));
function AppProvider(props) {
  const { children, apiKey, i18n, isEmbeddedApp = true, __APP_BRIDGE_URL = APP_BRIDGE_URL, ...polarisProps } = props;
  return jsxs(Fragment, { children: [isEmbeddedApp && jsx("script", { src: __APP_BRIDGE_URL, "data-api-key": apiKey }), jsx(AppProvider$1, { ...polarisProps, linkComponent: RemixPolarisLink, i18n: i18n || englishI18n, children })] });
}
createContext(null);
const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsx(AppProvider, { apiKey, isEmbeddedApp: true, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BMVHlWtb.js", "imports": ["/assets/components-BNdW9vrW.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-BDt2lil-.js", "imports": ["/assets/components-BNdW9vrW.js"], "css": [] }, "routes/app.compatibility": { "id": "routes/app.compatibility", "parentId": "routes/app", "path": "compatibility", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.compatibility-BwFEfZ5_.js", "imports": ["/assets/components-BNdW9vrW.js", "/assets/Page-2Ork6o4r.js", "/assets/InlineGrid-DsNx9Fb0.js", "/assets/Select-B_niDmQF.js", "/assets/context-TqNDrU7E.js", "/assets/context-j4LxaSSK.js"], "css": [] }, "routes/app.inventory": { "id": "routes/app.inventory", "parentId": "routes/app", "path": "inventory", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.inventory-G32PqCF2.js", "imports": ["/assets/components-BNdW9vrW.js", "/assets/Page-2Ork6o4r.js", "/assets/InlineGrid-DsNx9Fb0.js", "/assets/Select-B_niDmQF.js", "/assets/context-TqNDrU7E.js"], "css": [] }, "routes/api.garage": { "id": "routes/api.garage", "parentId": "root", "path": "api/garage", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.garage-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app.import": { "id": "routes/app.import", "parentId": "routes/app", "path": "import", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.import-2xvn5H3Z.js", "imports": ["/assets/components-BNdW9vrW.js", "/assets/Page-2Ork6o4r.js", "/assets/context-TqNDrU7E.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-DXPcKoV8.js", "imports": ["/assets/components-BNdW9vrW.js", "/assets/Page-2Ork6o4r.js", "/assets/InlineGrid-DsNx9Fb0.js", "/assets/context-TqNDrU7E.js"], "css": [] }, "routes/api.ymm": { "id": "routes/api.ymm", "parentId": "root", "path": "api/ymm", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.ymm-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-DUk__qsH.js", "imports": ["/assets/components-BNdW9vrW.js", "/assets/context-TqNDrU7E.js", "/assets/context-j4LxaSSK.js"], "css": [] } }, "url": "/assets/manifest-25311d19.js", "version": "25311d19" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/app.compatibility": {
    id: "routes/app.compatibility",
    parentId: "routes/app",
    path: "compatibility",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/app.inventory": {
    id: "routes/app.inventory",
    parentId: "routes/app",
    path: "inventory",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/api.garage": {
    id: "routes/api.garage",
    parentId: "root",
    path: "api/garage",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/app.import": {
    id: "routes/app.import",
    parentId: "routes/app",
    path: "import",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/api.ymm": {
    id: "routes/api.ymm",
    parentId: "root",
    path: "api/ymm",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
