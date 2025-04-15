export {
  Head,
  hookImports,
  useHead,
  useHeadSafe,
  useScript,
  useSeoMeta,
  useUnhead,
} from "@unhead/react";
export {
  createHead,
  renderDOMHead,
  UnheadProvider,
} from "@unhead/react/client";

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
