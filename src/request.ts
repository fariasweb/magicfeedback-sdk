import modulePackage from "../package.json";
import fetch from "cross-fetch";

export class Request {
  /**
   * Attributes
   */

  /**
   *
   */
  constructor() {}

  /**
   *
   * @param url
   * @param body
   * @returns
   */
  public async post(url: string, body: any) {
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
  public async get(url: string, params: any) {
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
}
