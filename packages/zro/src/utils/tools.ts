import { set, merge, cloneDeep, upperFirst } from "es-toolkit/compat";

export const toMerged = <O, S>(object: O, source: S) => {
  return merge(cloneDeep(object), source);
};

export { set, merge, cloneDeep, upperFirst };
