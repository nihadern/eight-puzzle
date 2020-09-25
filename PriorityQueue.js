class PriorityQueue {
  constructor(compare = (a, b) => a > b) {
    this.items = [];
    this.compare = compare;
  }

  enqueue(element) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.compare(this.items[i], element)) {
        this.items.splice(i, 0, element);
        return;
      }
    }
    this.items.push(element);
  }

  dequeue() {
    if (this.isEmpty()) throw "PQ is empty!";
    return this.items.shift();
  }

  peek() {
    if (this.isEmpty()) throw "PQ is empty!";
    return this.items[0];
  }

  isEmpty() {
    // return true if the queue is empty.
    return this.items.length === 0;
  }

  length() {
    return this.items.length;
  }
}
