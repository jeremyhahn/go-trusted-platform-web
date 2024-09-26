// utils/cookie.js
export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export function setCookie(name, value, options = {}) {
  if (typeof document === "undefined") return;
  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  if (options.expires) {
    updatedCookie += "; expires=" + options.expires.toUTCString();
  }

  if (options.path) {
    updatedCookie += "; path=" + options.path;
  } else {
    updatedCookie += "; path=/";
  }

  if (options.domain) {
    updatedCookie += "; domain=" + options.domain;
  }

  if (options.secure) {
    updatedCookie += "; secure";
  }

  if (options.sameSite) {
    updatedCookie += "; samesite=" + options.sameSite;
  }

  document.cookie = updatedCookie;
}

export function deleteCookie(name) {
  setCookie(name, "", {
    "max-age": -1,
  });
}
