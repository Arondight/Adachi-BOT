import { JSONFileSync, MemorySync } from "lowdb";

class LowJSONCacheSync {
  constructor(filename) {
    if ("string" === typeof filename && "" !== filename) {
      this._filename = filename;
      this._cacheAdapter = new MemorySync();
      this._fileAdapter = new JSONFileSync(filename);
    } else {
      throw Error("Wrong filename");
    }
  }

  // return string or undefined
  file() {
    return this._filename;
  }

  // return object or undefined
  read() {
    try {
      this.data = this._cacheAdapter.read();
      return this.data;
    } catch (e) {
      // do nothing
    }
  }

  // return boolean
  write(obj) {
    try {
      if (obj) {
        this._cacheAdapter.write(obj);
        return true;
      }
    } catch (e) {
      // do nothing
    }

    return false;
  }

  // return object or undefined
  load() {
    try {
      this.data = this._fileAdapter.read();
      return this.data;
    } catch (e) {
      // do nothing
    }
  }

  // return boolean
  sync() {
    try {
      if (this.data) {
        this._fileAdapter.write(this.data);
        return true;
      }
    } catch (e) {
      // do nothing
    }

    return false;
  }
}

export { LowJSONCacheSync };
