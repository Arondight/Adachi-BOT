class Mutex {
  constructor() {
    this._acquired = false;
    this._waitingList = [];
  }

  get isAcquired() {
    return this._acquired;
  }

  async acquire() {
    if (!this._acquired) {
      this._acquired = true;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this._waitingList.push(resolve);
    });
  }

  release() {
    if (!this._acquired) {
      throw new Error(`Cannot release an unacquired lock`);
    }

    if (this._waitingList.length > 0) {
      const resolve = this._waitingList.shift();
      resolve();
    } else {
      this._acquired = false;
    }
  }
}

export { Mutex };
