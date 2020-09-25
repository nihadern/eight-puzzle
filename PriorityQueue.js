class PriorityQueue {
  constructor(compare = (a, b) => a < b) {
    this.items = [];
    this.compare = compare;
  }

  enqueue(element) {
    this.items.push(element);
    let index = this.items.length - 1;
    let parentIndex = this.parent(index);

    while (index > 0 && this.compare(element, this.items[parentIndex])) {
      this.swap(index, parentIndex);
      index = parentIndex;
      parentIndex = this.parent(index);
    }
  }

  parent(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  children(parentIndex) {
    return [2 * parentIndex, 2 * parentIndex + 1];
  }

  dequeue() {
    const min = this.items[0];
    const end = this.items.pop();
    this.items[0] = end;

    let currIndex = 0;
    while (true) {
      let [leftChildIndex, rightChildIndex] = this.children(currIndex);
      let swapIndex = null;

      if (leftChildIndex < this.items.length)
        if (this.compare(this.items[leftChildIndex], this.items[currIndex]))
          swapIndex = leftChildIndex;

      if (rightChildIndex < this.items.length)
        if (
          (swapIndex === null &&
            this.compare(this.items[rightChildIndex], this.items[currIndex])) ||
          (swapIndex !== null &&
            this.compare(
              this.items[rightChildIndex],
              this.items[leftChildIndex]
            ))
        )
          swapIndex = rightChildIndex;

      if (swapIndex === null) break;
      this.swap(swapIndex, currIndex);
      currIndex = swapIndex;
    }

    return min;
  }

  swap(indexA, indexB) {
    let temp = this.items[indexA];
    this.items[indexA] = this.items[indexB];
    this.items[indexB] = temp;
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

// const pq = new PriorityQueue();

// for (let i = 0; i < 10; i++) {
//   pq.enqueue(i);
//   console.log(pq.items);
// }

// for (let i = 0; i < 10; i++) {
//   console.log(pq.dequeue());
// }
