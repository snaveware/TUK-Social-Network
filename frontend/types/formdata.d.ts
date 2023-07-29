// declare global {
//   let FormData: {
//     prototype: FormData;
//     new (form?: HTMLFormElement): FormData;
//   };

//   interface FormDataValue {
//     uri: string;
//     name: string;
//     type: string;
//   }

//   interface FormData {
//     append(
//       name: string,
//       value: string | Blob | FormDataValue,
//       fileName?: string
//     ): void;
//     delete(name: string): void;
//     get(name: string): FormDataEntryValue | null;
//     getAll(name: string): FormDataEntryValue[];
//     has(name: string): boolean;
//     set(
//       name: string,
//       value: string | Blob | FormDataValue,
//       fileName?: string
//     ): void;
//   }

//   interface FormData {
//     entries(): IterableIterator<[string, string | File]>;
//     keys(): IterableIterator<string>;
//     values(): IterableIterator<string | File>;
//     [Symbol.iterator](): IterableIterator<string | File>;
//   }
// }
