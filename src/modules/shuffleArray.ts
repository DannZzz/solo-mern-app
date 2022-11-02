function shuffleArray<T extends any[]>(array: T): T;
function shuffleArray<T extends any[]>(array: T, changeThis: boolean): void;
function shuffleArray<T extends any[]>(
  _array: T,
  changeThis: boolean = false
): T | void {
  let array = _array;
  if (!changeThis) array = [..._array] as any;
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  if (!changeThis) return array;
}
