export default function forEachChild(parent: HTMLElement | Element, fn: (element: Element) => any) {
    const children = parent.children;
    for (let i = 0; i < children.length; i++) {
        fn(children[i]);
    }
}