import modulePackage from "../package.json";
import fetch from "cross-fetch";

/**
 *
 * @param url x
 * @param body
 * @returns
 */
export async function requestPOST(url: string, body: any) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Magicfeedback-Sdk-Version": modulePackage.version,
    },
    body: JSON.stringify(body),
  });
}

/**
 *
 * @param url
 * @param body
 * @returns
 */
export async function requestGET(url: string, params: any) {
  const serializedParams = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&");

  const requestUrl = `${url}?${serializedParams}`;

  return fetch(requestUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Magicfeedback-Sdk-Version": modulePackage.version,
    },
  }).then((res) => {
    if (res.status >= 400) {
      throw new Error("[MagicFeedback] Bad response from server");
    }
    return res.json();
  });
}
