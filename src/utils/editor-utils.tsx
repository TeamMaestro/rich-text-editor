export class EditorUtils {

  static isStyle(element: HTMLElement, tags: string[] = [], styles: string[] = []): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      let res = false;

      for (let i = 0; i < tags.length; i++) {
        res = await this.isTag(element, tags[i]);
        if (res) {
          resolve(res);
          return;
        }
      }

      for (let i = 0; i < styles.length; i++) {
        res = !!(element.style[styles[i]]);

        if (res) {
          resolve(res);
          return;
        }
      }

      resolve(res);
      return;
    });
  }

  private static isTag(element: HTMLElement, tagName: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (!element) {
        resolve(false);
        return;
      }

      if (element.id === 'text-content') {
        resolve(false);
        return;
      }

      if (element.nodeName.toLowerCase() === tagName) {
        resolve(true);
        return;
      }

      const parentElement = element.parentNode as HTMLElement;
      if (parentElement && parentElement.id !== 'text-content') {
        resolve(await this.isTag(parentElement, tagName));
      }

      resolve(false);
    });
  }

}
