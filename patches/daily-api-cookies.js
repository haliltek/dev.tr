"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthentication = exports.setCookie = exports.setRawCookie = exports.extractRootDomain = exports.cookies = void 0;
const constants_1 = require("./common/constants");
const ids_1 = require("./ids");
const tracking_1 = require("./tracking");
const telemetry_1 = require("./telemetry");
const env = process.env.NODE_ENV;
exports.cookies = {
    tracking: {
        opts: {
            maxAge: 60 * 60 * 24 * 365 * 10,
            httpOnly: false,
            signed: false,
            secure: env === 'production',
            sameSite: env === 'production' ? 'none' : 'lax',
        },
        key: 'da2',
    },
    session: {
        opts: {
            maxAge: 60 * 30,
            httpOnly: false,
            signed: false,
            secure: false,
            sameSite: 'lax',
        },
        key: 'das',
    },
    auth: {
        opts: {
            maxAge: 60 * 15,
            httpOnly: true,
            signed: true,
            secure: env === 'production',
            sameSite: 'lax',
        },
        key: 'da3',
    },
    funnel: {
        opts: {
            maxAge: 60 * 30,
            httpOnly: true,
            signed: false,
            secure: env === 'production',
            sameSite: 'lax',
        },
        key: 'da4',
    },
    onboarding: {
        opts: {
            maxAge: 60 * 30,
            httpOnly: true,
            signed: false,
            secure: env === 'production',
            sameSite: 'lax',
        },
        key: 'da5',
    },
    authSession: {
        key: env === 'production' ? '__Secure-dast' : 'dast',
        opts: {
            maxAge: constants_1.ONE_MONTH_IN_SECONDS,
            signed: false,
            httpOnly: true,
            secure: env === 'production',
            sameSite: 'lax',
        },
    },
};
const extractRootDomain = (hostname) => {
    if (!hostname) return undefined;
    const host = hostname.split(':')[0];
    if (host === '127.0.0.1' || host === 'localhost' || require('net').isIP(host)) {
        return undefined;
    }
    const parts = host.split('.');
    while (parts.length > 2) {
        parts.shift();
    }
    return parts.join('.');
};
exports.extractRootDomain = extractRootDomain;
const extractDomain = (req) => (0, exports.extractRootDomain)(req.hostname);
const addSubdomainOpts = (req, opts) => {
    const domain = extractDomain(req);
    if (!domain) {
        const { domain: _, ...rest } = opts;
        return rest;
    }
    return {
        ...opts,
        domain,
    };
};
const setRawCookie = (res, setCookieValue) => {
    let setCookie = res.getHeader('Set-Cookie');
    if (!setCookie) {
        res.header('Set-Cookie', setCookieValue);
        return res;
    }
    if (typeof setCookie === 'string') {
        setCookie = [setCookie];
    }
    if (typeof setCookie !== 'number') {
        setCookie.push(setCookieValue);
    }
    res.removeHeader('Set-Cookie');
    return res.header('Set-Cookie', setCookie);
};
exports.setRawCookie = setRawCookie;
const setCookie = (req, res, key, value, opts = {}) => {
    const config = exports.cookies[key];
    const mergedOpts = {
        path: '/',
        ...addSubdomainOpts(req, config.opts),
        ...opts,
    };
    if (!value) {
        return res.clearCookie(config.key, mergedOpts);
    }
    return res.cookie(config.key, value, mergedOpts);
};
exports.setCookie = setCookie;
const clearCookieByName = (req, res, key, opts = {}) => res.clearCookie(key, {
    path: '/',
    ...addSubdomainOpts(req, {}),
    ...opts,
});
const clearAuthentication = async (req, res, reason) => {
    var _a, _b;
    req.log.info({
        reason,
        userId: req.userId,
    }, 'clearing authentication');
    req.trackingId = await (0, ids_1.generateTrackingId)(req, 'clear authentication');
    req.userId = undefined;
    (0, tracking_1.setTrackingId)(req, res, req.trackingId);
    (0, exports.setCookie)(req, res, 'auth', undefined);
    (0, exports.setCookie)(req, res, 'authSession', undefined);
    clearCookieByName(req, res, 'ory_kratos_session', {
        httpOnly: true,
        sameSite: 'lax',
        secure: env === 'production',
    });
    clearCookieByName(req, res, 'ory_kratos_continuity');
    (_b = (_a = telemetry_1.counters === null || telemetry_1.counters === void 0 ? void 0 : telemetry_1.counters.api) === null || _a === void 0 ? void 0 : _a.clearAuthentication) === null || _b === void 0 ? void 0 : _b.add(1, { reason });
};
exports.clearAuthentication = clearAuthentication;
