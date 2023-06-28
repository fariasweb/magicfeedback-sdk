import { Config } from "./config";

export class Log {
  /**
   * Attributes
   */
  private config: Config;

  /**
   * 
   * @param config 
   */
  constructor(config: Config) {
    // Config
    this.config = config;
  }

  /**
   *
   * @param args
   */
  public log(...args: any[]) {
    if (this.config.get("debug")) {
      console.log("[MagicFeedback]:", ...args);
    }
  }

  /**
   *
   * @param args
   */
  public err(...args: any[]): never {
    if (this.config.get("debug")) {
      console.error("[MagicFeedback]:", ...args);
    }
    throw new Error(...args);
  }
}
