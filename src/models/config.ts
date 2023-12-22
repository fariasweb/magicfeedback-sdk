export class Config {
    private variables: Record<string, any>;

    constructor() {
      this.variables = {};

      this.variables["url"] = "https://mvp-dot-feedbackai-380013.lm.r.appspot.com/";
      this.variables["debug"] = false;
    }

    public get<T>(key: string): T | undefined {
      return this.variables[key];
    }

    public set<T>(key: string, value: T): void {
      this.variables[key] = value;
    }
  }
