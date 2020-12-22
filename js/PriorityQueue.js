class PriorityQueue {
  // custom min heap priority queue for effieciency
  constructor(compare = (a, b) => a < b) {
    // items is the heap and compare defines the min comparison
    // heap is implemented as an array
    this.items = [];
    this.compare = compare;
  }

  enqueue(element) {
    // enqueue adds an element to the
    this.items.push(element);
    let index = this.items.length - 1;
    let parentIndex = this.parent(index);
    // move the element down till heapify is complete
    while (index > 0 && this.compare(element, this.items[parentIndex])) {
      this.swap(index, parentIndex);
      index = parentIndex;
      parentIndex = this.parent(index);
    }
  }

  parent(childIndex) {
    // returns the index of a parent in heap
    return Math.floor((childIndex - 1) / 2);
  }

  children(parentIndex) {
    // returns the children of the parent
    return [2 * parentIndex, 2 * parentIndex + 1];
  }

  dequeue() {
    // returns the min element and reheapifies
    const min = this.items[0];
    const end = this.items.pop();
    this.items[0] = end;
    // reheapify by swapping the end item and placing it at the right place
    // in the heap
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
    // utility function to get the swap elements in heap
    let temp = this.items[indexA];
    this.items[indexA] = this.items[indexB];
    this.items[indexB] = temp;
  }
  peek() {
    // returns the first element without removing it
    if (this.isEmpty()) throw "PQ is empty!";
    return this.items[0];
  }

  isEmpty() {
    // return true if the queue is empty.
    return this.items.length === 0;
  }

  length() {
    // utility function for length
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
