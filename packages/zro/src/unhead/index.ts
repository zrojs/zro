// import { useUnhead } from "@unhead/react";
// import { useEffect, useMemo, useRef, useState } from "react";

export * from "@unhead/react";
export * from "@unhead/react/client";
export { Head } from "./Head";

// export const useHead = (input: any, options: any, fn: any) => {
//   const unhead = useUnhead();
//   const [entry] = useState(() => unhead.push(input));
//   useEffect(() => {
//     entry.patch(input);
//   }, [input]);
//   useEffect(() => {
//     return () => {
//       // unmount
//       entry.dispose();
//     };
//   }, []);
//   return entry;
// };
